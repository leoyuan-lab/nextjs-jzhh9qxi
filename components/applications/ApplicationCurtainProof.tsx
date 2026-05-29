'use client';

import { motion, useReducedMotion, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useStoryTrackScrollProgress } from '@/lib/story-scroll-progress';

const CURTAIN_TOP_HOLD = 0.38;
const CURTAIN_TOP_LIFT_END = 0.9;

function curtainTopY(progress: number, reduceMotion: boolean): string {
  if (reduceMotion) return '0%';
  if (progress <= CURTAIN_TOP_HOLD) return '0%';
  if (progress >= CURTAIN_TOP_LIFT_END) return '-100%';
  const t = (progress - CURTAIN_TOP_HOLD) / (CURTAIN_TOP_LIFT_END - CURTAIN_TOP_HOLD);
  return `${-(t * 100)}%`;
}

export type ApplicationProofStat = {
  value: string;
  label: string;
};

const statFadeEase = [0.22, 1, 0.36, 1] as const;

function StatListItem({
  item,
  index,
  reduceMotion,
}: {
  item: ApplicationProofStat;
  index: number;
  reduceMotion: boolean;
}) {
  const content = (
    <>
      <p className="app-mfg-stat-value">{item.value}</p>
      <p className="app-mfg-stat-label">{item.label}</p>
    </>
  );

  if (reduceMotion) {
    return <li className="app-mfg-stat">{content}</li>;
  }

  return (
    <motion.li
      className="app-mfg-stat"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.55 }}
      transition={{ duration: 0.55, delay: index * 0.14, ease: statFadeEase }}
    >
      {content}
    </motion.li>
  );
}

export type ApplicationProofAdvantage = {
  title: string;
  body: string;
};

type ApplicationCurtainProofProps = {
  statsTitle: string;
  stats: ApplicationProofStat[];
  advantagesTitle: string;
  advantages: ApplicationProofAdvantage[];
};

export function ApplicationCurtainProof({
  statsTitle,
  stats,
  advantagesTitle,
  advantages,
}: ApplicationCurtainProofProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() === true;
  const scrollYProgress = useStoryTrackScrollProgress(trackRef, 'pin');
  const topY = useTransform(scrollYProgress, (p) => curtainTopY(p, reduceMotion));

  const statsLayer = (
    <div className="app-mfg-curtain-layer app-mfg-curtain-layer--stats">
      <div className="app-mfg-curtain-inner">
        <h2 className="app-mfg-section-title app-mfg-section-title--center">{statsTitle}</h2>
        <ul className="app-mfg-stats-grid">
          {stats.map((item, index) => (
            <StatListItem key={item.value} item={item} index={index} reduceMotion={reduceMotion} />
          ))}
        </ul>
      </div>
    </div>
  );

  const advantagesLayer = (
    <div className="app-mfg-curtain-layer app-mfg-curtain-layer--advantages">
      <div className="app-mfg-curtain-inner">
        <h2 className="app-mfg-section-title app-mfg-adv-title--accent">{advantagesTitle}</h2>
        <ul className="app-mfg-adv-list app-mfg-adv-list--curtain">
          {advantages.map((item) => (
            <li key={item.title} className="app-mfg-adv-item">
              <h3 className="app-mfg-adv-item-title app-mfg-adv-item-title--on-light">{item.title}</h3>
              <p className="app-mfg-adv-item-body app-mfg-adv-item-body--on-light">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  if (reduceMotion) {
    return (
      <section className="app-mfg-act app-mfg-curtain-static" aria-label={statsTitle}>
        {statsLayer}
        <div className="app-mfg-light-tail app-mfg-light-tail--advantages-only">{advantagesLayer}</div>
      </section>
    );
  }

  return (
    <section className="app-mfg-act app-mfg-curtain-track" aria-label={statsTitle}>
      <div ref={trackRef} className="app-mfg-curtain-scroll">
        <div className="app-mfg-curtain-sticky">
          <div className="app-mfg-curtain-layer-slot app-mfg-curtain-layer-slot--bottom">{advantagesLayer}</div>
          <motion.div className="app-mfg-curtain-layer-slot app-mfg-curtain-layer-slot--top" style={{ y: topY }}>
            {statsLayer}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
