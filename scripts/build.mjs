import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { escapeHTML as e, CATEGORY, ROLE, COST, LOGIN, DEVICE, MODES } from '../src/catalog.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const siteURL = new URL(process.env.SITE_URL || 'https://zz11ss11zz.github.io/ai4fun/');
if (siteURL.protocol !== 'https:' || siteURL.username || siteURL.password) throw new Error('SITE_URL must be a public HTTPS URL');
siteURL.search = ''; siteURL.hash = '';
if (!siteURL.pathname.endsWith('/')) siteURL.pathname += '/';
execFileSync(process.execPath, [path.join(root, 'scripts/validate.mjs')], {stdio: 'inherit'});
const projects = JSON.parse(await readFile(path.join(root, 'data/projects.json'), 'utf8'));
const template = await readFile(path.join(root, 'src/index.html'), 'utf8');
const absolute = relative => new URL(relative, siteURL).href;
const permalink = p => absolute(`works/${p.id}/`);
const lastUpdated = [...projects].map(p => p.lastReviewedAt).sort().at(-1);
const jsonLD = data => JSON.stringify(data).replaceAll('<', '\\u003c');
const link = (url, label) => `<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)}</a>`;

function staticDetail(p) {
  return `<article class="shell static-detail"><a href="./">← 返回 AI4FUN</a><p>${e(CATEGORY[p.category])} · ${p.year || '年份未披露'}</p><h1>${e(p.title)}</h1><p>${e(p.subtitle)}</p><p>创作者：${link(p.creator.url, p.creator.name)}</p><img class="static-cover" src="assets/covers/${p.visual}.svg" alt="分类编辑插画，非作品截图" width="1200" height="750"><p><small>本站编辑插画，作品实貌请访问原作。</small></p><p>${link(p.links.primary, MODES[p.access.mode])}</p><p>${e(COST[p.access.cost])} · ${e(LOGIN[p.access.login])} · ${e(DEVICE[p.access.device])}</p><h2>为什么值得点开</h2><p>${e(p.why)}</p><p>${e(p.description)}</p><h2>第一步</h2><p>${e(p.firstStep)}</p><h2>AI 参与了什么</h2><p>${p.aiRole.map(r => e(ROLE[r])).join('、')}。${p.tools.map(e).join(' / ')}</p><p>${p.links.code ? link(p.links.code, '公开源码') : ''} ${p.links.process ? link(p.links.process, '制作与幕后') : ''}</p><h2>打开之前</h2><p>${e(p.caveat)}</p><h2>出处与核对</h2><ul>${p.evidence.map(v => `<li>${link(v.url, v.label)}<p>${e(v.note)}</p></li>`).join('')}</ul><p>最近核对：${e(p.lastReviewedAt)}。${e(p.verification.note)}</p></article>`;
}

function page(p) {
  const title = p ? `${p.title} · AI4FUN 作品档案` : 'AI4FUN · 让好奇心，有地方玩';
  const description = p ? `${p.subtitle}。${p.description}` : '精选值得体验的 AI 互动作品、游戏、影像与音乐。找到原作者、体验入口和制作方法，收藏下一次创作的灵感。';
  const url = p ? permalink(p) : siteURL.href;
  const schema = p ? {
    '@context': 'https://schema.org', '@type': 'WebPage', name: title, description,
    url, dateModified: p.lastReviewedAt, inLanguage: 'zh-CN',
    mainEntity: {'@type': 'CreativeWork', name: p.title, url: p.links.primary, creator: {'@type': 'Person', name: p.creator.name, url: p.creator.url}, ...(p.publishedAt ? {datePublished: p.publishedAt} : {})}
  } : {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description,
    url, inLanguage: 'zh-CN', mainEntity: {'@type': 'ItemList', numberOfItems: projects.length,
      itemListElement: projects.map((item, i) => ({'@type': 'ListItem', position: i + 1, url: permalink(item), name: item.title}))}
  };
  let html = template
    .replace('<base href="./">', `<base href="${p ? '../../' : './'}">`)
    .replace(/<title>.*?<\/title>/, `<title>${e(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${e(description)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${e(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${e(description)}">`)
    .replace('</head>', `  <link rel="canonical" href="${e(url)}">\n  <meta property="og:url" content="${e(url)}">\n  <script type="application/ld+json">${jsonLD(schema)}</script>\n</head>`);
  const list = `<ul>${projects.map(item => `<li><h3><a href="works/${item.id}/">${e(item.title)}</a></h3><p>${e(item.subtitle)}</p><p>${e(CATEGORY[item.category])} · ${e(item.creator.name)} · ${item.year || ''}</p>${link(item.links.primary, MODES[item.access.mode])}</li>`).join('')}</ul>`;
  if (p) html = html.replace('<body>', `<body data-initial-project="${e(p.id)}">`).replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript><style>#main-content{display:none}</style>${staticDetail(p)}</noscript>`);
  else html = html.replace('<!-- STATIC_CATALOG -->', list);
  return html;
}

await rm(out, {recursive: true, force: true});
await mkdir(out, {recursive: true});
await cp(path.join(root, 'public'), out, {recursive: true});
await cp(path.join(root, 'data'), path.join(out, 'data'), {recursive: true});
for (const file of ['app.js', 'catalog.js', 'icons.js', 'styles.css']) await cp(path.join(root, 'src', file), path.join(out, file));
await writeFile(path.join(out, 'index.html'), page());
for (const p of projects) {
  const dir = path.join(out, 'works', p.id);
  await mkdir(dir, {recursive: true});
  await writeFile(path.join(dir, 'index.html'), page(p));
}

const rssItems = [...projects].sort((a,b) => b.addedAt.localeCompare(a.addedAt)).map(p => `<item><title>${e(p.title)} · ${e(CATEGORY[p.category])}</title><link>${e(permalink(p))}</link><guid isPermaLink="true">${e(permalink(p))}</guid><pubDate>${new Date(`${p.addedAt}T12:00:00+08:00`).toUTCString()}</pubDate><description>${e(`${p.subtitle}。${p.why} 本站收录于 ${p.addedAt}，原作年份 ${p.year || '未披露'}。`)}</description><category>${e(CATEGORY[p.category])}</category></item>`).join('\n');
await writeFile(path.join(out, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>AI4FUN · 最新收录</title><link>${e(siteURL.href)}</link><description>发现值得点开的 AI 创意作品。此订阅中的时间表示本站收录时间。</description><language>zh-cn</language><atom:link href="${e(absolute('feed.xml'))}" rel="self" type="application/rss+xml"/>${rssItems}</channel></rss>`);
await writeFile(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${e(siteURL.href)}</loc><lastmod>${lastUpdated}</lastmod></url>${projects.map(p => `<url><loc>${e(permalink(p))}</loc><lastmod>${p.lastReviewedAt}</lastmod></url>`).join('')}</urlset>`);
await writeFile(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absolute('sitemap.xml')}\n`);
await writeFile(path.join(out, '.nojekyll'), '');
await writeFile(path.join(out, '404.html'), `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>这条小路还没铺好 · AI4FUN</title><style>body{font:18px/1.8 system-ui,sans-serif;background:#edf3ff;color:#17213a;max-width:650px;margin:15vh auto;padding:25px}a{color:#365fdf}h1{font-size:36px}</style><h1>这条小路，还没铺好。</h1><p>页面可能已经移动，或者链接里多了一个字符。</p><a href="${e(siteURL.href)}">回到 AI4FUN，继续发现 →</a></html>`);
console.log(`Built ${projects.length} work pages, the catalog, RSS and sitemap into dist/`);
