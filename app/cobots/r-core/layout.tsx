/**
 * `/cobots/r-core`：r‑Core（FR5‑C）详情；首帧黑底壳层 + 仅爬虫可见面包屑 Schema。
 */
import type { Metadata } from 'next';
import { ArmRouteShell } from '@/components/ArmRouteShell';
import { GlbPreloadLinks, GLB_PRELOAD_R_CORE_HERO } from '@/components/GlbPreloadLinks';
import { ModelViewerScript } from '@/components/ModelViewerScript';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import { BC_HOME, BC_NAV_COBOTS } from '@/lib/nav-breadcrumbs';
import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  const page = getMessages(lang).pages.r_core;
  return pageMetadata(page.metaTitleFocus, page.metaDescription, '/cobots/r-core', lang, siteOrigin);
}

export default async function CobotsRCoreLayout({ children }: { children: React.ReactNode }) {
  const lang = await getSiteLang();
  return (
    <ArmRouteShell>
      <ModelViewerScript />
      <GlbPreloadLinks hrefs={GLB_PRELOAD_R_CORE_HERO} />
      <BreadcrumbJsonLd
        lang={lang}
        id="jsonld-bc-cobots-rcore"
        items={[
          { href: BC_HOME.href, en: BC_HOME.en },
          { href: BC_NAV_COBOTS.href, en: BC_NAV_COBOTS.en },
          { href: '/cobots/r-core', en: 'r-Core (FR5-C)' },
        ]}
      />
      {children}
    </ArmRouteShell>
  );
}
