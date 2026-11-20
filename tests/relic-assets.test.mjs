import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES } from '../public/games/relic-run/themes.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = path.join(projectRoot, 'public');
const gameRoot = path.join(publicRoot, 'games/relic-run');
const local = reference => reference && !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference) && !reference.includes('${');

async function assertResource(reference, source) {
  if (!local(reference)) return null;
  const pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  if (!pathname) return null;
  const resource = reference.startsWith('/')
    ? path.resolve(publicRoot, `.${pathname}`)
    : path.resolve(path.dirname(source), pathname);
  const withinPublic = path.relative(publicRoot, resource);
  assert.ok(withinPublic !== '..' && !withinPublic.startsWith(`..${path.sep}`) && !path.isAbsolute(withinPublic),
    `${path.relative(projectRoot, source)} points outside public/: ${reference}`);
  const info = await stat(resource).catch(() => null);
  assert.ok(info, `${path.relative(projectRoot, source)} references missing resource: ${reference}`);
  if (info.isDirectory()) {
    // The build writes src/index.html to the public root; nested static routes
    // must carry their own index.html.
    const entry = resource === publicRoot ? path.join(projectRoot, 'src/index.html') : path.join(resource, 'index.html');
    assert.ok((await stat(entry).catch(() => null))?.isFile(), `${reference} has no page entry`);
  }
  return resource;
}

test('runner module graph includes every static and deferred dependency', async () => {
  const visited = new Set();
  const queue = [path.join(gameRoot, 'game.js')];
  while (queue.length) {
    const source = queue.pop();
    if (visited.has(source)) continue;
    visited.add(source);
    const content = await readFile(source, 'utf8');
    // Check library presence, but do not parse minified third-party internals.
    if (source.includes(`${path.sep}vendor${path.sep}`)) continue;
    const imports = /\b(?:from\s*|import\s*\(\s*|import\s+)(['"])(\.{1,2}\/[^'"]+)\1/g;
    for (const match of content.matchAll(imports)) {
      const resource = await assertResource(match[2], source);
      if (resource && /\.m?js$/.test(resource)) queue.push(resource);
    }
    const moduleAssets = /new\s+URL\s*\(\s*(['"])([^'"]+)\1\s*,\s*import\.meta\.url\s*\)/g;
    for (const match of content.matchAll(moduleAssets)) await assertResource(match[2], source);
  }
  assert.ok(visited.has(path.join(gameRoot, 'fallback.mjs')), 'The no-WebGL renderer must be in the checked module graph');
  assert.ok(visited.has(path.join(gameRoot, 'world.mjs')), 'The WebGL world must be in the checked module graph');
});

test('runner pages and styles reference available local assets and destinations', async () => {
  const names = (await readdir(gameRoot)).filter(name => /\.(?:html|css)$/.test(name));
  for (const name of names) {
    const source = path.join(gameRoot, name);
    const content = await readFile(source, 'utf8');
    if (name.endsWith('.html')) {
      for (const match of content.matchAll(/\b(?:src|href)\s*=\s*(['"])([^'"]+)\1/g)) {
        await assertResource(match[2], source);
      }
    }
    for (const match of content.matchAll(/url\(\s*(?:(['"])(.*?)\1|([^)]*?))\s*\)/gs)) {
      await assertResource((match[2] ?? match[3]).trim(), source);
    }
  }
});

test('all five selectable themes and the catalog entry have reachable runtime covers', async () => {
  assert.deepEqual(THEMES.map(theme => theme.id), ['egypt', 'khmer', 'maya', 'wall', 'castle']);
  for (const theme of THEMES) await assertResource(theme.image, path.join(gameRoot, 'index.html'));
  const projects = JSON.parse(await readFile(path.join(projectRoot, 'data/projects.json'), 'utf8'));
  const game = projects.find(project => project.id === 'relic-run');
  assert.ok(game, 'The original game must remain discoverable in the catalog');
  await assertResource(game.localPath, path.join(publicRoot, 'index.html'));
  await assertResource(game.coverPath, path.join(publicRoot, 'index.html'));
});
