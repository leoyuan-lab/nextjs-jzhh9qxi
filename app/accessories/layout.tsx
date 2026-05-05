import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Cobot Accessories Ecosystem',
  'End‑effectors, vision kits, cabling, stands, safety stacks, and software bundles that complete your Cobot robotic arm workstation.',
  '/accessories',
);

export default async function AccessoriesLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-accessories"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: '/accessories', en: 'Cobot Accessories Ecosystem' },
        ]}
      />
      {children}
    </>
  );
}
