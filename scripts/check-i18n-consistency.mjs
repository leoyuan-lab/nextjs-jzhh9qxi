#!/usr/bin/env node

import { execSync } from 'node:child_process';

function run(command) {
  return execSync(command, { encoding: 'utf8' });
}

function getStagedFiles() {
  const out = run('git diff --cached --name-only --diff-filter=ACMR');
  return out
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getStagedDiffFor(file) {
  return run(`git diff --cached --unified=0 -- "${file}"`);
}

function getStagedContent(file) {
  try {
    return run(`git show ":${file}"`);
  } catch {
    return '';
  }
}

function collectAddedLines(diffText) {
  return diffText
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
    .map((line) => line.slice(1));
}

function hasHardcodedAltOnImage(line) {
  if (!/(<Image\b|<img\b)/.test(line) || !/\balt=/.test(line)) return false;
  if (/alt=\{[^}]*\bt\(/.test(line)) return false;
  const braced = line.match(/alt=\{\s*([^}]+?)\s*\}/);
  if (braced) {
    const inner = braced[1].trim();
    // Prop / message object access only (no string literals in JSX alt)
    if (/^[A-Za-z_$][\w$.]*$/.test(inner)) return false;
  }
  return true;
}

function hasBareLocalizedLink(line) {
  // `<link rel="preload" href="/…">` is not user-facing navigation; same-origin asset paths stay unprefixed.
  if (/\brel=["']preload["']/.test(line)) return false;
  return (
    /\bhref=["']\/(?!zh(?:\/|$)|en(?:\/|$)|["'])/.test(line) ||
    /window\.location\.(?:assign|href)\(\s*["']\/(?!zh(?:\/|$)|en(?:\/|$))/.test(line) ||
    /window\.location\.href\s*=\s*["']\/(?!zh(?:\/|$)|en(?:\/|$))/.test(line)
  );
}

function checkMetadataAlternates(file, content) {
  if (!file.startsWith('app/') || !file.endsWith('/layout.tsx')) return null;
  if (file === 'app/layout.tsx') return null;
  if (!/export\s+const\s+metadata\b/.test(content)) return null;
  const usesPageMetadata = /pageMetadata\(/.test(content);
  const hasAlternates = /\balternates\s*:/.test(content);
  if (usesPageMetadata && !hasAlternates) return null;
  if (hasAlternates) return null;
  return `${file}: metadata missing alternates/pageMetadata pathname for /zh and /en variants.`;
}

function main() {
  const files = getStagedFiles();
  const issues = [];

  for (const file of files) {
    if (!/\.(tsx|ts|jsx|js)$/.test(file)) continue;
    const diff = getStagedDiffFor(file);
    const added = collectAddedLines(diff);

    if (file.startsWith('app/')) {
      for (const line of added) {
        if (hasBareLocalizedLink(line)) {
          issues.push(`${file}: bare non-prefixed internal link found -> ${line.trim()}`);
        }
      }
    }

    for (const line of added) {
      if (hasHardcodedAltOnImage(line)) {
        issues.push(`${file}: image alt should use t('image_alt_key') -> ${line.trim()}`);
      }
    }

    const stagedContent = getStagedContent(file);
    const metaIssue = checkMetadataAlternates(file, stagedContent);
    if (metaIssue) issues.push(metaIssue);
  }

  if (issues.length > 0) {
    console.error('\n[i18n-consistency] Commit blocked:\n');
    for (const issue of issues) console.error(`- ${issue}`);
    console.error(
      "\nFix rules: alt must use t('image_alt_key'), app links must preserve /zh|/en, metadata must include alternates.",
    );
    process.exit(1);
  }

  console.log('[i18n-consistency] OK');
}

main();
