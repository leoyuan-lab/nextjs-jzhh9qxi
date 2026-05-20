/** Opens the global inquiry drawer with optional prefill and analytics source. */
export function openInquiry(options?: { body?: string; source?: string }) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('roooll-inquiry-open', {
      detail: {
        body: options?.body,
        source: options?.source,
      },
    }),
  );
}
