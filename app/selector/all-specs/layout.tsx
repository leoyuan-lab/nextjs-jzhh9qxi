/**
 * 全系选型页外壳（`selector/all-specs`）。
 */
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_SELECTOR } from '@/lib/nav-breadcrumbs';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Selector All Models & Specs',
  'Browse every r‑Series Cobot variant matrix: payloads, robotic arm axes, repeats, reaches, and power notes in one Selector.',
  '/selector/all-specs',
);

export default function SelectorAllSpecsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        id="jsonld-bc-selector-all-specs"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_SELECTOR.href, en: BC_NAV_SELECTOR.en },
          { href: '/selector/all-specs', en: 'All Models & Specs' },
        ]}
      />
      {children}
    </>
  );
}
