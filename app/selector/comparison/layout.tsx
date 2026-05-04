import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_SELECTOR } from '@/lib/nav-breadcrumbs';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Side-by-Side Cobot Comparison',
  'Side-by-side r-Series Cobot and robotic arm comparison: choose three models and inspect payload, reach, axes, and power specs in one view.',
  '/selector/comparison',
);

export default function SelectorComparisonLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        id="jsonld-bc-selector-comparison"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_SELECTOR.href, en: BC_NAV_SELECTOR.en },
          { href: '/selector/comparison', en: 'Side-by-Side Comparison' },
        ]}
      />
      {children}
    </>
  );
}
