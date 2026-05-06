import type { Metadata } from 'next';
import { GlbPreloadLinks, GLB_PRELOAD_HOME } from '@/components/GlbPreloadLinks';
import { ModelViewerScript } from '@/components/ModelViewerScript';
import { getSiteLang } from '@/lib/get-site-lang';
import { pageMetadata } from '@/lib/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getSiteLang();
  return pageMetadata(
    'Collaborative Cobot Lineup',
    'Explore Roooll Cobots across r‑Lite, r‑Core, r‑Reach, r‑Max, and r‑Ultra—browse interactive robotic arm showcases and lineup entry points.',
    '/',
    lang,
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModelViewerScript />
      <GlbPreloadLinks hrefs={GLB_PRELOAD_HOME} />
      {children}
    </>
  );
}
