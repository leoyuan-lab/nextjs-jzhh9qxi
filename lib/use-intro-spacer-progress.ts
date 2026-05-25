'use client';

import { motionValue, type MotionValue } from 'framer-motion';
import { useEffect, useState, type RefObject } from 'react';

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/**
 * Mirrors `useScroll({ target, offset: ['start start', 'end start'] })` without
 * Framer's ref-hydration guard (fixes Next.js client mount timing).
 */
export function useIntroSpacerProgress(
  spacerRef: RefObject<HTMLElement | null>,
): MotionValue<number> {
  const [progress] = useState(() => motionValue(0));

  useEffect(() => {
    const el = spacerRef.current;
    if (!el) return undefined;

    const update = () => {
      const node = spacerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const height = Math.max(rect.height, 1);
      progress.set(clamp01(-rect.top / height));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [progress, spacerRef]);

  return progress;
}
