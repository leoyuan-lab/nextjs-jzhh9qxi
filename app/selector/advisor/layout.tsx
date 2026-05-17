import type { Metadata } from 'next';

import { GlbPreloadLinks, GLB_PRELOAD_R_LITE_HERO } from '@/components/GlbPreloadLinks';
import { ModelViewerScript } from '@/components/ModelViewerScript';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_SELECTOR } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const page = getMessages(lang).pages.selector_advisor;
  return pageMetadata(page.metaTitleFocus, page.metaDescription, '/selector/advisor', lang, siteOrigin);
}

export default async function SelectorAdvisorLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <ModelViewerScript />
      <GlbPreloadLinks hrefs={GLB_PRELOAD_R_LITE_HERO} />
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-selector-advisor"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_SELECTOR.href, en: BC_NAV_SELECTOR.en },
          { href: '/selector/advisor', en: 'Product Advisor (Find Your Match)' },
        ]}
      />
      {children}
    </>
  );
}
