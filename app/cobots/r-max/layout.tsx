/**
 * `/cobots/r-max` — 沉浸产品页壳层与 r‑core 对齐（GLB 预加载、Model Viewer、OG）。
 * 文案走 `pages.r_max`；结构/CSS 与 r‑core 共用，见 `lib/cobot-immersive-page-config.ts`。
 */
import type { Metadata } from 'next';
import { ArmRouteShell } from '@/components/ArmRouteShell';
import { GlbPreloadLinks, GLB_PRELOAD_R_MAX_HERO } from '@/components/GlbPreloadLinks';
import { ModelViewerScript } from '@/components/ModelViewerScript';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import {
  R_CORE_OG_IMAGE_SIZE,
  R_MAX_OG_VARIANT_ID,
  rMaxOgProductImagePath,
} from '@/lib/cobot-immersive-page-config';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata, productSocialMetadata } from '@/lib/site-seo';
import { robotVariantImageAlt } from '@/data/products';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const page = getMessages(lang).pages.r_max;
  const ogAlt = robotVariantImageAlt(R_MAX_OG_VARIANT_ID, lang);
  return {
    ...pageMetadata(page.metaTitleFocus, page.metaDescription, '/cobots/r-max', lang, siteOrigin),
    ...productSocialMetadata(
      page.metaTitleFocus,
      page.metaDescription,
      siteOrigin,
      rMaxOgProductImagePath(),
      ogAlt,
      R_CORE_OG_IMAGE_SIZE,
    ),
  };
}

export default async function CobotsRMaxLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <ArmRouteShell>
      <ModelViewerScript />
      <GlbPreloadLinks hrefs={GLB_PRELOAD_R_MAX_HERO} />
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-cobots-r-max"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/r-max', en: 'r-Max (High Payload)' },
        ]}
      />
      {children}
    </ArmRouteShell>
  );
}
