import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_R_ECOSYSTEM } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const p = getMessages(lang).pages.r_ecosystem_roooll_insight;
  return pageMetadata(p.metaTitleFocus, p.metaDescription, '/r-ecosystem/roooll-insight', lang, siteOrigin);
}

export default async function RooollInsightLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  const schema = getMessages('en').pages.r_ecosystem_roooll_insight.breadcrumbSchema;
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-r-ecosystem-roooll-insight"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_R_ECOSYSTEM.href, en: BC_NAV_R_ECOSYSTEM.en },
          { href: '/r-ecosystem/roooll-insight', en: schema },
        ]}
      />
      {children}
    </>
  );
}
