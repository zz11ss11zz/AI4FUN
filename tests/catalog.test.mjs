import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHTML,
  isMade,
  normalizeSearch,
  readFavorites,
  safeExternal,
  selectProjects,
} from '../src/catalog.js';

const state = overrides => ({
  view: 'discover', category: 'all', q: '', filters: [],
  sort: 'curated', collection: null, ...overrides,
});

function project(id, overrides = {}) {
  return {
    id, title: id, subtitle: '', description: '', category: 'game',
    creator: { name: 'Maker', url: 'https://creator.example.org/' },
    year: 2026, publishedAt: null, addedAt: '2026-11-20',
    access: { cost: 'free', login: 'none', device: 'both', mode: 'play' },
    aiRole: ['code'], tools: [], tags: [],
    links: { primary: `https://works.example.org/${id}`, code: 'https://github.com/example/work' },
    featured: false, collectionIds: ['five-minutes'], ...overrides,
  };
}

const ids = records => records.map(record => record.id);

function deepFreeze(value) {
  Object.freeze(value);
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child);
  }
  return value;
}

test('search normalizes full-width Latin text, casing, and surrounding whitespace', () => {
  assert.equal(normalizeSearch('  ＧＰＴ-４o  '), 'gpt-4o');
  assert.equal(normalizeSearch(null), '');
  const records = [project('match', { title: 'GPT-4o 互动音乐' }), project('other')];
  assert.deepEqual(ids(selectProjects(records, state({ q: ' ＧＰＴ-４Ｏ ' }))), ['match']);
});

test('search requires every term and finds creator, tools, tags, category, and AI role', () => {
  const records = [
    project('match', {
      title: 'Dancing pixels', creator: { name: '林同学' }, category: 'interactive',
      tools: ['Claude'], tags: ['粒子'], aiRole: ['visual'],
    }),
    project('partial', { title: 'Dancing pixels', tools: ['Claude'] }),
  ];
  assert.deepEqual(ids(selectProjects(records, state({ q: 'pixels 林同学\tClaude 粒子 互动 生成画面' }))), ['match']);
  assert.deepEqual(selectProjects(records, state({ q: 'pixels 不存在的关键词' })), []);
  assert.deepEqual(ids(selectProjects(records, state({ q: '\n \t' }))), ['match', 'partial']);
});

test('saved view, category, collection, query, and every quick filter intersect', () => {
  const base = project('match', { title: 'Orbit' });
  const records = [
    base,
    { ...base, id: 'not-saved' },
    { ...base, id: 'wrong-category', category: 'film' },
    { ...base, id: 'wrong-collection', collectionIds: [] },
    { ...base, id: 'wrong-query', title: 'Other' },
    { ...base, id: 'not-free', access: { ...base.access, cost: 'freemium' } },
    { ...base, id: 'needs-login', access: { ...base.access, login: 'required' } },
    { ...base, id: 'no-code', links: { ...base.links, code: null } },
    { ...base, id: 'runtime-only', aiRole: ['runtime'] },
    { ...base, id: 'desktop-only', access: { ...base.access, device: 'desktop' } },
  ];
  const selected = state({
    view: 'saved', category: 'game', collection: 'five-minutes', q: 'Orbit',
    filters: ['free', 'no-login', 'code', 'made', 'mobile'],
  });
  const saved = ids(records).filter(id => id !== 'not-saved');
  assert.deepEqual(ids(selectProjects(records, selected, saved)), ['match']);
});

test('unknown access requirements never satisfy free, account-free, or mobile claims', () => {
  const unknown = project('unknown', { access: { cost: 'unknown', login: 'unknown', device: 'unknown', mode: 'demo' } });
  const mobile = project('mobile', { access: { cost: 'free', login: 'none', device: 'mobile', mode: 'play' } });
  const records = [unknown, mobile, project('both')];
  for (const filter of ['free', 'no-login', 'mobile']) {
    assert.deepEqual(ids(selectProjects(records, state({ filters: [filter] }))), ['mobile', 'both']);
  }
});

test('saved view skips stale IDs and stays empty when no works are saved', () => {
  const records = [project('first'), project('second')];
  assert.deepEqual(selectProjects(records, state({ view: 'saved' })), []);
  assert.deepEqual(ids(selectProjects(records, state({ view: 'saved' }), ['stale', 'second', 'second'])), ['second']);
  assert.deepEqual(ids(selectProjects(records, state(), ['second'])), ['first', 'second']);
});

test('AI-assisted creation is distinct from runtime-only AI', () => {
  assert.equal(isMade(project('runtime', { aiRole: ['runtime'] })), false);
  for (const role of ['code', 'visual', 'audio', 'editing']) {
    assert.equal(isMade(project(role, { aiRole: ['runtime', role] })), true);
  }
});

test('curated sorting is stable within groups and never mutates catalog or state', () => {
  const records = deepFreeze([
    project('ordinary-a'), project('featured-a', { featured: true }),
    project('ordinary-b'), project('featured-b', { featured: true }),
  ]);
  const selected = deepFreeze(state());
  assert.deepEqual(ids(selectProjects(records, selected)), ['featured-a', 'featured-b', 'ordinary-a', 'ordinary-b']);
  assert.deepEqual(ids(records), ['ordinary-a', 'featured-a', 'ordinary-b', 'featured-b']);
});

test('work chronology handles exact dates, year-only records, and unknown years', () => {
  const records = [
    project('unknown', { year: null }),
    project('old', { year: 2022, publishedAt: '2022-12-31' }),
    project('year-only', { year: 2026 }),
    project('same-year-later', { year: 2026, publishedAt: '2026-02-20' }),
    project('same-year-latest', { year: 2026, publishedAt: '2026-10-01' }),
  ];
  assert.deepEqual(ids(selectProjects(records, state({ sort: 'newest' }))), [
    'same-year-latest', 'same-year-later', 'year-only', 'old', 'unknown',
  ]);
});

test('recently-added sorting uses catalog dates rather than original publication year', () => {
  const records = [
    project('new-work', { year: 2026, addedAt: '2026-10-01' }),
    project('rediscovered-classic', { year: 2017, addedAt: '2026-11-20' }),
    project('older-entry', { addedAt: '2026-01-10' }),
  ];
  assert.deepEqual(ids(selectProjects(records, state({ sort: 'recent' }))), [
    'rediscovered-classic', 'new-work', 'older-entry',
  ]);
});

test('name sorting orders titles without changing the original records', () => {
  const records = [project('z', { title: 'Zebra' }), project('a', { title: 'Apple' }), project('m', { title: 'Moon' })];
  assert.deepEqual(ids(selectProjects(records, state({ sort: 'name' }))), ['a', 'm', 'z']);
  assert.deepEqual(ids(records), ['z', 'a', 'm']);
});

test('favorites accept legacy arrays and current exports while preserving saved order', () => {
  const valid = new Set(['first', 'second']);
  assert.deepEqual(readFavorites('["second","first","second"]', valid), ['second', 'first']);
  const exported = JSON.stringify({ format: 'ai4fun-favorites', version: 1, projectIds: ['first', 'second'] });
  assert.deepEqual(readFavorites(exported, [...valid]), ['first', 'second']);
});

test('favorites discard stale, duplicate, non-string, and hostile IDs', () => {
  const raw = JSON.stringify(['first', 'removed', null, 1, {}, ['second'], '__proto__', '<script>alert(1)</script>', 'first', 'second']);
  assert.deepEqual(readFavorites(raw, new Set(['first', 'second'])), ['first', 'second']);
});

test('malformed or wrong-shape favorites are safe empty collections', () => {
  for (const raw of ['', 'not json', '{', 'null', 'true', '42', '"first"', '{}', '{"projectIds":null}', '{"projectIds":"first"}']) {
    assert.deepEqual(readFavorites(raw, ['first']), [], `Unexpected favorites for ${raw}`);
  }
});

test('HTML escaping protects text and quoted attributes without discarding Unicode', () => {
  assert.equal(escapeHTML('<img src="x" onerror=\'alert(1)\'>& 中文'), '&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt;&amp; 中文');
  assert.equal(escapeHTML(null), '');
  assert.equal(escapeHTML(undefined), '');
  assert.equal(escapeHTML('音乐 ✨'), '音乐 ✨');
});

test('external links allow HTTPS and retain query strings and fragments', () => {
  assert.equal(safeExternal('https://creator.example.org/work?q=AI%20art#demo'), 'https://creator.example.org/work?q=AI%20art#demo');
});

test('external links reject script/data protocols, non-HTTPS, credentials, and malformed URLs', () => {
  for (const url of [
    'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>alert(1)</script>',
    'http://creator.example.org/', 'ftp://creator.example.org/', '/relative-path', '//creator.example.org/',
    'https://name:password@creator.example.org/', 'https://name@creator.example.org/',
    'https://', '', null,
  ]) assert.equal(safeExternal(url), '#', `Unsafe link allowed: ${url}`);
});
