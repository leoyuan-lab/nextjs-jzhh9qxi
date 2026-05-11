import type { Metadata } from 'next';
import { GlbPreloadLinks, GLB_PRELOAD_HOME } from '@/components/GlbPreloadLinks';
import { ModelViewerScript } from '@/components/ModelViewerScript';
import { getSiteLang } from '@/lib/get-site-lang';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  const siteOrigin = await getRequestSiteOrigin();
  return pageMetadata(
    'Collaborative Cobot Lineup',
    'Explore Roooll Cobots across r‑Lite, r‑Core, r‑Reach, r‑Max, and r‑Ultra—browse interactive robotic arm showcases and lineup entry points.',
    '/',
    lang,
    siteOrigin,
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 与首屏加载层同图：提前声明减少 Chrome 刷新缓存命中时首帧位图解码/合成抖动 */}
      <link rel="preload" href="/images/brand/roooll-loading-logo.png" as="image" type="image/png" />
      <ModelViewerScript />
      <GlbPreloadLinks hrefs={GLB_PRELOAD_HOME} />
      {children}
    </>
  );
}
