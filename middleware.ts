import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

type SiteLang = 'zh' | 'en';

const COOKIE_NAME = 'user-lang';
const LANGUAGE_PREFIX_RE = /^\/(zh|en)(\/|$)/;

function detectLangFromHeader(acceptLanguage: string | null): SiteLang {
  if (!acceptLanguage) return 'en';
  const normalized = acceptLanguage.toLowerCase();
  return normalized.startsWith('zh') || normalized.includes(',zh') ? 'zh' : 'en';
}

function withLangCookie(response: NextResponse, lang: SiteLang) {
  response.cookies.set(COOKIE_NAME, lang, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  });
  return response;
}

/** Logical path without locale; collapses trailing slash (except root). */
function stripTrailingSlash(path: string): string {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

const LEGACY_ACCESSORIES_PATH = '/cobots/accessories';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const matchedPrefix = pathname.match(LANGUAGE_PREFIX_RE);

  const preferred: SiteLang =
    request.cookies.get(COOKIE_NAME)?.value === 'zh' ||
    request.cookies.get(COOKIE_NAME)?.value === 'en'
      ? (request.cookies.get(COOKIE_NAME)?.value as SiteLang)
      : detectLangFromHeader(request.headers.get('accept-language'));

  if (matchedPrefix) {
    const lang = matchedPrefix[1] === 'zh' ? 'zh' : 'en';
    const strippedPath = pathname.replace(LANGUAGE_PREFIX_RE, '/') || '/';

    if (stripTrailingSlash(strippedPath) === LEGACY_ACCESSORIES_PATH) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${lang}/accessories`;
      return NextResponse.redirect(redirectUrl, 301);
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = strippedPath;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-site-lang', lang);
    return withLangCookie(
      NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } }),
      lang,
    );
  }

  if (stripTrailingSlash(pathname) === LEGACY_ACCESSORIES_PATH) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${preferred}/accessories`;
    return withLangCookie(NextResponse.redirect(redirectUrl, 301), preferred);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${preferred}${pathname === '/' ? '/' : pathname}`;
  return withLangCookie(NextResponse.redirect(redirectUrl), preferred);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|map|glb|gltf)$).*)',
  ],
};
