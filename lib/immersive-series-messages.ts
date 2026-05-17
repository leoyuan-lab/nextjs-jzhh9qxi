/**
 * r‑Lite / r‑Ultra 沉浸详情页共用：文案命名空间与校验。
 * 样式与结构以 `app/globals.css` 下 `.arm-page-root` 与共享组件为准。
 */
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';

export type ImmersiveMessagesPageKey = 'r_lite' | 'r_ultra';

export type ImmersiveProductRouteId = 'r-lite' | 'r-ultra';

export function immersiveProductRouteToPageKey(route: ImmersiveProductRouteId): ImmersiveMessagesPageKey {
  return route === 'r-ultra' ? 'r_ultra' : 'r_lite';
}

/** 卷轴 `{{…}}` 模板与 GLB 英雄款：r‑lite → FR3‑C，r‑ultra → FR30。 */
export function immersiveScrollFilmCatalogVariantId(
  pageKey: ImmersiveMessagesPageKey,
): 'fr3-c' | 'fr30-std' {
  return pageKey === 'r_ultra' ? 'fr30-std' : 'fr3-c';
}

/** 长叙事主视觉（蓝图 / 尾屏场景图）对应的目录款。 */
export function immersivePrimaryCatalogVariantId(
  pageKey: ImmersiveMessagesPageKey,
): 'fr3-c' | 'fr30-std' {
  return pageKey === 'r_ultra' ? 'fr30-std' : 'fr3-c';
}

/** 法兰段静帧 `alt`：与 `alt.hero_*` / `r_lite_detail_flange` 对齐。 */
export function immersiveFlangeHeroAlt(lang: AppLocale, pageKey: ImmersiveMessagesPageKey): string {
  const msgs = getMessages(lang);
  return pageKey === 'r_ultra' ? msgs.alt.hero_rultra : msgs.alt.r_lite_detail_flange;
}

/** `pages.*.scroll_film`，缺失时抛错，避免半接入时静默空白。 */
export function readScrollFilmNamespace(lang: AppLocale, pageKey: ImmersiveMessagesPageKey): unknown {
  const pack = getMessages(lang).pages[pageKey] as Record<string, unknown> | undefined;
  const sf = pack?.scroll_film;
  if (sf == null || typeof sf !== 'object') {
    throw new Error(
      `[immersive] locales pages.${pageKey}.scroll_film missing — mirror pages.r_lite.scroll_film (en/zh). See lib/cobot-immersive-page-config.ts.`,
    );
  }
  return sf;
}
