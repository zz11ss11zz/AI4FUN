#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { isIP } from 'node:net';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const categories = ['interactive', 'game', 'film', 'music'];
const roles = ['code', 'visual', 'audio', 'runtime', 'editing'];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// These checks are syntactic. check-links.mjs additionally resolves and pins DNS.
export function publicUrl(value, { httpsOnly = false } = {}) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value);
    if (!(httpsOnly ? ['https:'] : ['https:', 'http:']).includes(url.protocol)) return false;
    if (url.username || url.password || (url.port && !['80', '443'].includes(url.port))) return false;
    const host = url.hostname.replace(/\.$/, '').toLowerCase();
    if (!host.includes('.') || isIP(host) || host.startsWith('[')) return false;
    if (/(^|\.)(localhost|local|internal|test|invalid|example|onion)$/.test(host)) return false;
    return !/[\s\\]/.test(value);
  } catch { return false; }
}

export function canonicalUrl(value) {
  const url = new URL(value);
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.toString();
}

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function validateCatalog(projects, sources, collections) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  const text = (value) => typeof value === 'string' && value.trim().length > 0;
  const array = (value) => Array.isArray(value) ? value : [];
  const stringList = (value) => Array.isArray(value) && value.every(text) && new Set(value).size === value.length;
  const url = (value, path, nullable = false) => require((nullable && value === null) || publicUrl(value), `${path}: expected a public http(s) URL${nullable ? ' or null' : ''}`);
  const date = (value, path, nullable = false) => require((nullable && value === null) || isDate(value), `${path}: expected a real YYYY-MM-DD date${nullable ? ' or null' : ''}`);
  for (const [name, data] of [['projects', projects], ['sources', sources], ['collections', collections]]) {
    require(Array.isArray(data), `${name}: expected an array`);
  }
  if (errors.length) return errors;
  require(projects.length > 0, 'projects: catalog must not be empty');
  const ids = new Set();
  const primaryUrls = new Map();
  const collectionIds = new Set(collections.map((item) => item?.id));

  for (const [index, project] of projects.entries()) {
    const at = `projects[${index}]`;
    if (!project || typeof project !== 'object' || Array.isArray(project)) { errors.push(`${at}: expected an object`); continue; }
    require(typeof project.id === 'string' && slugPattern.test(project.id), `${at}.id: expected a lowercase slug`);
    require(!ids.has(project.id), `${at}.id: duplicate ${project.id}`);
    ids.add(project.id);
    for (const key of ['title', 'subtitle', 'description', 'why', 'firstStep', 'caveat', 'visual']) require(text(project[key]), `${at}.${key}: nonempty text is required`);
    require(categories.includes(project.category), `${at}.category: unsupported category`);
    require(project.year === null || (Number.isInteger(project.year) && project.year >= 1900 && project.year <= 2100), `${at}.year: expected a year or null`);
    date(project.publishedAt, `${at}.publishedAt`, true);
    date(project.addedAt, `${at}.addedAt`);
    date(project.lastReviewedAt, `${at}.lastReviewedAt`);
    if (isDate(project.addedAt) && isDate(project.lastReviewedAt)) require(project.addedAt <= project.lastReviewedAt, `${at}: review cannot predate addition`);
    require(text(project.creator?.name), `${at}.creator.name: required`);
    url(project.creator?.url, `${at}.creator.url`);
    for (const [key, values] of Object.entries({cost: ['free', 'freemium', 'paid', 'unknown'], login: ['none', 'required', 'unknown'], device: ['desktop', 'mobile', 'both', 'unknown'], mode: ['play', 'watch', 'setup', 'demo']})) {
      require(values.includes(project.access?.[key]), `${at}.access.${key}: unsupported value`);
    }
    require(stringList(project.aiRole) && project.aiRole.length > 0 && project.aiRole.every((role) => roles.includes(role)), `${at}.aiRole: expected distinct evidence-supported roles`);
    require(['ai-led-code', 'ai-led-media', 'ai-generated-experience'].includes(project.creation?.mode), `${at}.creation.mode: AI-primary creation evidence required`);
    require(text(project.creation?.summary), `${at}.creation.summary: explain AI's main production role and human involvement`);
    url(project.creation?.sourceUrl, `${at}.creation.sourceUrl`);
    require(project.creation?.evidenceLevel === 'source-backed-not-independently-audited', `${at}.creation.evidenceLevel: use source-backed disclosure, not a quantified audit claim`);
    if (project.creation?.sourceUrl && Array.isArray(project.evidence)) require(project.evidence.some(x => x.url === project.creation.sourceUrl), `${at}.creation.sourceUrl: link must appear in evidence`);
    for (const key of ['tools', 'tags', 'collectionIds']) require(stringList(project[key]), `${at}.${key}: expected distinct strings`);
    for (const id of array(project.collectionIds)) require(collectionIds.has(id), `${at}.collectionIds: unknown collection ${id}`);
    require(typeof project.featured === 'boolean', `${at}.featured: expected a boolean`);
    require(/^#[\da-f]{6}$/i.test(project.accent || ''), `${at}.accent: expected six-digit hex color`);
    for (const key of ['primary', 'source']) url(project.links?.[key], `${at}.links.${key}`);
    for (const key of ['code', 'process']) url(project.links?.[key], `${at}.links.${key}`, true);
    if (publicUrl(project.links?.primary)) {
      const canonical = canonicalUrl(project.links.primary);
      require(!primaryUrls.has(canonical), `${at}.links.primary: duplicates ${primaryUrls.get(canonical) || ''}`);
      primaryUrls.set(canonical, project.id);
    }
    require(Array.isArray(project.evidence) && project.evidence.length > 0, `${at}.evidence: at least one source is required`);
    for (const [i, entry] of (Array.isArray(project.evidence) ? project.evidence : []).entries()) {
      require(text(entry?.label) && text(entry?.note), `${at}.evidence[${i}]: label and note are required`);
      url(entry?.url, `${at}.evidence[${i}].url`);
    }
    require(['source-reviewed', 'hands-on'].includes(project.verification?.level), `${at}.verification.level: unsupported evidence level`);
    require(text(project.verification?.note), `${at}.verification.note: required`);
    date(project.verification?.checkedAt, `${at}.verification.checkedAt`);
    if (project.verification?.level === 'hands-on') {
      require(text(project.verification?.environment), `${at}.verification.environment: hands-on reviews must state device/browser and what was tested`);
    }
    require(Array.isArray(project.timeline) && project.timeline.length > 0, `${at}.timeline: at least one event is required`);
    let previous = '';
    for (const [i, event] of (Array.isArray(project.timeline) ? project.timeline : []).entries()) {
      date(event?.date, `${at}.timeline[${i}].date`);
      require(text(event?.kind) && text(event?.text), `${at}.timeline[${i}]: kind and text are required`);
      if (isDate(event?.date)) { require(event.date >= previous, `${at}.timeline: dates must be in ascending order`); previous = event.date; }
    }
  }

  const sourceIds = new Set();
  const sourceUrls = new Set();
  for (const [index, source] of sources.entries()) {
    const at = `sources[${index}]`;
    if (!source || typeof source !== 'object') { errors.push(`${at}: expected an object`); continue; }
    require(typeof source.id === 'string' && slugPattern.test(source.id), `${at}.id: expected a lowercase slug`);
    require(!sourceIds.has(source.id), `${at}.id: duplicate ${source.id}`);
    sourceIds.add(source.id);
    require(text(source.name) && text(source.description), `${at}: name and description are required`);
    require(publicUrl(source.url, { httpsOnly: true }), `${at}.url: expected a public HTTPS URL`);
    if (publicUrl(source.url)) { const key = canonicalUrl(source.url); require(!sourceUrls.has(key), `${at}.url: duplicate source URL`); sourceUrls.add(key); }
    require(['creator', 'platform', 'festival', 'repository'].includes(source.type), `${at}.type: unsupported source type`);
    require(['zh', 'en', 'multi'].includes(source.language), `${at}.language: unsupported language`);
    require(source.status === 'manual', `${at}.status: sources currently use manual review; do not claim an unimplemented feed`);
    require(stringList(source.scope) && source.scope.length > 0 && source.scope.every((item) => categories.includes(item)), `${at}.scope: expected known categories`);
    date(source.addedAt, `${at}.addedAt`);
  }

  const seenCollections = new Set();
  for (const [index, collection] of collections.entries()) {
    const at = `collections[${index}]`;
    if (!collection || typeof collection !== 'object') { errors.push(`${at}: expected an object`); continue; }
    require(typeof collection.id === 'string' && slugPattern.test(collection.id), `${at}.id: expected a lowercase slug`);
    require(!seenCollections.has(collection.id), `${at}.id: duplicate ${collection.id}`);
    seenCollections.add(collection.id);
    for (const key of ['title', 'subtitle', 'description', 'icon']) require(text(collection[key]), `${at}.${key}: required`);
    require(/^#[\da-f]{6}$/i.test(collection.color || ''), `${at}.color: expected six-digit hex color`);
    require(stringList(collection.projectIds), `${at}.projectIds: expected distinct project IDs`);
    for (const id of array(collection.projectIds)) {
      require(ids.has(id), `${at}.projectIds: missing project ${id}`);
      const project = projects.find((item) => item.id === id);
      require(project?.collectionIds?.includes(collection.id), `${at}: ${id} must also reference this collection`);
    }
  }
  for (const project of projects) for (const id of array(project?.collectionIds)) {
    const collection = collections.find((item) => item.id === id);
    require(collection?.projectIds?.includes(project.id), `project ${project.id}: collection ${id} must include its ID`);
  }
  return errors;
}

export async function readCatalog() {
  const names = ['projects', 'sources', 'collections'];
  return Promise.all(names.map(async (name) => JSON.parse(await readFile(resolve(root, 'data', `${name}.json`), 'utf8'))));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const data = await readCatalog();
    const errors = validateCatalog(...data);
    if (errors.length) { console.error(`Catalog validation failed (${errors.length}):\n${errors.map((item) => `  - ${item}`).join('\n')}`); process.exitCode = 1; }
    else console.log(`Catalog valid: ${data[0].length} projects, ${data[1].length} sources, ${data[2].length} collections.`);
  } catch (error) { console.error(`Cannot validate catalog: ${error.message}`); process.exitCode = 1; }
}
