import type { Metadata } from 'next';

import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_SELECTOR } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Product Advisor (Find Your Match)',
  'Interactive r‑Series Cobot and robotic arm advisor: match load, reach, and environment to the right collaborative robot line.',
  '/selector/advisor',
);

export default async function SelectorAdvisorLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-selector-advisor"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_SELECTOR.href, en: BC_NAV_SELECTOR.en },
          { href: '/selector/advisor', en: 'Product Advisor (Find Your Match)' },
        ]}
      />
      {children}
    </>
  );
}
