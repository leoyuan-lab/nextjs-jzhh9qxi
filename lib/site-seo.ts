import type { Metadata, Viewport } from 'next';

import {
  SITE_BRAND_ORBIT_LOGO_PATH,
  SITE_BRAND_TOUCH_ICON_PATH,
} from '@/lib/site-brand-paths';
import { getSiteOrigin } from '@/lib/site-origin-fallback';

export { SITE_BRAND_ORBIT_LOGO_PATH, SITE_BRAND_TOUCH_ICON_PATH };

/** Single source for `viewport` export — keep `viewport-fit: cover` so safe-area insets land
 *  under the mobile hamburger overlay (else iOS / Android leave a strip at the status bar). */
export const rootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const ROOT_TITLE_FOCUS = 'Collaborative Cobot Lineup';
const ROOT_DESCRIPTION_BODY =
  'Collaborative Cobot models and robotic arm specifications for factories, labs, retail, and OEM deployment.';

/** Visible <title> — brand suffix unified for Roooll (see locales for product focus phrases). */
export function seoTitle(focusPhrase: string): string {
  const trimmed = focusPhrase.trim();
  return `${trimmed} | Roooll - Collaborative Robots`;
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
 * `rel="alternate"` + hreflang. Canonical must match **this** language URL (not always `/en/...`).
 * Pass `siteOrigin` from `getRequestSiteOrigin()` in RSC so preview domains match Lighthouse.
 */
export function languageAlternates(
  pathname: string,
  canonicalLang: 'zh' | 'en',
  siteOrigin?: string,
): Metadata['alternates'] {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const origin = (siteOrigin ?? getSiteOrigin()).replace(/\/$/, '');
  let canonical: string;
  try {
    canonical = new URL(`/${canonicalLang}${path}`, `${origin}/`).href;
  } catch {
    return undefined;
  }
  const withLang = (lang: 'zh' | 'en') => new URL(`/${lang}${path}`, `${origin}/`).href;
  return {
    canonical,
    languages: {
      'x-default': withLang('en'),
      'zh-CN': withLang('zh'),
      'en-US': withLang('en'),
    },
  };
}

/**
 * Pass `siteOrigin` from `getRequestSiteOrigin()` whenever `pathname` is set (see `languageAlternates`).
 */
export function pageMetadata(
  titleFocus: string,
  descriptionSentence: string,
  pathname?: string,
  canonicalLang?: 'zh' | 'en',
  siteOrigin?: string,
): Metadata {
  const meta: Metadata = {
    title: seoTitle(titleFocus),
    description: seoDescription(descriptionSentence),
  };
  if (pathname && canonicalLang) {
    const alternates = languageAlternates(pathname, canonicalLang, siteOrigin);
    if (alternates) meta.alternates = alternates;
  }
  return meta;
}

/**
 * Open Graph + Twitter cards for product routes that share a hero / product still.
 * Use `imagePathname` as a site-root path (e.g. `/images/robots/...webp`) so `siteOrigin` from
 * `getRequestSiteOrigin()` keeps preview deployments and production aligned.
 */
export function productSocialMetadata(
  titleFocus: string,
  descriptionSentence: string,
  siteOrigin: string,
  imagePathname: string,
  imageAlt: string,
  imageSize: { width: number; height: number },
): Pick<Metadata, 'openGraph' | 'twitter'> {
  const origin = siteOrigin.replace(/\/$/, '');
  const path = imagePathname.startsWith('/') ? imagePathname : `/${imagePathname}`;
  let imageUrl: string;
  try {
    imageUrl = new URL(path, `${origin}/`).href;
  } catch {
    imageUrl = `${origin}${path}`;
  }
  const title = seoTitle(titleFocus);
  const description = seoDescription(descriptionSentence);
  return {
    openGraph: {
      type: 'website',
      siteName: 'Roooll',
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: imageSize.width,
          height: imageSize.height,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

const rootTitle = seoTitle(ROOT_TITLE_FOCUS);
const rootDescription = seoDescription(ROOT_DESCRIPTION_BODY);

/** Vercel preview / local dev should not compete with production in search indexes. */
export function isProductionIndexable(): boolean {
  const env = process.env.VERCEL_ENV;
  return env !== 'preview' && env !== 'development';
}

export function productionIndexRobots(): { index: boolean; follow: boolean } {
  return isProductionIndexable()
    ? { index: true, follow: true }
    : { index: false, follow: false };
}

/** Routes that exist in code but are not ready for search / AI indexing yet. */
export function draftRouteRobots(): Metadata['robots'] {
  return { index: false, follow: false };
}

export const rootMetadata: Metadata = {
  ...(typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' &&
  process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
  title: rootTitle,
  description: rootDescription,
  applicationName: 'Roooll',
  robots: productionIndexRobots(),
  /** Tab favicon: `app/icon.svg`. Home-screen tile: `icons.other` avoids a misleading `apple` key; `rel` is still the required platform value. */
  icons: {
    other: [
      {
        rel: 'apple-touch-icon',
        url: SITE_BRAND_TOUCH_ICON_PATH,
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'Roooll',
    title: rootTitle,
    description: rootDescription,
    images: [
      {
        url: SITE_BRAND_ORBIT_LOGO_PATH,
        alt: 'Roooll collaborative robots Cobot brand emblem with planetary ring.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: rootTitle,
    description: rootDescription,
    images: [SITE_BRAND_ORBIT_LOGO_PATH],
  },
};
