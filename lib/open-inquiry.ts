import { trackEvent } from '@/lib/analytics';

/** Opens the global inquiry drawer with optional prefill and analytics source. */
export function openInquiry(options?: { body?: string; source?: string }) {
  if (typeof window === 'undefined') return;
  const source = options?.source ?? 'unknown';
  trackEvent('inquiry_open', {
    source,
    page_path: window.location.pathname,
  });
  window.dispatchEvent(
    new CustomEvent('roooll-inquiry-open', {
      detail: {
        body: options?.body,
        source,
      },
    }),
  );
}
