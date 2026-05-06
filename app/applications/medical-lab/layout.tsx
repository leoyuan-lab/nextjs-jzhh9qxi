import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_APPLICATIONS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  return pageMetadata(
    'Medical & Lab Cobots',
    'Medical and diagnostics Cobots deliver sterile tending, repeatable pipetting robotics, bench‑top robotic arms, ISO‑ready workflows.',
    '/applications/medical-lab',
    lang,
  );
}

export default async function MedicalLabLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
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
