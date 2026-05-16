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
