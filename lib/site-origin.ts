/** Canonical origin for sitemap, robots, and hreflang (no trailing slash). */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}
