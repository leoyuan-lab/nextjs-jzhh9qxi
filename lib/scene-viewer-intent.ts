/** Play Store — ARCore (never fall back to the current page URL). */
const ARCORE_PLAY_STORE =
  'https://play.google.com/store/apps/details?id=com.google.ar.core';

/**
 * Scene Viewer must fetch the GLB from a **public** HTTPS origin.
 * Use `NEXT_PUBLIC_SITE_URL` when set so local/dev taps still point at production assets.
 */
export function resolvePublicModelUrl(modelPath: string): string {
  const normalized = modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (site) return `${site}${normalized}`;
  if (typeof window !== 'undefined') {
    return new URL(normalized, window.location.href).href;
  }
  return normalized;
}

/**
 * `ar_only` must target Google Play Services for AR — not the Google Search app.
 * @see https://developers.google.com/ar/develop/scene-viewer#ar-only
 */
export function buildSceneViewerIntentUrl(absoluteModelUrl: string): string {
  const file = encodeURIComponent(absoluteModelUrl);
  const fallback = encodeURIComponent(ARCORE_PLAY_STORE);
  const title = encodeURIComponent('Roooll Cobot');
  return (
    `intent://arvr.google.com/scene-viewer/1.0?file=${file}&mode=ar_only&title=${title}` +
    `#Intent;scheme=https;package=com.google.ar.core;` +
    `action=android.intent.action.VIEW;S.browser_fallback_url=${fallback};end;`
  );
}

/**
 * Launch the **native** Scene Viewer app (not a Chrome tab on arvr.google.com).
 * The intent is handled by Google app / ARCore — address bar stays in-app, not a website.
 */
export function openSceneViewerForModel(modelPath: string): void {
  if (typeof document === 'undefined') return;
  const absolute = resolvePublicModelUrl(modelPath);
  const anchor = document.createElement('a');
  anchor.href = buildSceneViewerIntentUrl(absolute);
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
