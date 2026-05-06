/**
 * Canonical origin for sitemap, robots, hreflang, and `<link rel="canonical">`.
 * Set `NEXT_PUBLIC_SITE_URL` to your **production** base (no trailing slash) in all Vercel environments
 * so preview deployments still emit production canonical URLs instead of `*.vercel.app`.
 */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}
