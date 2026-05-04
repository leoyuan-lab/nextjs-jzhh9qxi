import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_ABOUT } from '@/lib/nav-breadcrumbs';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Contact Cobot Sales',
  'Contact Cobot OEM sales, integrations, quoting, demos, robotics arm PoCs via Apple Robot teams worldwide.',
  '/contact',
);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        id="jsonld-bc-contact"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_ABOUT.href, en: BC_NAV_ABOUT.en },
          { href: '/contact', en: 'Contact Us' },
        ]}
      />
      {children}
    </>
  );
}
