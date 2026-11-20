#!/usr/bin/env node
// Optional maintenance command. Reachability does not establish playability.
import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCatalog, publicUrl } from './validate.mjs';

export function isPublicAddress(address) {
  const family = isIP(address);
  if (family === 4) {
    const [a, b, c] = address.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113));
  }
  if (family === 6) {
    const lower = address.toLowerCase();
    // Only global unicast 2000::/3; excludes mapped IPv4, local, link-local and multicast.
    const second = parseInt(lower.split(':')[1] || '0', 16);
    return /^[23][0-9a-f]{3}:/.test(lower) &&
      !(lower.startsWith('2001:') && second < 0x200) &&
      !lower.startsWith('2001:db8:') && !lower.startsWith('2002:') && !lower.startsWith('3fff:');
  }
  return false;
}

async function resolvePublic(hostname, timeoutMs) {
  let timer;
  try {
    const addresses = await Promise.race([
      lookup(hostname, { all: true, verbatim: true }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('DNS timeout')), timeoutMs); })
    ]);
    if (!addresses.length || addresses.some((entry) => !isPublicAddress(entry.address))) throw new Error('DNS points to a blocked or nonpublic address');
    return addresses.find((entry) => entry.family === 4) || addresses[0];
  } finally { clearTimeout(timer); }
}

function requestOnce(url, address, method, timeoutMs) {
  return new Promise((resolveResult, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    let settled = false;
    let timer;
    const finish = (fn, value) => { if (!settled) { settled = true; clearTimeout(timer); fn(value); } };
    const request = transport.request(url, {
      method,
      agent: false,
      family: address.family,
      servername: url.hostname,
      // Pin the validated address, preventing a second DNS lookup during connection.
      lookup: (_host, options, callback) => {
        if (typeof options === 'function') callback = options;
        if (options?.all) callback(null, [address]);
        else callback(null, address.address, address.family);
      },
      headers: { 'User-Agent': 'AI4FUN-LinkReview/1.0 (+https://github.com/zz11ss11zz/AI4FUN)', Accept: 'text/html,application/json;q=0.8,*/*;q=0.1', ...(method === 'GET' ? { Range: 'bytes=0-0' } : {}) }
    }, (response) => {
      finish(resolveResult, { status: response.statusCode || 0, location: response.headers.location });
      response.destroy();
    });
    timer = setTimeout(() => { request.destroy(new Error('Request timeout')); }, timeoutMs);
    request.on('error', (error) => finish(reject, error));
    request.end();
  });
}

export async function checkUrl(original, { timeoutMs = 10000, maxRedirects = 4 } = {}) {
  let current = original;
  try {
    for (let depth = 0; depth <= maxRedirects; depth++) {
      if (!publicUrl(current)) return { url: original, finalUrl: current, state: 'blocked', reason: 'Only public http(s) hostnames without credentials or unusual ports are allowed' };
      const url = new URL(current);
      const address = await resolvePublic(url.hostname, timeoutMs);
      let response = await requestOnce(url, address, 'HEAD', timeoutMs);
      if ([405, 501].includes(response.status)) response = await requestOnce(url, address, 'GET', timeoutMs);
      if ([301, 302, 303, 307, 308].includes(response.status) && response.location) {
        current = new URL(response.location, url).href;
        continue;
      }
      const state = response.status >= 200 && response.status < 400 ? 'reachable' : [401, 403, 429].includes(response.status) ? 'restricted' : 'needs-review';
      return { url: original, finalUrl: current, status: response.status, state };
    }
    return { url: original, finalUrl: current, state: 'needs-review', reason: 'Too many redirects' };
  } catch (error) {
    return { url: original, finalUrl: current, state: 'needs-review', reason: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  let output;
  let selected;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) output = resolve(args[++i]);
    else if (args[i] === '--project' && args[i + 1]) selected = args[++i];
    else if (args[i] === '--help') { console.log('node scripts/check-links.mjs [--project <id>] [--output /path/report.json]\nChecks public links with bounded requests. Does not execute projects, scrape pages or prove playability.'); return; }
    else throw new Error(`Unknown or incomplete argument: ${args[i]}`);
  }
  const [projects, sources] = await readCatalog();
  const selection = selected ? projects.filter((item) => item.id === selected) : projects;
  if (selected && !selection.length) throw new Error(`Unknown project: ${selected}`);
  const urls = [...new Set([
    ...selection.flatMap((project) => [project.creator.url, ...Object.values(project.links), ...project.evidence.map((entry) => entry.url)]),
    ...(selected ? [] : sources.map((source) => source.url))
  ].filter((value) => typeof value === 'string' && /^https?:/.test(value)))];
  const results = new Array(urls.length);
  let next = 0;
  await Promise.all(Array.from({length: Math.min(4, urls.length)}, async () => {
    while (next < urls.length) {
      const index = next++;
      results[index] = await checkUrl(urls[index]);
      const entry = results[index];
      console.log(`${entry.state.padEnd(12)} ${entry.status || '-'} ${entry.url}${entry.reason ? ` (${entry.reason})` : ''}`);
    }
  }));
  const summary = results.reduce((counts, item) => { counts[item.state] = (counts[item.state] || 0) + 1; return counts; }, {});
  if (output) await writeFile(output, `${JSON.stringify({checkedAt: new Date().toISOString(), scope: selected || 'catalog', notice: 'HTTP reachability only; not an independent playability or safety review.', summary, results}, null, 2)}\n`);
  console.log(`\nChecked ${results.length} URLs. ${JSON.stringify(summary)}\nRestricted or failed requests need human review; do not automatically remove projects or relabel them as tested.`);
  if (results.some((entry) => ['blocked', 'needs-review'].includes(entry.state))) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(`Link review failed: ${error.message}`); process.exitCode = 1; });
}
