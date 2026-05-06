/**
 * r‑Lite 详情路由（原 `app/arm`）：首帧黑底壳层 + 仅爬虫可见面包屑 Schema。
 */
import type { Metadata } from 'next';
import { ArmRouteShell } from '@/components/ArmRouteShell';
import { GlbPreloadLinks, GLB_PRELOAD_R_LITE_ONLY } from '@/components/GlbPreloadLinks';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const page = getMessages(lang).pages.r_core;
  return pageMetadata(page.metaTitleFocus, page.metaDescription, '/cobots/r-core');
}

export default async function CobotsRCoreLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <ArmRouteShell>
      <GlbPreloadLinks hrefs={GLB_PRELOAD_R_LITE_ONLY} />
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-cobots-rcore"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/r-core', en: 'r-Lite (FR3-C)' },
        ]}
      />
      {children}
    </ArmRouteShell>
  );
}
