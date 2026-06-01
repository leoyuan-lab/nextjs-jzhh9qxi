const LOCALE_PREFIX_RE = /^\/(zh|en)(\/|$)/;

/** Immersive dark application pages (Keynote-style, full-bleed media). */
export const APPLICATION_IMMERSIVE_PATHS = new Set([
  '/applications/manufacturing',
  '/applications/medical-lab',
  '/applications/retail-service',
  '/applications/education',
]);

export function stripLocalePrefix(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  if (!LOCALE_PREFIX_RE.test(pathname)) return pathname;
  const next = pathname.replace(LOCALE_PREFIX_RE, '/');
  return next || '/';
}

export function isApplicationImmersivePath(pathname: string): boolean {
  return APPLICATION_IMMERSIVE_PATHS.has(stripLocalePrefix(pathname));
}
