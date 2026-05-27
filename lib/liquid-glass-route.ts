import { isApplicationImmersivePath, stripLocalePrefix } from '@/lib/application-routes';

const ARM_NAV_PATHS = new Set(['/cobots/r-lite', '/cobots/r-ultra']);

/** Cookie + chrome: arm and application immersive pages use dark liquid glass. */
export function liquidGlassToneForPath(pathname: string): 'light' | 'dark' {
  const logical = stripLocalePrefix(pathname);
  return ARM_NAV_PATHS.has(logical) || isApplicationImmersivePath(pathname) ? 'dark' : 'light';
}

export { stripLocalePrefix };
