import type { Metadata } from 'next';

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

/** Use in route `layout.tsx` for `export const metadata`. */
export function pageMetadata(titleFocus: string, descriptionSentence: string): Metadata {
  return {
    title: seoTitle(titleFocus),
    description: seoDescription(descriptionSentence),
  };
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
