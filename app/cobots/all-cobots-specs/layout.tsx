/**
 * 全系机型规格页外壳（`cobots/all-cobots-specs`）。
 * Lineup UI lives here so `/all-cobots-specs` ↔ `/all-cobots-specs/{slug}` does not remount the client.
 */
import type { Metadata } from 'next';
import { AllCobotsLineupJsonLd } from '@/components/AllCobotsLineupJsonLd';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';
import AllCobotsSpecsClient from './AllCobotsSpecsClient';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const page = getMessages(lang).pages.all_cobots_specs;
  return pageMetadata(page.metaTitleFocus, page.metaDescription, '/cobots/all-cobots-specs', lang, siteOrigin);
}

export default async function CobotsAllSpecsLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  return (
    <>
      <AllCobotsLineupJsonLd lang={lang} origin={siteOrigin} />
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-cobots-all-specs"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/all-cobots-specs', en: 'r-series cobots & Specs' },
        ]}
      />
      <AllCobotsSpecsClient />
      {children}
    </>
  );
}
