/**
 * 全系机型规格页外壳（`cobots/all-cobots-specs`）。
 */
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'All cobots & Specs',
  'Browse every r‑Series Cobot variant matrix: payloads, robotic arm axes, repeats, reaches, and power notes in one view.',
  '/cobots/all-cobots-specs',
);

export default async function CobotsAllSpecsLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-cobots-all-specs"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/all-cobots-specs', en: 'All cobots & Specs' },
        ]}
      />
      {children}
    </>
  );
}
