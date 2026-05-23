/** Pin when sentinel reaches the viewport top (not mid-air). */
export const PIN_SHELL_ON_PX = 0;
export const PIN_SHELL_OFF_PX = 8;

/** Keep viewport anchored when fixed + spacer swaps change document flow. */
export function preserveScrollOnLayoutShift(anchor: HTMLElement | null, mutate: () => void) {
  if (!anchor) {
    mutate();
    return;
  }

  const scrollY = window.scrollY;
  const beforeTop = anchor.getBoundingClientRect().top;
  mutate();
  const afterTop = anchor.getBoundingClientRect().top;
  const delta = afterTop - beforeTop;
  if (Math.abs(delta) > 0.5) {
    window.scrollTo({ top: scrollY + delta, behavior: 'auto' });
  }
}
