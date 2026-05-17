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

/** 首屏仅预加载 r‑Lite hero，避免与第二段 GLB 抢带宽；r‑Ultra 在首段 `load` 后再拉取。 */
export const GLB_PRELOAD_HOME = [cobotGlbModels.rLiteFr3C] as const;
/** `/cobots/r-lite`、`/selector/advisor` 等与 FR3‑C hero 模型同路的预加载 */
export const GLB_PRELOAD_R_LITE_HERO = [cobotGlbModels.rLiteFr3C] as const;
/** `/cobots/r-ultra` 沉浸首屏 hero */
export const GLB_PRELOAD_R_ULTRA_HERO = [cobotGlbModels.rUltraFr30] as const;
