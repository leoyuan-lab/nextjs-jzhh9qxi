import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/** Syncs `?lang=zh|en` to the `user-lang` cookie so SSR matches hreflang alternate URLs. */
export function middleware(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('lang');
  const lang = raw === 'en' ? 'en' : raw === 'zh' ? 'zh' : null;
  if (!lang) return NextResponse.next();

  const res = NextResponse.next();
  res.cookies.set('user-lang', lang, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  });
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|map|glb|gltf)$).*)'],
};
