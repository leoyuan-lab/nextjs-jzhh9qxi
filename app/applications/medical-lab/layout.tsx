import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_APPLICATIONS } from '@/lib/nav-breadcrumbs';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Medical & Lab Cobots',
  'Medical and diagnostics Cobots deliver sterile tending, repeatable pipetting robotics, bench‑top robotic arms, ISO‑ready workflows.',
);

export default function MedicalLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        id="jsonld-bc-app-medlab"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_APPLICATIONS.href, en: BC_NAV_APPLICATIONS.en },
          { href: '/applications/medical-lab', en: 'Medical & Lab' },
        ]}
      />
      {children}
    </>
  );
}
