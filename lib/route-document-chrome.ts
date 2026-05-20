/** Keep html/body overflow in sync with route — `overflow-x: clip` on arm pages preserves sticky film scroll. */

export type RouteDocumentChromeOptions = {
  isArm: boolean;
  isHome: boolean;
};

export function syncRouteDocumentChrome({ isArm, isHome }: RouteDocumentChromeOptions): void {
  if (typeof document === 'undefined') return;

  const overflowX = isArm ? 'clip' : 'hidden';
  document.documentElement.style.overflowX = overflowX;
  document.body.style.overflowX = overflowX;
  document.documentElement.classList.toggle('is-arm-immersive-route', isArm);
  document.body.classList.toggle('is-arm-immersive-route', isArm);
  document.body.style.backgroundColor = isHome ? 'transparent' : isArm ? '#000' : '#fff';
}

/** Lock background scroll on mobile without clobbering arm `overflow-x: clip` (sticky film). */
export function applyMobileMenuScrollLock(
  isArm: boolean,
  isHome: boolean,
): {
  restore: () => void;
} {
  const body = document.body;
  const html = document.documentElement;
  const prevBodyOverflow = body.style.overflow;
  const prevBodyOverflowY = body.style.overflowY;
  const prevBodyOverscroll = body.style.overscrollBehavior;
  const prevHtmlOverscroll = html.style.overscrollBehavior;

  if (isArm) {
    syncRouteDocumentChrome({ isArm: true, isHome });
    body.style.overflowY = 'hidden';
    body.style.overflow = '';
  } else {
    body.style.overflow = 'hidden';
  }
  body.style.overscrollBehavior = 'none';
  html.style.overscrollBehavior = 'none';

  return {
    restore: () => {
      body.style.overflow = prevBodyOverflow;
      body.style.overflowY = prevBodyOverflowY;
      body.style.overscrollBehavior = prevBodyOverscroll;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      if (isArm) {
        syncRouteDocumentChrome({ isArm: true, isHome });
      }
    },
  };
}
