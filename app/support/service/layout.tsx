import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_SUPPORT } from '@/lib/nav-breadcrumbs';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Global Cobot Service',
  'Global service for robotic arm fleets: RMA portals, SLA packs, robotics arm preventative maintenance, escalation lines.',
);

export default function SupportServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        id="jsonld-bc-support-service"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_SUPPORT.href, en: BC_NAV_SUPPORT.en },
          { href: '/support/service', en: 'Global Service Support' },
        ]}
      />
      {children}
    </>
  );
}
