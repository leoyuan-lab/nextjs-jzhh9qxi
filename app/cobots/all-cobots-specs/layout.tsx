/**
 * 全系机型规格页外壳（`cobots/all-cobots-specs`）。
 */
import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const page = getMessages(lang).pages.all_cobots_specs;
  return pageMetadata(page.metaTitleFocus, page.metaDescription, '/cobots/all-cobots-specs');
}

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
