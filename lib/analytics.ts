/** GA4 custom events — no-op when measurement ID is unset or gtag unavailable */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return;
  window.gtag('event', name, params);
}
