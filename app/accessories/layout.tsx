import type { Metadata } from 'next';
import { AccessoriesJsonLd } from '@/components/accessories/AccessoriesJsonLd';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  return pageMetadata(
    'Cobot Accessories Ecosystem',
    'Roooll control cabinets, grippers, and fixtures for your Cobot robotic arm workstation—browse specs by category and inquire for quotes.',
    '/accessories',
    lang,
    siteOrigin,
  );
}

export default async function AccessoriesLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();

  return (
    <>
      <AccessoriesJsonLd lang={lang} origin={siteOrigin} />
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-accessories"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: '/accessories', en: 'Cobot Accessories Ecosystem' },
        ]}
      />
      {children}
    </>
  );
}
