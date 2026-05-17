/**
 * `/cobots/r-lite`：r‑Lite 沉浸产品页；首帧黑底壳层 + 仅爬虫可见面包屑 Schema。
 */
import type { Metadata } from 'next';
import { ArmRouteShell } from '@/components/ArmRouteShell';
import { GlbPreloadLinks, GLB_PRELOAD_R_LITE_HERO } from '@/components/GlbPreloadLinks';
import { ModelViewerScript } from '@/components/ModelViewerScript';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import {
  R_IMMERSIVE_OG_IMAGE_SIZE,
  R_LITE_OG_VARIANT_ID,
  rLiteOgProductImagePath,
} from '@/lib/cobot-immersive-page-config';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata, productSocialMetadata } from '@/lib/site-seo';
import { robotVariantImageAlt } from '@/data/products';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const page = getMessages(lang).pages.r_lite;
  const ogAlt = robotVariantImageAlt(R_LITE_OG_VARIANT_ID, lang);
  return {
    ...pageMetadata(page.metaTitleFocus, page.metaDescription, '/cobots/r-lite', lang, siteOrigin),
    ...productSocialMetadata(
      page.metaTitleFocus,
      page.metaDescription,
      siteOrigin,
      rLiteOgProductImagePath(),
      ogAlt,
      R_IMMERSIVE_OG_IMAGE_SIZE,
    ),
  };
}

export default async function CobotsRLiteLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <ArmRouteShell>
      <ModelViewerScript />
      <GlbPreloadLinks hrefs={GLB_PRELOAD_R_LITE_HERO} />
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-cobots-r-lite"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/r-lite', en: 'r-Lite (Integrated Controller)' },
        ]}
      />
      {children}
    </ArmRouteShell>
  );
}
