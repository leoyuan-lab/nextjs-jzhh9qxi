'use client';

import { useEffect } from 'react';

/** Hide main nav on scroll — same curve as selector comparison page. */
export function useRCoreLiteNavHide(): void {
  useEffect(() => {
    const emit = (progress: number) => {
      window.dispatchEvent(
        new CustomEvent('roooll-main-nav-progress', { detail: { progress } }),
      );
    };
    const onScroll = () => {
      emit(Math.min(1, window.scrollY / 36));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      emit(0);
    };
  }, []);
}
