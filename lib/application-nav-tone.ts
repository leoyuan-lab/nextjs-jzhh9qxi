import { measureStoryTrackProgress } from '@/lib/story-scroll-progress';

/** Curtain lift progress at which the nav switches to light (advantages / #f5f5f7 visible). */
export const MFG_CURTAIN_NAV_LIGHT_AT = 0.5;

export function manufacturingNavTone(): 'dark' | 'light' {
  const viewport = window.visualViewport?.height ?? window.innerHeight;

  const lightTail = document.querySelector('.app-mfg-light-tail');
  if (lightTail) {
    const tailRect = lightTail.getBoundingClientRect();
    if (tailRect.top <= viewport * 0.68) return 'light';
  }

  const curtainScroll = document.querySelector('.app-mfg-curtain-scroll');
  if (curtainScroll instanceof HTMLElement) {
    const curtainRect = curtainScroll.getBoundingClientRect();
    const inCurtain = curtainRect.top < viewport * 0.82 && curtainRect.bottom > viewport * 0.12;
    if (inCurtain) {
      const progress = measureStoryTrackProgress(curtainScroll, 'pin');
      return progress >= MFG_CURTAIN_NAV_LIGHT_AT ? 'light' : 'dark';
    }
  }

  return 'dark';
}

export function dispatchManufacturingNavTone(): void {
  window.dispatchEvent(
    new CustomEvent('roooll-nav-tone', { detail: { tone: manufacturingNavTone() } }),
  );
}

export function clearManufacturingNavTone(): void {
  window.dispatchEvent(new CustomEvent('roooll-nav-tone', { detail: { tone: null } }));
}
