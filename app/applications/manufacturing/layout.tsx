import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_APPLICATIONS } from '@/lib/nav-breadcrumbs';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Smart Manufacturing Cobots',
  'Smart factory Cobots: CNC tending, AOI, adhesives, and line‑balancing with programmable collaborative robotic arms.',
);

export default function ManufacturingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        id="jsonld-bc-app-mfg"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_APPLICATIONS.href, en: BC_NAV_APPLICATIONS.en },
          { href: '/applications/manufacturing', en: 'Smart Manufacturing' },
        ]}
      />
      {children}
    </>
  );
}
