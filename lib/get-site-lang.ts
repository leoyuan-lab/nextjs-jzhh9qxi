import { cookies, headers } from 'next/headers';

/**
 * Prefer middleware (`x-site-lang`); fall back to `user-lang` cookie — matches
 * `app/layout.tsx` so `generateMetadata` stays correct on Vercel when a pass
 * omits the custom header (e.g. certain prefetch/internal requests).
 */
export async function getSiteLang(): Promise<'zh' | 'en'> {
  const h = await headers();
  const fromMiddleware = h.get('x-site-lang');
  if (fromMiddleware === 'en' || fromMiddleware === 'zh') return fromMiddleware;

  const jar = await cookies();
  const fromCookie = jar.get('user-lang')?.value;
  if (fromCookie === 'en' || fromCookie === 'zh') return fromCookie;

  return 'zh';
}
