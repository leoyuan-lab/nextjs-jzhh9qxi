/** Keep html/body overflow in sync with route — sticky scroll pages need overflow-x: visible. */

export type RouteDocumentChromeOptions = {
  isArm: boolean;
  isHome: boolean;
  /** Our Story curtain-pull: sticky pin requires visible overflow on html/body. */
  isStickyScroll?: boolean;
};

export function syncRouteDocumentChrome({
  isArm,
  isHome,
  isStickyScroll = false,
}: RouteDocumentChromeOptions): void {
  if (typeof document === 'undefined') return;

  const overflowX = isStickyScroll ? 'visible' : isArm ? 'clip' : 'hidden';
  document.documentElement.style.overflowX = overflowX;
  document.body.style.overflowX = overflowX;
  document.documentElement.classList.toggle('is-arm-immersive-route', isArm);
  document.body.classList.toggle('is-arm-immersive-route', isArm);
  document.documentElement.classList.toggle('is-sticky-scroll-route', isStickyScroll);
  document.body.classList.toggle('is-sticky-scroll-route', isStickyScroll);
  document.body.style.backgroundColor =
    isHome || isStickyScroll ? 'transparent' : isArm ? '#000' : '#fff';
}

/**
 * Arm immersive inquiry drawer: lock scroll without `position: fixed` so `window.scrollY`
 * (and main-nav hide progress) stay stable — avoids the primary nav sliding back down.
 */
export function applyArmInquiryScrollLock(
  isArm: boolean,
  isHome: boolean,
): {
  restore: () => void;
} {
  const body = document.body;
  const html = document.documentElement;
  const prev = {
    bodyOverflow: body.style.overflow,
    bodyOverflowY: body.style.overflowY,
    htmlOverflow: html.style.overflow,
    htmlOverflowY: html.style.overflowY,
    overscrollBody: body.style.overscrollBehavior,
    overscrollHtml: html.style.overscrollBehavior,
  };

  html.style.overflow = 'hidden';
  html.style.overflowY = 'hidden';
  body.style.overflow = 'hidden';
  body.style.overflowY = 'hidden';
  body.style.overscrollBehavior = 'none';
  html.style.overscrollBehavior = 'none';

  if (isArm) {
    syncRouteDocumentChrome({ isArm: true, isHome });
  }

  return {
    restore: () => {
      body.style.overflow = prev.bodyOverflow;
      body.style.overflowY = prev.bodyOverflowY;
      html.style.overflow = prev.htmlOverflow;
      html.style.overflowY = prev.htmlOverflowY;
      body.style.overscrollBehavior = prev.overscrollBody;
      html.style.overscrollBehavior = prev.overscrollHtml;
      if (isArm) {
        syncRouteDocumentChrome({ isArm: true, isHome });
      }
    },
  };
}

/**
 * Lock background scroll when mobile menu / drawer open.
 * Do **not** use `body { position: fixed }` — on iOS Safari it shrinks the layout viewport and
 * leaves visible gaps above/below `position: fixed` overlays (r-lite vs r-ultra at scrollY=0).
 */
export function applyMobileMenuScrollLock(
  isArm: boolean,
  isHome: boolean,
): {
  restore: () => void;
} {
  return applyArmInquiryScrollLock(isArm, isHome);
}
