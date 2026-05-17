#!/usr/bin/env node
/**
 * Remove pedestal-diagram stray dimension lines from blueprint SVG exports.
 * Fingerprints: M0 0H-124.87, M0 0V52.992, pedestal tick circles at ty≈-56.
 */

import fs from 'node:fs';
import path from 'node:path';

const VECTORS_DIR = path.join(process.cwd(), 'public/images/robots/_vectors');

const REMOVERS = [
  {
    name: 'pedestal H dimension',
    re: /<ns0:path\b[^>]*\bd="M0 0H-124\.87"[^/]*\/>\s*/g,
  },
  {
    name: 'pedestal V dimension (52.992)',
    re: /<ns0:path\b[^>]*\bd="M0 0V52\.992"[^/]*\/>\s*/g,
  },
  {
    name: 'pedestal horizontal helper',
    re: /<ns0:path\b[^>]*\bd="M0 0H-69\.924-95\.39"[^/]*\/>\s*/g,
  },
  {
    name: 'pedestal endpoint circle (C0-1.175)',
    re: /<ns0:path transform="matrix\(3,0,0,-3,[^"]+\)" d="M0 0C0-1\.175[^"]*" fill="none" \/>\s*/g,
  },
  {
    name: 'pedestal endpoint circle (C0-.916)',
    re: /<ns0:path transform="matrix\(3,0,0,-3,[^"]+\)" d="M0 0C0-\.916[^"]*" fill="none" \/>\s*/g,
  },
];

function cleanSvg(content) {
  const removed = [];
  let next = content;
  for (const { name, re } of REMOVERS) {
    re.lastIndex = 0;
    const matches = next.match(re);
    if (matches?.length) {
      removed.push({ name, count: matches.length });
      next = next.replace(re, '');
    }
  }
  return { content: next, removed };
}

function main() {
  const files = fs.readdirSync(VECTORS_DIR).filter((f) => f.endsWith('.svg'));
  const report = [];

  for (const file of files.sort()) {
    const filePath = path.join(VECTORS_DIR, file);
    const before = fs.readFileSync(filePath, 'utf8');
    const { content, removed } = cleanSvg(before);
    if (removed.length === 0) continue;

    fs.writeFileSync(filePath, content, 'utf8');
    report.push({ file, removed, bytesBefore: before.length, bytesAfter: content.length });
  }

  if (report.length === 0) {
    console.log('No pedestal artifacts removed (files may already be clean).');
    return;
  }

  console.log('Removed pedestal diagram stray paths:\n');
  for (const row of report) {
    const detail = row.removed.map((r) => `${r.name}×${r.count}`).join(', ');
    const delta = row.bytesBefore - row.bytesAfter;
    console.log(`  ${row.file}: ${detail} (−${delta} bytes)`);
  }
}

main();
