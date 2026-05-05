import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_SUPPORT } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Cobot Downloads & CAD',
  'Resource Center for Cobot CAD, conformity packs, certs, PLC snippets, robotics arm cabling drawings, manuals, revisions.',
  '/support/resources',
);

export default async function SupportResourcesLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-support-resources"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_SUPPORT.href, en: BC_NAV_SUPPORT.en },
          { href: '/support/resources', en: 'Resource Center (Downloads)' },
        ]}
      />
      {children}
    </>
  );
}
