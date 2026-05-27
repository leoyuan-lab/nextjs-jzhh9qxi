/** iPhone / iPad / iPod, including iPadOS desktop UA (MacIntel + touch). */
export function detectIosQuickLookDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Android tablet UA (typically lacks "Mobile") or large touch Android layout.
 * Phones are covered separately via the 734px viewport rule.
 */
export function detectAndroidTabletDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (!/Android/i.test(ua)) return false;
  if (!/Mobile/i.test(ua)) return true;
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(min-width: 735px)').matches &&
    navigator.maxTouchPoints > 0
  );
}

/**
 * Home hero AR entry: phones (Scene Viewer / Quick Look) and tablets above the 734px phone layout.
 * Desktop browsers without AR are excluded.
 */
export function isHomeHeroArCapable(): boolean {
  if (typeof window === 'undefined') return false;
  if (detectIosQuickLookDevice()) return true;
  if (detectAndroidTabletDevice()) return true;
  return window.matchMedia('(max-width: 734px)').matches;
}
