import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_APPLICATIONS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  return pageMetadata(
    'Retail & Service Cobot Applications',
    'Retail and front‑house Cobots: compact robotic arms for greetings, dispensing, tending kiosks, and reliable service chores.',
    '/applications/retail-service',
    lang,
    siteOrigin,
  );
}

export default async function RetailServiceLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-app-retail"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_APPLICATIONS.href, en: BC_NAV_APPLICATIONS.en },
          { href: '/applications/retail-service', en: 'Retail & Service' },
        ]}
      />
      {children}
    </>
  );
}
