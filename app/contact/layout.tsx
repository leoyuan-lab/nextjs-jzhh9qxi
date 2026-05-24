import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_ABOUT } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  return pageMetadata(
    'Contact Cobot Sales',
    'Contact Cobot OEM sales, integrations, quoting, demos, robotics arm PoCs via Roooll teams worldwide.',
    '/contact',
    lang,
    siteOrigin,
  );
}

export default async function ContactLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-contact"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_ABOUT.href, en: BC_NAV_ABOUT.en },
          { href: '/contact', en: 'Contact Roooll' },
        ]}
      />
      {children}
    </>
  );
}
