import type { Metadata } from 'next';

import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { ProductJsonLd } from '@/components/ProductJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import {
  R_CORE_LITE_OG_IMAGE_SIZE,
  rCoreLiteHeroImagePath,
} from '@/lib/rcore-lite-page-config';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata, productSocialMetadata } from '@/lib/site-seo';
import { robotVariantImageAlt } from '@/data/products';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const page = getMessages(lang).pages.r_core;
  const ogAlt = getMessages(lang).alt.hero_rcore ?? robotVariantImageAlt('fr5-std', lang);
  return {
    ...pageMetadata(page.metaTitleFocus, page.metaDescription, '/cobots/r-core', lang, siteOrigin),
    ...productSocialMetadata(
      page.metaTitleFocus,
      page.metaDescription,
      siteOrigin,
      rCoreLiteHeroImagePath(),
      ogAlt,
      R_CORE_LITE_OG_IMAGE_SIZE,
    ),
  };
}

export default async function CobotsRCoreLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const page = getMessages(lang).pages.r_core;

  return (
    <>
      <ProductJsonLd
        familyId="r-core"
        lang={lang}
        origin={siteOrigin}
        pagePath="/cobots/r-core"
        description={page.metaDescription}
        imagePathname={rCoreLiteHeroImagePath()}
      />
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-cobots-r-core"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/r-core', en: 'r-Core (Line-ready)' },
        ]}
      />
      {children}
    </>
  );
}
