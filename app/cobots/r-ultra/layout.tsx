/**
 * `/cobots/r-ultra` — 沉浸产品页壳层（GLB 预加载、Model Viewer、OG 分享图）。
 */
import type { Metadata } from 'next';
import { ArmRouteShell } from '@/components/ArmRouteShell';
import { GlbPreloadLinks, GLB_PRELOAD_R_ULTRA_HERO } from '@/components/GlbPreloadLinks';
import { ModelViewerScript } from '@/components/ModelViewerScript';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import {
  R_IMMERSIVE_OG_IMAGE_SIZE,
  R_ULTRA_OG_VARIANT_ID,
  rUltraOgProductImagePath,
} from '@/lib/cobot-immersive-page-config';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata, productSocialMetadata } from '@/lib/site-seo';
import { robotVariantImageAlt } from '@/data/products';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const page = getMessages(lang).pages.r_ultra;
  const ogAlt = robotVariantImageAlt(R_ULTRA_OG_VARIANT_ID, lang);
  return {
    ...pageMetadata(page.metaTitleFocus, page.metaDescription, '/cobots/r-ultra', lang, siteOrigin),
    ...productSocialMetadata(
      page.metaTitleFocus,
      page.metaDescription,
      siteOrigin,
      rUltraOgProductImagePath(),
      ogAlt,
      R_IMMERSIVE_OG_IMAGE_SIZE,
    ),
  };
}

export default async function CobotsRUltraLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <ArmRouteShell>
      <ModelViewerScript />
      <GlbPreloadLinks hrefs={GLB_PRELOAD_R_ULTRA_HERO} />
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-cobots-r-ultra"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/r-ultra', en: 'r-Ultra (High Payload)' },
        ]}
      />
      {children}
    </ArmRouteShell>
  );
}
