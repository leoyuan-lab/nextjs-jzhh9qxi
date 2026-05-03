import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Cobot Accessories Ecosystem',
  'End‑effectors, vision kits, cabling, stands, safety stacks, and software bundles that complete your Cobot robotic arm workstation.',
);

export default function CobotsAccessoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        id="jsonld-bc-cobots-accessories"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/accessories', en: 'Cobot Accessories' },
        ]}
      />
      {children}
    </>
  );
}
