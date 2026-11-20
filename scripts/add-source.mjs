#!/usr/bin/env node
import { open, readFile, rename, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, publicUrl, canonicalUrl, categories } from './validate.mjs';

const help = `Add a manually reviewed source to AI4FUN. No network requests are made.\n\nnode scripts/add-source.mjs --id creator-name --name '创作者名称' \\\n  --url 'https://example.org/works' --type creator --language en \\\n  --scope game,interactive --description '这个来源值得跟踪的原因'\n\nRequired: --id, --name, --url, --description\nOptional: --type creator|platform|festival|repository (creator)\n          --language zh|en|multi (en)\n          --scope interactive,game,film,music (interactive)\n          --dry-run (print the record without saving)\n          --help\n\nA source is a discovery lead. Its projects still require individual review.`;
const allowed = new Set(['id', 'name', 'url', 'type', 'language', 'scope', 'description', 'help', 'dry-run']);
const flags = {};
let lock;
const target = resolve(root, 'data/sources.json');
const lockPath = resolve(root, 'data/.sources.lock');
let temp;
try {
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (!arg.startsWith('--') || !allowed.has(arg.slice(2))) throw new Error(`Unknown argument: ${arg}`);
    const key = arg.slice(2);
    if (key in flags) throw new Error(`Duplicate flag: ${arg}`);
    if (['help', 'dry-run'].includes(key)) flags[key] = true;
    else {
      const value = process.argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      flags[key] = value.trim();
    }
  }
  if (flags.help) { console.log(help); process.exit(0); }
  for (const key of ['id', 'name', 'url', 'description']) if (!flags[key]) throw new Error(`--${key} is required`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(flags.id)) throw new Error('--id must be a lowercase slug');
  if (!publicUrl(flags.url, { httpsOnly: true })) throw new Error('--url must be a public HTTPS URL without credentials or a local/IP host');
  const item = {id: flags.id, name: flags.name, url: flags.url, type: flags.type || 'creator', language: flags.language || 'en', status: 'manual', scope: [...new Set((flags.scope || 'interactive').split(',').map((value) => value.trim()))], description: flags.description, addedAt: new Date().toISOString().slice(0, 10)};
  if (!['creator', 'platform', 'festival', 'repository'].includes(item.type)) throw new Error('Invalid --type');
  if (!['zh', 'en', 'multi'].includes(item.language)) throw new Error('Invalid --language');
  if (!item.scope.length || !item.scope.every((value) => categories.includes(value))) throw new Error('Invalid --scope');
  if (flags['dry-run']) { console.log(JSON.stringify(item, null, 2)); process.exit(0); }
  lock = await open(lockPath, 'wx', 0o600).catch((error) => { if (error.code === 'EEXIST') throw new Error('Another source update is in progress. If it crashed, inspect data/.sources.lock before removing it.'); throw error; });
  const sources = JSON.parse(await readFile(target, 'utf8'));
  if (!Array.isArray(sources)) throw new Error('sources.json must contain an array');
  if (sources.some((source) => source.id === item.id)) throw new Error(`Source id already exists: ${item.id}`);
  if (sources.some((source) => canonicalUrl(source.url) === canonicalUrl(item.url))) throw new Error('This source URL is already registered');
  temp = `${target}.${process.pid}.tmp`;
  const handle = await open(temp, 'wx', 0o644);
  try { await handle.writeFile(`${JSON.stringify([...sources, item], null, 2)}\n`); await handle.sync(); }
  finally { await handle.close(); }
  await rename(temp, target); temp = null;
  console.log(`Added ${item.name} (${item.id}) as a manual source. Review individual projects before publishing them.`);
} catch (error) { console.error(`Source not added: ${error.message}`); process.exitCode = 1; }
finally {
  if (temp) await unlink(temp).catch(() => {});
  if (lock) { await lock.close(); await unlink(lockPath).catch(() => {}); }
}
