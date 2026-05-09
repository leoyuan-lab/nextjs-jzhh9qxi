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

export const GLB_PRELOAD_HOME = [cobotGlbModels.rCoreFr5C, cobotGlbModels.rMaxFr20] as const;
/** `/cobots/r-core`、`/selector/advisor` 等与 FR5‑C hero 模型同路的预加载 */
export const GLB_PRELOAD_R_CORE_HERO = [cobotGlbModels.rCoreFr5C] as const;
