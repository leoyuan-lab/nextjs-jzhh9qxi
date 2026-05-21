/** Mobile menu full-screen overlay sizing (iOS Safari / safe area). */

function readSafeAreaInsetBottom(): number {
  if (typeof document === 'undefined') return 0;
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;visibility:hidden;padding-bottom:env(safe-area-inset-bottom,0px)';
  document.body.appendChild(probe);
  const px = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
  probe.remove();
  return px;
}

/** Paint height: layout viewport + home-indicator + Safari bottom chrome slack. */
export function measureMobileMenuOverlayHeightPx(): number {
  if (typeof window === 'undefined') return 900;

  const inner = window.innerHeight;
  const client = document.documentElement.clientHeight;
  const vv = window.visualViewport;
  const fromVv = vv ? vv.offsetTop + vv.height : 0;
  const chrome = vv ? Math.max(0, inner - vv.height - vv.offsetTop) : 0;
  const safe = readSafeAreaInsetBottom();

  return Math.ceil(Math.max(inner, client, fromVv) + Math.max(safe, chrome, 0));
}

export function applyMobileMenuOverlayToElement(el: HTMLElement): number {
  const h = measureMobileMenuOverlayHeightPx();
  el.style.position = 'fixed';
  el.style.top = '0';
  el.style.left = '0';
  el.style.right = '0';
  el.style.width = '100%';
  el.style.height = `${h}px`;
  el.style.minHeight = `${h}px`;
  el.style.maxHeight = 'none';
  el.style.boxSizing = 'border-box';
  return h;
}

export function setMobileMenuDocumentOpen(open: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('mobile-menu-open', open);
}
