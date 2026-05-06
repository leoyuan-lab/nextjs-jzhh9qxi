import type { Metadata } from 'next';
import { GlbPreloadLinks, GLB_PRELOAD_HOME } from '@/components/GlbPreloadLinks';
import { ModelViewerScript } from '@/components/ModelViewerScript';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Collaborative Cobot Lineup',
  'Explore Apple Robot Cobots across r‑Lite, r‑Core, r‑Reach, r‑Max, and r‑Ultra—browse interactive robotic arm showcases and lineup entry points.',
  '/',
);

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModelViewerScript />
      <GlbPreloadLinks hrefs={GLB_PRELOAD_HOME} />
      {children}
    </>
  );
}
