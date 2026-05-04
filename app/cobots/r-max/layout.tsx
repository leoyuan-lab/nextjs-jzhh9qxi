import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'r-Max Heavy Payload Cobot',
  'r‑Max Cobots cover FR16–FR20 class heavy payloads: compact and long‑reach robotic arm options for stamping, handling, palletizing.',
  '/cobots/r-max',
);

export default function CobotsRMaxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        id="jsonld-bc-cobots-r-max"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/r-max', en: 'r-Max (High Payload)' },
        ]}
      />
      {children}
    </>
  );
}
