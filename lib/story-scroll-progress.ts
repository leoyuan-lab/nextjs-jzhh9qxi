'use client';

import { useMotionValue, type MotionValue } from 'framer-motion';
import { type RefObject, useEffect } from 'react';

export type StoryTrackScrollOffset = 'pin' | 'enter';

function clampProgress(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function measureProgress(el: HTMLElement, mode: StoryTrackScrollOffset): number {
  const viewport = window.visualViewport?.height ?? window.innerHeight;

  if (mode === 'pin') {
    /** Matches framer offset ['start start', 'end start']. */
    const scrollable = el.offsetHeight - viewport;
    if (scrollable <= 1) return 0;
    return clampProgress(-el.getBoundingClientRect().top / scrollable);
  }

  /** Matches framer offset ['start end', 'end start']. */
  const height = el.offsetHeight;
  if (height <= 1) return 0;
  return clampProgress((viewport - el.getBoundingClientRect().top) / height);
}

/**
 * Scroll progress for story tracks — reliable on iOS where target-based useScroll stalls.
 */
export function useStoryTrackScrollProgress(
  trackRef: RefObject<HTMLElement | null>,
  mode: StoryTrackScrollOffset = 'pin',
): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const el = trackRef.current;
      if (!el) return;
      progress.set(measureProgress(el, mode));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    const el = trackRef.current;
    if (el) ro?.observe(el);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [mode, progress, trackRef]);

  return progress;
}
