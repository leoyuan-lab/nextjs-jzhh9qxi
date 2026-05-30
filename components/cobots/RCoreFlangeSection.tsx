'use client';

import { motion, useReducedMotion, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
} from 'react';
import { RCoreFlangeHeroStill } from '@/components/cobots/RCoreFlangeHeroStill';
import { HeroArSpaceIcon } from '@/components/cobots/HeroArSpaceIcon';
import { cobotGlbModels } from '@/data/products';
import { trackCtaClick } from '@/lib/analytics';
import {
  detectInAppBrowser,
  resolveFlangeLayoutMode,
  type FlangeLayoutMode,
} from '@/lib/ar-device';
import { launchArPreview } from '@/lib/ar-preview-launch';
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';
import { useStoryTrackScrollProgress } from '@/lib/story-scroll-progress';
import type { ImmersiveMessagesPageKey } from '@/lib/immersive-series-messages';

const ModelViewerScript = dynamic(
  () => import('@/components/ModelViewerScript').then((m) => m.ModelViewerScript),
  { ssr: false },
);

const CURTAIN_TOP_HOLD = 0.36;
const CURTAIN_TOP_LIFT_END = 0.9;

function curtainTopY(progress: number, reduceMotion: boolean): string {
  if (reduceMotion) return '0%';
  if (progress <= CURTAIN_TOP_HOLD) return '0%';
  if (progress >= CURTAIN_TOP_LIFT_END) return '-100%';
  const t = (progress - CURTAIN_TOP_HOLD) / (CURTAIN_TOP_LIFT_END - CURTAIN_TOP_HOLD);
  return `${-(t * 100)}%`;
}

function assignSectionRef(
  ref: RefObject<HTMLElement | null> | ((node: HTMLElement | null) => void) | undefined,
  node: HTMLElement | null,
) {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(node);
    return;
  }
  (ref as MutableRefObject<HTMLElement | null>).current = node;
}

export type FlangeStripItem = {
  title: string;
  body: string;
  highlight: string;
};

export type FlangeArCopy = {
  desktop_title: string;
  desktop_subtitle: string;
  curtain_title: string;
  curtain_subtitle: string;
};

type Props = {
  lang: AppLocale;
  messagesPageKey: ImmersiveMessagesPageKey;
  sectionRef?: RefObject<HTMLElement | null> | ((node: HTMLElement | null) => void);
  kicker: string;
  title: string;
  strip: FlangeStripItem[];
  heroVars: Record<string, string>;
  flangeHeroAlt: string;
  arCopy: FlangeArCopy;
  sectionAria: string;
};

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? '');
}

function FlangeStripGrid({
  strip,
  heroVars,
  animateEntries,
  reduceMotion,
}: {
  strip: FlangeStripItem[];
  heroVars: Record<string, string>;
  animateEntries: boolean;
  reduceMotion: boolean;
}) {
  return (
    <div className="rcore-ln-flange-strip rcore-ln-copy-front">
      {strip.map((col, i) => {
        const inner = (
          <>
            <div className="rcore-ln-flange-col__head">
              <h3 className="rcore-ln-flange-col__title">{col.title}</h3>
              <hr className="rcore-ln-flange-col__rule" />
            </div>
            <p className="rcore-ln-flange-col__body">{fillTemplate(col.body, heroVars)}</p>
          </>
        );

        if (!animateEntries || reduceMotion) {
          return (
            <div key={col.title} className="rcore-ln-flange-col">
              {inner}
            </div>
          );
        }

        return (
          <motion.div
            key={col.title}
            className="rcore-ln-flange-col"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.32 }}
            transition={{
              duration: 0.52,
              delay: i * 0.14,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {inner}
          </motion.div>
        );
      })}
    </div>
  );
}

function FlangePullHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="rcore-ln-flange-intro-head rcore-ln-flange-intro-head--pull">
      <span className="rcore-ln-eyebrow rcore-ln-eyebrow--blue">{kicker}</span>
      <h2 className="rcore-ln-flange-heading">{title}</h2>
    </div>
  );
}

function DesktopArHeroOverlay({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rcore-ln-flange-desktop-ar-copy">
      <h2 className="rcore-ln-flange-heading rcore-ln-flange-desktop-ar-title">{title}</h2>
      <p className="rcore-ln-flange-desktop-ar-sub">{subtitle}</p>
    </div>
  );
}

const AR_VIEWER_HOST_STYLE = {
  ['--progress-bar-height' as string]: '0px',
  ['--progress-bar-color' as string]: 'transparent',
  ['--ar-button-display' as string]: 'none',
} as CSSProperties;

function FlangeArCurtainTop({
  lang,
  title,
  subtitle,
  showPill,
  arLoading,
  onStartAr,
  viewerRef,
}: {
  lang: AppLocale;
  title: string;
  subtitle: string;
  showPill: boolean;
  arLoading: boolean;
  onStartAr: () => void;
  viewerRef: RefObject<HTMLElement | null>;
}) {
  const home = getMessages(lang).homepage;

  return (
    <div className="rcore-ln-flange-curtain-top">
      <div className="rcore-ln-flange-ar-curtain-copy">
        {showPill ? (
          <div className="rcore-ln-flange-ar-preview" aria-hidden>
            <model-viewer
              ref={viewerRef as MutableRefObject<HTMLElement | null>}
              className="rcore-ln-flange-ar-preview__viewer"
              src={cobotGlbModels.rLiteFr3CArGlb}
              ios-src={cobotGlbModels.rLiteFr3CArUsdz}
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="fixed"
              camera-controls={false}
              auto-rotate
              interaction-prompt="none"
              shadow-intensity="0.85"
              exposure="1"
              environment-image="neutral"
              camera-orbit="45deg 78deg 1.15m"
              field-of-view="32deg"
              style={AR_VIEWER_HOST_STYLE}
            />
          </div>
        ) : null}
        <h2 className="rcore-ln-flange-heading rcore-ln-flange-ar-curtain-title">{title}</h2>
        <p className="rcore-ln-flange-ar-curtain-sub">{subtitle}</p>
        {showPill ? (
          <button
            type="button"
            className="rcore-ln-flange-ar-pill"
            aria-label={home.heroArAria}
            disabled={arLoading}
            onClick={onStartAr}
          >
            <span className="rcore-ln-flange-ar-pill__label">
              {arLoading ? home.heroArLoading : home.heroArView}
            </span>
            <HeroArSpaceIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FlangeCurtainPull({
  ariaLabel,
  sectionRef,
  topLayer,
  bottomLayer,
  scrollVh = 132,
}: {
  ariaLabel: string;
  sectionRef?: RefObject<HTMLElement | null> | ((node: HTMLElement | null) => void);
  topLayer: ReactNode;
  bottomLayer: ReactNode;
  scrollVh?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() === true;
  const scrollYProgress = useStoryTrackScrollProgress(trackRef, 'pin');
  const topY = useTransform(scrollYProgress, (p) => curtainTopY(p, reduceMotion));

  const setNode = useCallback(
    (node: HTMLElement | null) => {
      assignSectionRef(sectionRef, node);
    },
    [sectionRef],
  );

  if (reduceMotion) {
    return (
      <section ref={setNode} className="rcore-ln-section rcore-ln-section--flange" data-rcore-ln-flange>
        <div className="rcore-ln-flange-curtain-static">
          <div className="rcore-ln-flange-curtain-layer rcore-ln-flange-curtain-layer--top">{topLayer}</div>
          <div className="rcore-ln-flange-curtain-layer rcore-ln-flange-curtain-layer--bottom">{bottomLayer}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={setNode}
      className="rcore-ln-section rcore-ln-section--flange rcore-ln-section--flange-curtain"
      data-rcore-ln-flange
      aria-label={ariaLabel}
    >
      <div ref={trackRef} className="rcore-ln-flange-curtain-scroll" style={{ height: `${scrollVh}dvh` }}>
        <div className="rcore-ln-flange-curtain-sticky">
          <div className="rcore-ln-flange-curtain-slot rcore-ln-flange-curtain-slot--bottom">{bottomLayer}</div>
          <motion.div className="rcore-ln-flange-curtain-slot rcore-ln-flange-curtain-slot--top" style={{ y: topY }}>
            {topLayer}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function RCoreFlangeSection({
  lang,
  messagesPageKey,
  sectionRef,
  kicker,
  title,
  strip,
  heroVars,
  flangeHeroAlt,
  arCopy,
  sectionAria,
}: Props) {
  const [layoutMode, setLayoutMode] = useState<FlangeLayoutMode>('no-ar');
  const [arLoading, setArLoading] = useState(false);
  const arViewerRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion() === true;

  const showArPill =
    messagesPageKey === 'r_lite' && layoutMode !== 'no-ar' && !detectInAppBrowser();

  useEffect(() => {
    const sync = () => setLayoutMode(resolveFlangeLayoutMode());
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  const onStartAr = () => {
    trackCtaClick(messagesPageKey === 'r_ultra' ? 'r_ultra_flange_ar' : 'r_lite_flange_ar');
    setArLoading(true);
    launchArPreview(arViewerRef.current, {
      glb: cobotGlbModels.rLiteFr3CArGlb,
      usdz: cobotGlbModels.rLiteFr3CArUsdz,
    }, setArLoading);
  };

  const pullBottomFull = (
    <div className="rcore-ln-flange-curtain-layer rcore-ln-flange-curtain-layer--bottom">
      <div className="rcore-ln-flange-curtain-inner rcore-ln-flange-curtain-inner--pull-full rcore-ln-copy-front">
        <FlangePullHead kicker={kicker} title={title} />
        <FlangeStripGrid strip={strip} heroVars={heroVars} animateEntries={false} reduceMotion={reduceMotion} />
      </div>
    </div>
  );

  const desktopTop = (
    <div className="rcore-ln-flange-curtain-layer rcore-ln-flange-curtain-layer--top rcore-ln-flange-curtain-layer--desktop-hero">
      <div className="rcore-ln-flange-hero-visual rcore-ln-flange-hero-visual--desktop-ar">
        <RCoreFlangeHeroStill alt={flangeHeroAlt} />
        <DesktopArHeroOverlay title={arCopy.desktop_title} subtitle={arCopy.desktop_subtitle} />
      </div>
    </div>
  );

  const arScript = showArPill ? <ModelViewerScript /> : null;

  const arTop = (
    <div className="rcore-ln-flange-curtain-layer rcore-ln-flange-curtain-layer--top">
      <FlangeArCurtainTop
        lang={lang}
        title={arCopy.curtain_title}
        subtitle={arCopy.curtain_subtitle}
        showPill={showArPill}
        arLoading={arLoading}
        onStartAr={onStartAr}
        viewerRef={arViewerRef}
      />
    </div>
  );

  if (layoutMode === 'ar-small') {
    return (
      <>
        {arScript}
        <section
          ref={(node) => assignSectionRef(sectionRef, node)}
          className="rcore-ln-section rcore-ln-section--flange rcore-ln-section--flange-ar-stack"
          data-rcore-ln-flange
          aria-label={sectionAria}
        >
          <div className="rcore-ln-flange-ar-stack-top">
            <FlangeArCurtainTop
              lang={lang}
              title={arCopy.curtain_title}
              subtitle={arCopy.curtain_subtitle}
              showPill={showArPill}
              arLoading={arLoading}
              onStartAr={onStartAr}
              viewerRef={arViewerRef}
            />
          </div>
          <div className="rcore-ln-flange-curtain-inner rcore-ln-flange-curtain-inner--pull-full rcore-ln-copy-front">
            <FlangePullHead kicker={kicker} title={title} />
            <FlangeStripGrid
              strip={strip}
              heroVars={heroVars}
              animateEntries={!reduceMotion}
              reduceMotion={reduceMotion}
            />
          </div>
        </section>
      </>
    );
  }

  if (layoutMode === 'ar-large') {
    return (
      <>
        {arScript}
        <FlangeCurtainPull
          ariaLabel={sectionAria}
          sectionRef={sectionRef}
          topLayer={arTop}
          bottomLayer={pullBottomFull}
        />
      </>
    );
  }

  return (
    <FlangeCurtainPull
      ariaLabel={sectionAria}
      sectionRef={sectionRef}
      topLayer={desktopTop}
      bottomLayer={pullBottomFull}
    />
  );
}
