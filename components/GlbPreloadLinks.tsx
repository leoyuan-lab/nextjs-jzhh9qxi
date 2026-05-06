import { cobotGlbModels } from '@/data/products';
import { GLB_MIME_TYPE } from '@/lib/glb-preload-constants';

/** Next.js App Router hoists `<link>` in routes to `<head>`; keep attrs in sync with `lib/glb-cache.ts`. */
export function GlbPreloadLinks({ hrefs }: { hrefs: readonly string[] }) {
  return (
    <>
      {hrefs.map((href) => (
        <link
          key={href}
          rel="preload"
          href={href}
          as="fetch"
          type={GLB_MIME_TYPE}
          crossOrigin="anonymous"
        />
      ))}
    </>
  );
}

export const GLB_PRELOAD_HOME = [cobotGlbModels.rLiteFr3C, cobotGlbModels.rMaxFr20] as const;
export const GLB_PRELOAD_R_LITE_ONLY = [cobotGlbModels.rLiteFr3C] as const;
