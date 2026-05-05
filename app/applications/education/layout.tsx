import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_APPLICATIONS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Education Cobot Programs',
  'University and research Cobot labs deploy curriculum bundles, LMS integration, robotics arm curriculum, embodied AI demos.',
  '/applications/education',
);

export default async function EducationLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-app-edu"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_APPLICATIONS.href, en: BC_NAV_APPLICATIONS.en },
          { href: '/applications/education', en: 'Education & Research' },
        ]}
      />
      {children}
    </>
  );
}
