import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_SELECTOR } from '@/lib/nav-breadcrumbs';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Side-by-Side Cobot Comparison',
  'Interactive home experience for comparing heavyweight vs agile Cobots and exploring flagship robotic arm visual stories.',
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
