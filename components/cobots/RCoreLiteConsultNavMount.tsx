'use client';

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useState } from 'react';

import { RCoreAppStickySubnav } from '@/components/cobots/RCoreAppStickySubnav';
import { rSeriesData } from '@/data/products';
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** r-Core lite: inquiry pill drops from top once the fixed stage begins exit scroll. */
export function RCoreLiteConsultNavMount({
  lang,
  exitProgress,
}: {
  lang: AppLocale;
  exitProgress: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  const [interactive, setInteractive] = useState(Boolean(reduceMotion));
  const nav = getMessages(lang).nav;
  const productLineLabel = `${rSeriesData.find((f) => f.id === 'r-core')!.displayName}${nav.cobots.r_core_suffix}`;

  const opacity = useTransform(exitProgress, (p) => {
    if (reduceMotion) return p > 0.05 ? 1 : 0;
    return easeOutCubic(clamp01((p - 0.05) / 0.22));
  });
  const y = useTransform(opacity, (o) => `${(1 - Number(o)) * -56}px`);

  useMotionValueEvent(opacity, 'change', (o) => {
    setInteractive(Number(o) > 0.02);
  });

  return (
    <motion.div
      className="rcore-consult-nav-mount"
      style={{
        opacity,
        y,
        pointerEvents: interactive ? 'auto' : 'none',
      }}
      aria-hidden={!interactive}
    >
      <RCoreAppStickySubnav
        lang={lang}
        productLineLabel={productLineLabel}
        messagesPageKey="r_core"
        inquirySource="r_core_lite_subnav"
      />
    </motion.div>
  );
}
