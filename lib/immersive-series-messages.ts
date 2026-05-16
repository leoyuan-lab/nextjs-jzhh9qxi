/**
 * r‑Core / 未来 r‑Max 沉浸详情页共用：文案命名空间与校验。
 * 样式与结构以 `app/globals.css` 下 `.arm-page-root` 与共享组件为准，勿在 r‑max 下重复一份 CSS。
 */
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';

export type ImmersiveMessagesPageKey = 'r_core' | 'r_max';

export type ImmersiveProductRouteId = 'r-core' | 'r-max';

export function immersiveProductRouteToPageKey(route: ImmersiveProductRouteId): ImmersiveMessagesPageKey {
  return route === 'r-max' ? 'r_max' : 'r_core';
}

/** 卷轴 `{{…}}` 模板与 GLB 英雄款：r‑core → FR5‑C，r‑max → FR20。 */
export function immersiveScrollFilmCatalogVariantId(
  pageKey: ImmersiveMessagesPageKey,
): 'fr5-c' | 'fr20-std' {
  return pageKey === 'r_max' ? 'fr20-std' : 'fr5-c';
}

/** 长叙事主视觉（蓝图 / 尾屏场景图）对应的目录款。 */
export function immersivePrimaryCatalogVariantId(
  pageKey: ImmersiveMessagesPageKey,
): 'fr5-c' | 'fr20-std' {
  return pageKey === 'r_max' ? 'fr20-std' : 'fr5-c';
}

/** 法兰段静帧 `alt`：与 `alt.hero_*` / `r_core_detail_flange` 对齐。 */
export function immersiveFlangeHeroAlt(lang: AppLocale, pageKey: ImmersiveMessagesPageKey): string {
  const msgs = getMessages(lang);
  return pageKey === 'r_max' ? msgs.alt.hero_rmax : msgs.alt.r_core_detail_flange;
}

/** `pages.*.scroll_film`，缺失时抛错，避免 r‑max 半接入时静默空白。 */
export function readScrollFilmNamespace(lang: AppLocale, pageKey: ImmersiveMessagesPageKey): unknown {
  const pack = getMessages(lang).pages[pageKey] as Record<string, unknown> | undefined;
  const sf = pack?.scroll_film;
  if (sf == null || typeof sf !== 'object') {
    throw new Error(
      `[immersive] locales pages.${pageKey}.scroll_film missing — mirror pages.r_core.scroll_film (en/zh). See lib/cobot-immersive-page-config.ts.`,
    );
  }
  return sf;
}
