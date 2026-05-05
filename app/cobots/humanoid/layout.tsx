import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Humanoid Embodied Cobot Vision',
  'Humanoid Cobot roadmap: embodied AI tooling, tactile interaction, and next‑gen robotic arm research partnerships.',
  '/cobots/humanoid',
);

export default async function CobotsHumanoidLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-cobots-humanoid"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/humanoid', en: 'Humanoid (Embodied AI)' },
        ]}
      />
      {children}
    </>
  );
}
