const LOCALE_PREFIX_RE = /^\/(zh|en)(\/|$)/;

const ARM_NAV_PATHS = new Set(['/cobots/r-lite', '/cobots/r-ultra']);

export function stripLocalePrefix(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  if (!LOCALE_PREFIX_RE.test(pathname)) return pathname;
  const next = pathname.replace(LOCALE_PREFIX_RE, '/');
  return next || '/';
}

/** Cookie + chrome: arm immersive pages use dark liquid glass. */
export function liquidGlassToneForPath(pathname: string): 'light' | 'dark' {
  return ARM_NAV_PATHS.has(stripLocalePrefix(pathname)) ? 'dark' : 'light';
}
