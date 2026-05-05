/**
 * r‑Core 详情路由（原 `app/arm`）：首帧黑底壳层 + 仅爬虫可见面包屑 Schema。
 */
import type { Metadata } from 'next';
import { ArmRouteShell } from '@/components/ArmRouteShell';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'r-Core Agile Series',
  'r‑Series r‑Core Cobot platform: agile collaborative robotic arm with industrial reach, repeatability, and tooling options.',
  '/cobots/r-core',
);

export default async function CobotsRCoreLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <ArmRouteShell>
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-cobots-rcore"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/r-core', en: 'r-Core (Agile Series)' },
        ]}
      />
      {children}
    </ArmRouteShell>
  );
}
