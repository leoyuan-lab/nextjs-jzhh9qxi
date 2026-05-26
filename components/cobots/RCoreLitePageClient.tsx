'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { RCoreLiteConsultNavMount } from '@/components/cobots/RCoreLiteConsultNavMount';
import { RCoreSpecSection } from '@/components/cobots/RCoreLiteSections';
import {
  ROBOT_VECTOR_BASE,
  robotVariantBlueprintAlt,
  robotVariantBlueprintDescription,
  robotVariantBlueprintSvgFilename,
} from '@/data/products';
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';
import {
  R_CORE_LITE_HERO_HD_PATH,
  R_CORE_LITE_PRIMARY_VARIANT_ID,
  type RCoreLiteVariantId,
} from '@/lib/rcore-lite-page-config';
import { useRCoreLiteNavHide } from '@/lib/use-rcore-lite-nav-hide';
import { useIntroSpacerProgress } from '@/lib/use-intro-spacer-progress';
import { trackCtaClick } from '@/lib/analytics';

type RCorePageCopy = ReturnType<typeof getMessages>['pages']['r_core'];
type AltCopy = ReturnType<typeof getMessages>['alt'];

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Stagger fade: all items fully visible by ~90% of features scroll. */
function staggerFade(progress: number, index: number, total: number, lead = 0.18): number {
  if (progress <= lead) return 0;
  const p = clamp01((progress - lead) / 0.72);
  const slot = 1 / (total + 0.35);
  const start = index * slot;
  return easeOutCubic(clamp01((p - start) / (slot * 1.2)));
}

export type RCoreLitePageClientProps = {
  initialLang: AppLocale;
};

export function RCoreLitePageClient({ initialLang }: RCoreLitePageClientProps) {
  const lang: 'zh' | 'en' = initialLang === 'en' ? 'en' : 'zh';
  const page = getMessages(lang).pages.r_core;
  const alt = getMessages(lang).alt;
  const [layoutMode, setLayoutMode] = useState<'mobile' | 'desktop' | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 734px)');
    const apply = () => setLayoutMode(mq.matches ? 'mobile' : 'desktop');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  if (layoutMode === null) {
    return <main className="rcore-lite-page" style={{ minHeight: '100dvh' }} aria-busy="true" />;
  }

  if (layoutMode === 'mobile') {
    return <RCoreLiteMobileLayout lang={lang} page={page} alt={alt} />;
  }

  return <RCoreLiteDesktopLayout lang={lang} page={page} alt={alt} />;
}

function RCoreLiteSharedTail({
  lang,
  page,
  blueprintSrc,
  blueprintAlt,
  blueprintDesc,
  specVariantId,
  onSpecVariantChange,
  specLayout = 'wide',
}: {
  lang: 'zh' | 'en';
  page: RCorePageCopy;
  blueprintSrc: string;
  blueprintAlt: string;
  blueprintDesc: string;
  specVariantId: RCoreLiteVariantId;
  onSpecVariantChange: (id: RCoreLiteVariantId) => void;
  specLayout?: 'default' | 'wide';
}) {
  return (
    <>
      <div className="rcore-lite-blueprint-band">
        <div className="rcore-lite-tail-container">
          <div className="rcore-lite-blueprint-card">
          <section className="rcore-lite-blueprint" aria-labelledby="rcore-lite-blueprint-title">
            <div className="rcore-lite-blueprint__copy">
              <h2 id="rcore-lite-blueprint-title" className="rcore-lite-section-title">
                {page.blueprint.title}
              </h2>
              <p className="rcore-lite-body">{page.blueprint.body}</p>
            </div>
            <object
              type="image/svg+xml"
              data={blueprintSrc}
              className="rcore-lite-blueprint__svg"
              aria-label={blueprintAlt}
              aria-description={blueprintDesc}
              title={blueprintAlt}
            />
          </section>
          </div>
        </div>
      </div>
      <RCoreSpecSection
        lang={lang}
        copy={page.specs}
        variantId={specVariantId}
        onVariantChange={onSpecVariantChange}
        layout={specLayout}
      />
      <RCoreLiteFooterBand lang={lang} copy={page.footer} />
    </>
  );
}

function RCoreLiteFooterBand({
  lang,
  copy,
}: {
  lang: 'zh' | 'en';
  copy: RCorePageCopy['footer'];
}) {
  return (
    <aside className="rcore-lite-exit-band" aria-labelledby="rcore-lite-exit-title">
      <div className="rcore-lite-exit-band__inner rcore-lite-tail-container">
        <h2 id="rcore-lite-exit-title" className="selector-journey-duo-title">
          {copy.title}
        </h2>
        <p className="selector-journey-duo-summary">{copy.summary}</p>
        <div className="rcore-lite-exit-band__links">
          <Link
            href={`/${lang}/cobots/all-cobots-specs`}
            className="selector-journey-duo-link"
            onClick={() => trackCtaClick('r_core_lite_all_models')}
          >
            {copy.allModels}
            <span aria-hidden> ›</span>
          </Link>
          <Link
            href={`/${lang}/selector/comparison`}
            className="selector-journey-duo-link"
            onClick={() => trackCtaClick('r_core_lite_compare')}
          >
            {copy.compareMatch}
            <span aria-hidden> ›</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

function DesktopStageFeatures({
  items,
  progress,
  reduceMotion,
}: {
  items: { title: string; body: string }[];
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  return (
    <div className="rcore-lite-stage__features-list" aria-hidden={false}>
      {items.map((item, index) => (
        <DesktopStageFeatureItem
          key={item.title}
          item={item}
          index={index}
          total={items.length}
          progress={progress}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}

function DesktopStageFeatureItem({
  item,
  index,
  total,
  progress,
  reduceMotion,
}: {
  item: { title: string; body: string };
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const opacity = useTransform(progress, (p) =>
    reduceMotion ? 1 : staggerFade(p, index, total),
  );
  const y = useTransform(progress, (p) => {
    if (reduceMotion) return 0;
    const o = staggerFade(p, index, total);
    return (1 - o) * 14;
  });

  return (
    <motion.article className="rcore-lite-stage-feature" style={{ opacity, y }}>
      <span className="rcore-lite-stage-feature__index">{String(index + 1).padStart(2, '0')}</span>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </motion.article>
  );
}

function RCoreLiteDesktopLayout({
  lang,
  page,
  alt,
}: {
  lang: 'zh' | 'en';
  page: RCorePageCopy;
  alt: AltCopy;
}) {
  useRCoreLiteNavHide();
  const reduceMotion = useReducedMotion();
  const introRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const [specVariantId, setSpecVariantId] = useState<RCoreLiteVariantId>(R_CORE_LITE_PRIMARY_VARIANT_ID);
  const [stageHidden, setStageHidden] = useState(Boolean(reduceMotion));

  const introProgress = useIntroSpacerProgress(introRef);
  const featuresProgress = useIntroSpacerProgress(featuresRef);
  const exitProgress = useIntroSpacerProgress(exitRef);

  const heroAlt = alt.hero_rcore ?? alt.variant_images.r_core_fr5_std;
  const blueprintSrc = `${ROBOT_VECTOR_BASE}/${robotVariantBlueprintSvgFilename(R_CORE_LITE_PRIMARY_VARIANT_ID)}`;
  const blueprintAlt = robotVariantBlueprintAlt(R_CORE_LITE_PRIMARY_VARIANT_ID, lang);
  const blueprintDesc = robotVariantBlueprintDescription(R_CORE_LITE_PRIMARY_VARIANT_ID, lang);

  /** Intro shrink only; caps at 60vw once complete but reverses when scrolling back up. */
  const heroWidth = useTransform(introProgress, (p) => {
    if (reduceMotion) return '60vw';
    const t = easeOutCubic(clamp01(p));
    return `${100 - t * 40}vw`;
  });
  const advantagesX = useTransform(introProgress, (p) => {
    if (reduceMotion) return '0%';
    const t = easeOutCubic(clamp01((p - 0.12) / 0.88));
    return `${(1 - t) * 100}%`;
  });
  const advantagesOpacity = useTransform(
    [introProgress, featuresProgress],
    ([intro, feat]) => {
      if (reduceMotion) return Number(feat) <= 0.05 ? 1 : 0;
      const pull = easeOutCubic(clamp01((Number(intro) - 0.12) / 0.88));
      if (pull < 0.04) return 0;
      if (Number(feat) > 0.01) return 1 - easeOutCubic(clamp01(Number(feat) / 0.24));
      return 1;
    },
  );
  const featuresPanelOpacity = useTransform(featuresProgress, (p) => {
    if (reduceMotion) return p > 0.05 ? 1 : 0;
    return p > 0.08 ? 1 : 0;
  });
  const titleOpacity = useTransform(introProgress, [0, 0.55, 0.85], [1, 1, 0]);
  const subtitleOpacity = useTransform(introProgress, [0, 0.45, 0.75], [1, 0.75, 0]);
  const stageY = useTransform(exitProgress, (p) => {
    if (reduceMotion) return '0vh';
    return `${-easeOutCubic(clamp01(p)) * 110}vh`;
  });

  useMotionValueEvent(exitProgress, 'change', (p) => {
    if (reduceMotion) return;
    setStageHidden(p >= 0.98);
  });

  return (
    <main className="rcore-lite-page rcore-lite-page--desktop">
      <RCoreLiteConsultNavMount lang={lang} exitProgress={exitProgress} />
      <motion.div
        className={`rcore-lite-stage${stageHidden ? ' is-stage-hidden' : ''}`}
        style={{ y: stageY }}
        aria-hidden={stageHidden}
      >
        <motion.div className="rcore-lite-stage__hero" style={{ width: heroWidth }}>
          <Image
            src={R_CORE_LITE_HERO_HD_PATH}
            alt={heroAlt}
            fill
            priority
            unoptimized
            sizes="(min-width: 735px) 100vw, 100vw"
            className="rcore-lite-pin__img"
          />
          <div className="rcore-lite-pin__scrim" aria-hidden />
          <motion.div className="rcore-lite-pin__copy" style={{ opacity: titleOpacity }}>
            <h1 className="rcore-lite-pin__title">{page.hero.title}</h1>
            <motion.p className="rcore-lite-pin__subtitle" style={{ opacity: subtitleOpacity }}>
              {page.hero.subtitle}
            </motion.p>
          </motion.div>
        </motion.div>

        <div className="rcore-lite-stage__rail">
          <div className="rcore-lite-stage__rail-center">
            <motion.div
              className="rcore-lite-stage__advantages"
              style={{ x: advantagesX, opacity: advantagesOpacity }}
              aria-label={page.advantages.kicker}
            >
              <ul className="rcore-lite-rail-advantages__list">
                {page.advantages.items.map((item) => (
                  <li key={item.title} className="rcore-lite-rail-advantage">
                    <h2 className="rcore-lite-rail-advantage__title">{item.title}</h2>
                    <p className="rcore-lite-rail-advantage__body">{item.body}</p>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div className="rcore-lite-stage__features-panel" style={{ opacity: featuresPanelOpacity }}>
              <DesktopStageFeatures
                items={page.features.items}
                progress={featuresProgress}
                reduceMotion={Boolean(reduceMotion)}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="rcore-lite-scroll-track" aria-hidden>
        <div ref={introRef} className="rcore-lite-spacer rcore-lite-spacer--intro" />
        <div ref={featuresRef} className="rcore-lite-spacer rcore-lite-spacer--features" />
        <div ref={holdRef} className="rcore-lite-spacer rcore-lite-spacer--hold" />
        <div ref={exitRef} className="rcore-lite-spacer rcore-lite-spacer--exit" />
      </div>

      <div className="rcore-lite-tail">
        <RCoreLiteSharedTail
          lang={lang}
          page={page}
          blueprintSrc={blueprintSrc}
          blueprintAlt={blueprintAlt}
          blueprintDesc={blueprintDesc}
          specVariantId={specVariantId}
          onSpecVariantChange={setSpecVariantId}
          specLayout="wide"
        />
      </div>
    </main>
  );
}

function MobileStageFeatureItem({
  item,
  index,
  total,
  progress,
  reduceMotion,
}: {
  item: { title: string; body: string };
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const opacity = useTransform(progress, (p) =>
    reduceMotion ? 1 : staggerFade(p, index, total, 0.28),
  );
  const y = useTransform(progress, (p) => {
    if (reduceMotion) return 0;
    const o = staggerFade(p, index, total, 0.28);
    return (1 - o) * 12;
  });

  return (
    <motion.article className="rcore-lite-mobile-feature" style={{ opacity, y }}>
      <span className="rcore-lite-mobile-feature__index">{String(index + 1).padStart(2, '0')}</span>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </motion.article>
  );
}

function RCoreLiteMobileLayout({
  lang,
  page,
  alt,
}: {
  lang: 'zh' | 'en';
  page: RCorePageCopy;
  alt: AltCopy;
}) {
  useRCoreLiteNavHide();
  const reduceMotion = useReducedMotion();
  const introRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const [specVariantId, setSpecVariantId] = useState<RCoreLiteVariantId>(R_CORE_LITE_PRIMARY_VARIANT_ID);
  const [stageHidden, setStageHidden] = useState(Boolean(reduceMotion));

  const introProgress = useIntroSpacerProgress(introRef);
  const featuresProgress = useIntroSpacerProgress(featuresRef);
  const exitProgress = useIntroSpacerProgress(exitRef);

  const heroAlt = alt.hero_rcore ?? alt.variant_images.r_core_fr5_std;
  const blueprintSrc = `${ROBOT_VECTOR_BASE}/${robotVariantBlueprintSvgFilename(R_CORE_LITE_PRIMARY_VARIANT_ID)}`;
  const blueprintAlt = robotVariantBlueprintAlt(R_CORE_LITE_PRIMARY_VARIANT_ID, lang);
  const blueprintDesc = robotVariantBlueprintDescription(R_CORE_LITE_PRIMARY_VARIANT_ID, lang);

  const heroHeight = useTransform(introProgress, (p) =>
    reduceMotion ? '50%' : `${100 - easeOutCubic(clamp01(p)) * 50}%`,
  );
  const heroScale = useTransform(introProgress, (p) =>
    reduceMotion ? 1 : 1 - easeOutCubic(clamp01(p)) * 0.08,
  );
  const titleOpacity = useTransform(introProgress, [0, 0.55, 0.85], [1, 1, 0]);
  const subtitleOpacity = useTransform(introProgress, [0, 0.45, 0.75], [1, 0.75, 0]);
  const advantagesOpacity = useTransform(introProgress, (intro) => {
    if (reduceMotion) return 1;
    const pull = easeOutCubic(clamp01((Number(intro) - 0.12) / 0.88));
    return pull < 0.04 ? 0 : 1;
  });
  const introBlockY = useTransform(featuresProgress, (p) => {
    if (reduceMotion) return '0vh';
    return `${-easeOutCubic(clamp01(p)) * 105}vh`;
  });
  const introBlockOpacity = useTransform(featuresProgress, (p) => {
    if (reduceMotion) return p > 0.5 ? 0 : 1;
    return 1 - easeOutCubic(clamp01(p / 0.32));
  });
  const featuresPanelOpacity = useTransform(
    [featuresProgress, exitProgress],
    ([feat, exit]) => {
      if (reduceMotion) return Number(feat) > 0.05 ? 1 : 0;
      const enter = easeOutCubic(clamp01((Number(feat) - 0.06) / 0.28));
      const leave = 1 - easeOutCubic(clamp01(Number(exit) / 0.38));
      return enter * leave;
    },
  );
  const tailOpacity = useTransform(exitProgress, (p) => {
    if (reduceMotion) return 1;
    return easeOutCubic(clamp01(Math.max(0, (p - 0.04) / 0.22)));
  });
  const stageY = useTransform(exitProgress, (p) => {
    if (reduceMotion) return '0vh';
    return `${-easeOutCubic(clamp01(p)) * 110}vh`;
  });

  useMotionValueEvent(exitProgress, 'change', (p) => {
    if (reduceMotion) return;
    setStageHidden(p >= 0.98);
  });

  return (
    <main className="rcore-lite-page rcore-lite-page--mobile">
      <RCoreLiteConsultNavMount lang={lang} exitProgress={exitProgress} />
      <motion.div
        className={`rcore-lite-mobile-stage${stageHidden ? ' is-stage-hidden' : ''}`}
        style={{ y: stageY }}
        aria-hidden={stageHidden}
      >
        <motion.div
          className="rcore-lite-mobile-intro-block"
          style={{ y: introBlockY, opacity: introBlockOpacity }}
        >
          <motion.div className="rcore-lite-mobile-hero" style={{ height: heroHeight }}>
            <motion.div className="rcore-lite-mobile-hero__inner" style={{ scale: heroScale }}>
              <Image
                src={R_CORE_LITE_HERO_HD_PATH}
                alt={heroAlt}
                fill
                priority
                unoptimized
                sizes="100vw"
                className="rcore-lite-pin__img"
              />
              <div className="rcore-lite-pin__scrim" aria-hidden />
            </motion.div>
            <motion.div className="rcore-lite-pin__copy rcore-lite-pin__copy--mobile" style={{ opacity: titleOpacity }}>
              <h1 className="rcore-lite-pin__title">{page.hero.title}</h1>
              <motion.p className="rcore-lite-pin__subtitle" style={{ opacity: subtitleOpacity }}>
                {page.hero.subtitle}
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.section
            className="rcore-lite-mobile-advantages"
            style={{ opacity: advantagesOpacity }}
            aria-label={page.advantages.kicker}
          >
            <ul className="rcore-lite-mobile-advantages__list">
              {page.advantages.items.map((item, index) => (
                <li key={item.title} className="rcore-lite-mobile-advantage">
                  <span className="rcore-lite-mobile-advantage__index">{String(index + 1).padStart(2, '0')}</span>
                  <h2 className="rcore-lite-mobile-advantage__title">{item.title}</h2>
                  <p className="rcore-lite-mobile-advantage__body">{item.body}</p>
                </li>
              ))}
            </ul>
          </motion.section>
        </motion.div>

        <motion.section
          className="rcore-lite-mobile-features"
          style={{ opacity: featuresPanelOpacity }}
          aria-label={page.features.title}
        >
          <div className="rcore-lite-mobile-features__list">
            {page.features.items.map((item, index) => (
              <MobileStageFeatureItem
                key={item.title}
                item={item}
                index={index}
                total={page.features.items.length}
                progress={featuresProgress}
                reduceMotion={Boolean(reduceMotion)}
              />
            ))}
          </div>
        </motion.section>
      </motion.div>

      <div className="rcore-lite-scroll-track" aria-hidden>
        <div ref={introRef} className="rcore-lite-spacer rcore-lite-spacer--intro" />
        <div ref={featuresRef} className="rcore-lite-spacer rcore-lite-spacer--features" />
        <div ref={holdRef} className="rcore-lite-spacer rcore-lite-spacer--hold" />
        <div ref={exitRef} className="rcore-lite-spacer rcore-lite-spacer--exit" />
      </div>

      <motion.div className="rcore-lite-tail" style={{ opacity: tailOpacity }}>
        <RCoreLiteSharedTail
          lang={lang}
          page={page}
          blueprintSrc={blueprintSrc}
          blueprintAlt={blueprintAlt}
          blueprintDesc={blueprintDesc}
          specVariantId={specVariantId}
          onSpecVariantChange={setSpecVariantId}
          specLayout="default"
        />
      </motion.div>
    </main>
  );
}
