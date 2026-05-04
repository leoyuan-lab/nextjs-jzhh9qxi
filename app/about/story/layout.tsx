import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_ABOUT } from '@/lib/nav-breadcrumbs';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Our Cobot Story',
  'Mission, lineage, robotics arm engineering principles, roadmap transparency, Cobot stewardship from Apple Robot founders.',
  '/about/story',
);

export default function AboutStoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        id="jsonld-bc-about-story"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_ABOUT.href, en: BC_NAV_ABOUT.en },
          { href: '/about/story', en: 'Our Story' },
        ]}
      />
      {children}
    </>
  );
}
