// Read-only regression checks against the real Astro static output.
// Run after pnpm build; optionally pass the actual preview URL for HTTP checks.
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const checks = [];
const check = (name, condition, detail = '') => {
  checks.push({ name, pass: Boolean(condition), detail });
  assert.ok(condition, `${name}: ${detail}`);
};
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? walk(join(directory, entry.name)) : [join(directory, entry.name)]));
  return nested.flat();
}
const pages = (await walk(dist)).filter((file) => file.endsWith('.html'));
const preview = process.argv[2];
const htmlByPath = new Map();
for (const file of pages) htmlByPath.set(file, await readFile(file, 'utf8'));

for (const [file, html] of htmlByPath) {
  const route = file.slice(dist.length).replaceAll('\\', '/').replace(/index\.html$/, '');
  check(`${route}: single H1`, (html.match(/<h1(?:\s|>)/g) || []).length === 1);
  const scriptCount = (html.match(/<script(?:\s|>)/g) || []).length;
  check(`${route}: expected client scripts`, route === '/' ? scriptCount === 2 : scriptCount === 1, String(scriptCount));
  check(`${route}: no decorative canvas`, !/<canvas/.test(html));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  check(`${route}: unique element and SVG gradient IDs`, new Set(ids).size === ids.length);
  for (const gradient of html.matchAll(/url\(#([^\)]+)\)/g)) {
    check(`${route}: SVG gradient target ${gradient[1]}`, ids.includes(gradient[1]));
  }
  if (route === '/') {
    check('Homepage: featured works navigation', html.includes('代表作品快捷入口') && html.includes('进入 RTS Gameplay Systems 案例') && html.includes('进入 Blitz Archive 案例'));
    check('Homepage: horizontal showcase', html.includes('data-showcase-stage') && html.includes('data-showcase-viewport') && html.includes('data-showcase-track') && html.includes('data-showcase-prev') && html.includes('data-showcase-next'));
    check('Homepage: two data-driven slides', (html.match(/<div\b[^>]*\bdata-showcase-slide\b/g) || []).length === 2);
    check('Homepage: active-project CTA', html.includes('data-showcase-current') && html.includes('data-showcase-cta') && html.includes('data-showcase-progress'));
    check('Homepage: viewport-scoped coverflow navigation', html.includes('data-position="active"') && html.includes('data-position="next"') && html.includes('wheel') && !html.includes('is-scroll-driven'));
    check('Homepage: no redundant secondary hero CTA', !html.includes('阅读技术案例'));
    check('Homepage: bidirectional carousel arrows enabled', !/<button[^>]*data-showcase-prev[^>]*disabled[^>]*>/.test(html) && !/<button[^>]*data-showcase-next[^>]*disabled[^>]*>/.test(html));
    check('Homepage: no hero scene caption', !html.includes('scene-caption'));
    check('Homepage: professional engineering copy', html.includes('聚焦 C++、Gameplay 系统设计与模块化架构'));
    check('Homepage: progressive image placeholders', (html.match(/data-progressive="true"/g) || []).length === 3 && (html.match(/--art-preview:/g) || []).length >= 3);
    check('Homepage: hero image prioritized', /class="atelier-image"/.test(html) && html.includes('fetchpriority="high"'));
    check('Homepage: showcase images prefetched at low priority', (html.match(/fetchpriority="low"/g) || []).length === 2 && !html.includes('loading="lazy"'));
  }
  check(`${route}: no prototype or old visual dependencies`, !/docs\/prototypes|hex-snow-crystal|portfolio_iceflake/.test(html));
  check(`${route}: light theme`, /name="color-scheme" content="light"/.test(html));
  const sources = [...html.matchAll(/\bsrcset="([^"]+)"/g)].flatMap((match) => match[1].split(',').map((source) => source.trim().split(/\s+/)[0]));
  check(`${route}: no previous geometric artwork`, !html.includes('class="concept-art'));
  if (sources.length) {
    check(`${route}: optimized responsive illustration sources`, sources.every((source) => source.endsWith('.webp')));
    check(`${route}: concept art clearly distinguished from UE media`, html.includes('AI 概念插画') && html.includes('非 UE'));
  }
  const references = [...new Set([...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]).concat(sources))];
  for (const reference of references) {
    const url = new URL(reference, `http://127.0.0.1${route}`);
    if (url.origin !== 'http://127.0.0.1') continue;
    const pathname = decodeURIComponent(url.pathname);
    const target = resolve(dist, `.${pathname.endsWith('/') ? pathname + 'index.html' : pathname}`);
    check(`${route}: reference ${reference}`, target.startsWith(dist + sep) && Boolean(await stat(target)));
    if (url.hash && target.endsWith('.html')) {
      const targetHtml = htmlByPath.get(target) ?? await readFile(target, 'utf8');
      check(`${route}: anchor ${reference}`, targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`));
    }
  }
  if (preview) {
    const response = await fetch(new URL(route, preview));
    check(`${route}: HTTP`, response.ok, String(response.status));
  }
}

const rts = htmlByPath.get(join(dist, 'projects', 'rts-gameplay-systems', 'index.html'));
const blitz = htmlByPath.get(join(dist, 'projects', 'blitz-archive', 'index.html'));
for (const [name, html, direction, adjacent] of [
  ['RTS', rts, '下一部作品', 'blitz-archive'],
  ['Blitz', blitz, '上一部作品', 'rts-gameplay-systems'],
]) {
  check(`${name}: single project-index return`, (html.match(/返回作品选集/g) || []).length === 1);
  check(`${name}: adjacent navigation`, html.includes(`aria-label="${direction}：`) && html.includes(`href="/projects/${adjacent}/"`));
  check(`${name}: no redundant next-work entry`, (html.match(/aria-label="下一部作品：/g) || []).length + (html.match(/aria-label="上一部作品：/g) || []).length === 1);
  check(`${name}: navigation anchor`, html.includes('id="project-navigation"'));
}
check('RTS: accurate ownership and testing limits', rts.includes('命令系统不是本人开发') && rts.includes('尚未完成实际多人网络测试'));
check('Blitz: existing framework separated', blitz.includes('Lyra 与 GAS 是复用的既有框架'));

const styles = (await walk(join(dist, '_astro'))).filter((file) => file.endsWith('.css'));
let css = '';
for (const file of styles) css += await readFile(file, 'utf8');
check('CSS: reduced-motion fallback present (static inspection)', css.includes('prefers-reduced-motion') && /animation:none!important/.test(css) && /transition:none!important/.test(css));
check('CSS: showcase and adjacent navigation styles', css.includes('showcase-slide') && css.includes('showcase-cta') && css.includes('case-index-button'));
check('CSS: bounded non-sticky cinematic showcase', !css.includes('gallery.is-scroll-driven') && css.includes('perspective:') && css.includes('rotateY(') && css.includes('78vw'));
check('CSS: progressive placeholder fade-in', /artwork-frame:{1,2}before/.test(css) && /hero-scene:{1,2}before/.test(css) && css.includes('.image-ready'));
const headers = await readFile(join(dist, '_headers'), 'utf8');
check('Cloudflare: immutable fingerprinted asset caching', headers.includes('/_astro/*') && headers.includes('max-age=31536000, immutable') && !headers.split(/\r?\n/).some((line) => line.trim() === '/*'));
check('CSS: no old shader/prototype dependency', !/optics-stage|docs\/prototypes|\.\/snow-emblem\.svg/.test(css));
check('SVG: published small winter identity', (await readFile(join(dist, 'visuals', 'ice-mark.svg'), 'utf8')).includes('viewBox="0 0 40 40"'));
if (preview) {
  const missing = await fetch(new URL('/qa-route-does-not-exist/', preview));
  check('HTTP: missing route is 404', missing.status === 404, String(missing.status));
  for (const file of styles) {
    const route = file.slice(dist.length).replaceAll('\\', '/');
    check(`HTTP: ${route}`, (await fetch(new URL(route, preview))).ok);
  }
  check('HTTP: winter identity asset', (await fetch(new URL('/visuals/ice-mark.svg', preview))).ok);
}
console.log(JSON.stringify({ checks, total: checks.length, passed: checks.filter((item) => item.pass).length }, null, 2));
