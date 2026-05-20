/** True while mobile hamburger menu locks document scroll (`ClientLayout`). */
export function isMobileNavScrollLocked(): boolean {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false;
  if (!window.matchMedia('(max-width: 734px)').matches) return false;
  const { overflow, overflowY } = document.body.style;
  return overflow === 'hidden' || overflowY === 'hidden';
}
