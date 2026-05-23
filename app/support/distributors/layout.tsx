import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_SUPPORT } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  return pageMetadata(
    'Authorized Cobot Distributors',
    'Roooll authorized distributor channel—contact our team for pricing packs, co-marketing assets, and partner onboarding for collaborative robot distributors.',
    '/support/distributors',
    lang,
    siteOrigin,
  );
}

export default async function SupportDistributorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-support-distributors"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_SUPPORT.href, en: BC_NAV_SUPPORT.en },
          { href: '/support/resources', en: 'Resource Center (Downloads)' },
          { href: '/support/distributors', en: 'Authorized Distributors' },
        ]}
      />
      {children}
    </>
  );
}
