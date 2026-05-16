/**
 * Origin resolver without `next/headers` — safe for Client Components and shared modules.
 */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

/** Prefer the live document origin in the browser (preview domains, local dev). */
export function getSiteOriginForClient(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return getSiteOrigin();
}
