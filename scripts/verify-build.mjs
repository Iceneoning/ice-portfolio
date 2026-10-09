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
  check(`${route}: zero client scripts`, scriptCount === 0, String(scriptCount));
  check(`${route}: no decorative canvas`, !/<canvas/.test(html));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  check(`${route}: unique element and SVG gradient IDs`, new Set(ids).size === ids.length);
  for (const gradient of html.matchAll(/url\(#([^\)]+)\)/g)) {
    check(`${route}: SVG gradient target ${gradient[1]}`, ids.includes(gradient[1]));
  }
  if (route === '/') check('Homepage: project-first navigation', html.includes('精选项目快捷入口') && html.includes('进入 RTS Gameplay Systems 案例') && html.includes('进入 Blitz Archive 案例'));
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
for (const [name, html, next] of [['RTS', rts, 'blitz-archive'], ['Blitz', blitz, 'rts-gameplay-systems']]) {
  check(`${name}: two named next-work entries`, (html.match(/aria-label="下一部作品：/g) || []).length === 2);
  check(`${name}: next-work target`, (html.match(new RegExp(`href="/projects/${next}/"`, 'g')) || []).length === 2);
}
check('RTS: accurate ownership and testing limits', rts.includes('命令系统不是本人开发') && rts.includes('尚未完成实际多人网络测试'));
check('Blitz: existing framework separated', blitz.includes('Lyra 与 GAS 是复用的既有框架'));

const styles = (await walk(join(dist, '_astro'))).filter((file) => file.endsWith('.css'));
let css = '';
for (const file of styles) css += await readFile(file, 'utf8');
check('CSS: reduced-motion fallback present (static inspection)', css.includes('prefers-reduced-motion') && /animation:none!important/.test(css) && /transition:none!important/.test(css));
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
