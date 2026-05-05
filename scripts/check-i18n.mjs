#!/usr/bin/env node
/**
 * Part of `npm run build`:
 * - Bare literal href without /zh/ or /en/ in app and components TSX
 * - Hardcoded CJK in selected files; strip comments before scan
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const BARE_SCAN_DIRS = ['app', 'components'].map((d) => path.join(ROOT, d));

/** UI files where we enforce “no stray CJK outside locales” after the homepage / drawer sweep. */
const CJK_WATCHLIST = ['app/(marketing)/page.tsx', 'app/ClientLayout.tsx'].map((f) =>
  path.join(ROOT, f),
);

const BARE_HREF_ALLOW_FIRST_SEG = new Set([
  'zh',
  'en',
  '_next',
  'images',
  'api',
  '',
  'model-viewer.min.js',
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p, out);
    else if (p.endsWith('.tsx')) out.push(p);
  }
  return out;
}

function stripForCjkScan(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('//'))
    .join('\n');
}

function hasCjk(text) {
  return /[\u3400-\u9FFF\uF900-\uFAFF]/.test(text);
}

const issues = [];

for (const dir of BARE_SCAN_DIRS) {
  for (const file of walk(dir)) {
    const src = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file);

    const hrefRe = /\bhref\s*=\s*["']\/([^"']*)["']/g;
    let m;
    while ((m = hrefRe.exec(src))) {
      const inner = m[1];
      if (inner.includes('${')) continue;
      const seg = inner.split('/')[0] ?? '';
      const first = seg.split('?')[0];
      if (inner === '') {
        issues.push(`${rel}: bare root href="/" — use /zh/… or /en/… or /\${lang}/ template.`);
        continue;
      }
      if (BARE_HREF_ALLOW_FIRST_SEG.has(first)) continue;
      issues.push(`${rel}: bare internal href="/${inner}" — prefix /zh/ or /en/ or use /\${lang}/….`);
    }
  }
}

for (const abs of CJK_WATCHLIST) {
  if (!fs.existsSync(abs)) continue;
  const rel = path.relative(ROOT, abs);
  const body = stripForCjkScan(fs.readFileSync(abs, 'utf8'));
  if (hasCjk(body)) {
    issues.push(`${rel}: CJK literals remain — move copy to locales/zh.json + locales/en.json.`);
  }
}

if (issues.length) {
  console.error('[check-i18n] Failed:\n\n' + issues.join('\n'));
  process.exit(1);
}

console.log('[check-i18n] OK');
