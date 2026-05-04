import type { Metadata } from 'next';

import { getSiteOrigin } from '@/lib/site-origin';

/** Visible <title> must include Cobot & Robotic Arm (product SEO). */
export function seoTitle(focusPhrase: string): string {
  const trimmed = focusPhrase.trim();
  return `${trimmed} Cobot · Robotic Arm · Apple Robot`;
}

/** <meta description> must contain both phrases (English keyword coverage). */
export function seoDescription(body: string): string {
  const t = body.trim();
  const hasCobot = /\bcobot\b/i.test(t);
  const hasRoboticArm = /\brobotic arm\b/i.test(t);
  let out = t;
  if (!hasCobot) out = `${out} Cobots`;
  if (!hasRoboticArm) out = `${out} robotic arm specs.`;
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * `rel="alternate"` + hreflang for zh/en physical subdirectory routes.
 */
export function languageAlternates(pathname: string): Metadata['alternates'] {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const origin = getSiteOrigin().replace(/\/$/, '');
  let canonical: string;
  try {
    canonical = new URL(`/en${path}`, `${origin}/`).href;
  } catch {
    return undefined;
  }
  const withLang = (lang: 'zh' | 'en') => new URL(`/${lang}${path}`, `${origin}/`).href;
  return {
    canonical,
    languages: {
      'x-default': new URL(path, `${origin}/`).href,
      'zh-CN': withLang('zh'),
      'en-US': withLang('en'),
    },
  };
}

/** Use in route `layout.tsx` for `export const metadata`. Pass `pathname` (e.g. `/cobots/r-core`) for hreflang. */
export function pageMetadata(
  titleFocus: string,
  descriptionSentence: string,
  pathname?: string,
): Metadata {
  const meta: Metadata = {
    title: seoTitle(titleFocus),
    description: seoDescription(descriptionSentence),
  };
  if (pathname) {
    const alternates = languageAlternates(pathname);
    if (alternates) meta.alternates = alternates;
  }
  return meta;
}

export const rootMetadata: Metadata = {
  ...(typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' &&
  process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
  title: seoTitle('Collaborative Cobot Lineup'),
  description: seoDescription(
    'Collaborative Cobot models and robotic arm specifications for factories, labs, retail, and OEM deployment.',
  ),
  robots: { index: true, follow: true },
};
