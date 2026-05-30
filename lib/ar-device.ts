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

/** Shortest viewport edge under 600px — phone-class AR layout (two-act curtain). */
export function isSmallArViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return Math.min(window.innerWidth, window.innerHeight) < 600;
}

/**
 * Devices that can launch Quick Look / Scene Viewer AR (phones, tablets).
 * Desktop browsers without AR are excluded.
 */
export function isArPreviewCapable(): boolean {
  if (typeof window === 'undefined') return false;
  if (detectIosQuickLookDevice()) return true;
  if (detectAndroidTabletDevice()) return true;
  return window.matchMedia('(max-width: 734px)').matches;
}

/** @deprecated Use `isArPreviewCapable` */
export function isHomeHeroArCapable(): boolean {
  return isArPreviewCapable();
}

/** In-app browsers often block AR deep links. */
export function detectInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /MicroMessenger|WeChat|FBAN|FBAV|Instagram|Line\//i.test(ua);
}

export type FlangeLayoutMode = 'no-ar' | 'ar-large' | 'ar-small';

export function resolveFlangeLayoutMode(): FlangeLayoutMode {
  if (!isArPreviewCapable()) return 'no-ar';
  if (isSmallArViewport()) return 'ar-small';
  return 'ar-large';
}
