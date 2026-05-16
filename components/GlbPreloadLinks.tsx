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

/** 首屏仅预加载 r‑Core hero，避免与第二段 GLB 抢带宽；r‑Max 在首段 `load` 后再由 `model-viewer` 拉取。 */
export const GLB_PRELOAD_HOME = [cobotGlbModels.rCoreFr5C] as const;
/** `/cobots/r-core`、`/selector/advisor` 等与 FR5‑C hero 模型同路的预加载 */
export const GLB_PRELOAD_R_CORE_HERO = [cobotGlbModels.rCoreFr5C] as const;
/** `/cobots/r-max` 沉浸首屏 hero */
export const GLB_PRELOAD_R_MAX_HERO = [cobotGlbModels.rMaxFr20] as const;
