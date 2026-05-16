import { headers } from 'next/headers';
import { getSiteOrigin } from '@/lib/site-origin-fallback';

export { getSiteOrigin, getSiteOriginForClient } from '@/lib/site-origin-fallback';

/**
 * Origin for the **current HTTP request** (host/proto from `x-forwarded-*`).
 * Ensures canonical/hreflang absolute URLs match the URL Lighthouse is auditing
 * (e.g. `*.vercel.app` previews when `NEXT_PUBLIC_SITE_URL` points at production).
 */
export async function getRequestSiteOrigin(): Promise<string> {
  const h = await headers();
  const hostRaw = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  const host = hostRaw.split(',')[0]?.trim() ?? '';
  const proto = (h.get('x-forwarded-proto') ?? 'https').split(',')[0]?.trim() ?? 'https';
  if (host && !/^localhost(?::\d+)?$/i.test(host)) {
    try {
      return new URL(`${proto}://${host}`).origin;
    } catch {
      /* fall through */
    }
  }
  return getSiteOrigin();
}
