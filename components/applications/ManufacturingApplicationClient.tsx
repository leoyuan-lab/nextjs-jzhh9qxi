'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  HorizontalScrollDots,
  scrollHorizontalSnapItem,
  useHorizontalScrollIndex,
} from '@/components/HorizontalScrollDots';
import { ApplicationCurtainProof } from '@/components/applications/ApplicationCurtainProof';
import { APPLICATION_MANUFACTURING_MEDIA } from '@/data/application-media';
import {
  clearManufacturingNavTone,
  dispatchManufacturingNavTone,
} from '@/lib/application-nav-tone';
import { getMessages } from '@/lib/messages';
import { openInquiry } from '@/lib/open-inquiry';
import { useSiteLang } from '@/lib/site-lang-context';
const STORY_TRACK_VH = 2;

function clampStoryProgress(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Video parallax completes after 100vh scroll; act 2 fades in during the second half. */
function useManufacturingStoryScroll(trackRef: RefObject<HTMLElement | null>): {
  videoProgress: MotionValue<number>;
  act2Opacity: MotionValue<number>;
} {
  const videoProgress = useMotionValue(0);
  const act2Opacity = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const el = trackRef.current;
      if (!el) return;
      const viewport = window.visualViewport?.height ?? window.innerHeight;
      const scrolled = Math.max(0, -el.getBoundingClientRect().top);
      const parallaxEnd = viewport;
      videoProgress.set(clampStoryProgress(scrolled / parallaxEnd));
      act2Opacity.set(clampStoryProgress((scrolled - parallaxEnd * 0.5) / (parallaxEnd * 0.5)));
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
  }, [act2Opacity, trackRef, videoProgress]);

  return { videoProgress, act2Opacity };
}
const fadeUp = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

function resolveAlt(
  lang: 'zh' | 'en',
  key: string,
  namespace: 'root' | 'variant_images' = 'root',
): string {
  const alt = getMessages(lang).alt;
  if (namespace === 'variant_images') {
    const variants = alt.variant_images as Record<string, string>;
    return variants[key] ?? key;
  }
  const root = alt as Record<string, unknown>;
  const value = root[key];
  return typeof value === 'string' ? value : key;
}

function PillarIcon({ name }: { name: string }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: '0 0 28 28',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  } as const;

  if (name === 'repeat') {
    return (
      <svg {...common}>
        <path
          d="M8 9H18a4 4 0 0 1 0 8H15"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M11 6 8 9 11 12M20 19H10a4 4 0 0 1 0-8H13"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M17 16l3 3-3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'compact') {
    return (
      <svg {...common}>
        <rect x="5" y="8" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M10 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M9 14h10M9 17h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="M14 5v4M14 19v4M5 14h4M19 14h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="5.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M14 11v3l2 1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

type MfgCopy = ReturnType<typeof getMessages>['pages']['applications_manufacturing'];

function StoryActTwo({ copy }: { copy: MfgCopy }) {
  return (
    <div className="app-mfg-story-act-inner app-mfg-story-act-inner--pillars">
      <div className="app-mfg-story-act-head">
        <h2 className="app-mfg-story-pillar-title">{copy.story.step2.title}</h2>
        <p className="app-mfg-story-pillar-intro">{copy.story.step2.intro}</p>
      </div>
      <ul className="app-mfg-story-pillar-grid">
        {copy.story.step2.items.map((item) => (
          <li key={item.title} className="app-mfg-story-pillar">
            <span className="app-mfg-story-pillar-icon">
              <PillarIcon name={item.icon} />
            </span>
            <h3 className="app-mfg-story-pillar-name">{item.title}</h3>
            <p className="app-mfg-story-pillar-body">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

type CellItem = {
  media: (typeof APPLICATION_MANUFACTURING_MEDIA.scenarios)[number];
  copy: MfgCopy['story']['step3']['items'][number] | undefined;
};

function StoryActThree({
  cellItems,
  safeLang,
  title,
  cellScrollerRef,
  cellIndex,
  assignCellRef,
  onSelectCell,
}: {
  cellItems: CellItem[];
  safeLang: 'zh' | 'en';
  title: string;
  cellScrollerRef: RefObject<HTMLDivElement>;
  cellIndex: number;
  assignCellRef: (index: number) => (node: HTMLElement | null) => void;
  onSelectCell: (index: number) => void;
}) {
  return (
    <div className="app-mfg-story-act-inner app-mfg-story-act-inner--cells">
      <h2 className="app-mfg-story-cells-title">{title}</h2>
      <div className="app-mfg-story-cells-bleed">
        <div ref={cellScrollerRef} className="app-mfg-story-cells-scroll">
          {cellItems.map(({ media, copy: itemCopy }, index) => (
            <div key={media.id} ref={assignCellRef(index)} className="app-mfg-story-cell-unit">
              <article className="app-mfg-story-cell">
                <div className="app-mfg-story-cell-media">
                  {media.kind === 'video' ? (
                    <video
                      src={media.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label={resolveAlt(safeLang, media.altKey)}
                    />
                  ) : (
                    <Image
                      src={media.src}
                      alt={resolveAlt(safeLang, media.altKey, media.altNamespace)}
                      fill
                      sizes="(max-width: 734px) 80vw, 26vw"
                      className="object-cover"
                    />
                  )}
                </div>
              </article>
              <div className="app-mfg-story-cell-copy">
                <p className="app-mfg-story-cell-eyebrow">{itemCopy?.eyebrow}</p>
                <h3 className="app-mfg-story-cell-title">{itemCopy?.title}</h3>
                <p className="app-mfg-story-cell-text">{itemCopy?.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <HorizontalScrollDots
        count={cellItems.length}
        activeIndex={cellIndex}
        label={title}
        variant="dark"
        onSelect={onSelectCell}
      />
    </div>
  );
}

export function ManufacturingApplicationClient() {
  const lang = useSiteLang();
  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const copy = getMessages(safeLang).pages.applications_manufacturing;
  const reduceMotion = useReducedMotion() === true;

  const [openerVisible, setOpenerVisible] = useState(reduceMotion);
  const [cinemaActive, setCinemaActive] = useState(false);

  const storyTrackRef = useRef<HTMLElement>(null);
  const { videoProgress, act2Opacity } = useManufacturingStoryScroll(storyTrackRef);

  const cellScrollerRef = useRef<HTMLDivElement>(null);
  const cellItemRefs = useRef<(HTMLElement | null)[]>([]);
  const cellIndex = useHorizontalScrollIndex(cellScrollerRef, () => cellItemRefs.current);

  const cellItems = useMemo(
    () =>
      APPLICATION_MANUFACTURING_MEDIA.scenarios.map((media, index) => ({
        media,
        copy: copy.story.step3.items[index],
      })),
    [copy.story.step3.items],
  );

  const videoY = useTransform(videoProgress, [0, 1], ['0%', '-50%']);
  const videoBlur = useTransform(videoProgress, [0, 0.5, 1], [0, 0, 14]);
  const videoOpacity = useTransform(videoProgress, [0, 0.5, 1], [0.44, 0.44, 0.12]);
  const scrimStrength = useTransform(videoProgress, [0, 0.5, 1], [0.52, 0.52, 0.88]);
  const videoFilter = useTransform(videoBlur, (b) => `blur(${b}px) saturate(0.85) contrast(1.05)`);

  useEffect(() => {
    if (reduceMotion) {
      setOpenerVisible(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setOpenerVisible(true));
    return () => window.cancelAnimationFrame(id);
  }, [reduceMotion]);

  useEffect(() => {
    const node = storyTrackRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setCinemaActive(true);
      },
      { rootMargin: '240px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => dispatchManufacturingNavTone();
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    window.visualViewport?.addEventListener('resize', sync);
    window.visualViewport?.addEventListener('scroll', sync);
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('scroll', sync);
      clearManufacturingNavTone();
    };
  }, []);

  const assignCellRef = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      cellItemRefs.current[index] = node;
    },
    [],
  );

  const openManufacturingInquiry = (model?: 'r-Lite' | 'r-Ultra') =>
    openInquiry({
      source: 'application_manufacturing',
      body:
        safeLang === 'zh'
          ? `行业：智能制造${model ? `\n意向机型：${model}` : ''}\n负载：\n臂展：\n节拍/周期：\n`
          : `Industry: Smart Manufacturing${model ? `\nModel interest: ${model}` : ''}\nPayload:\nReach:\nCycle time:\n`,
    });

  return (
    <article className="app-mfg-page" aria-label={copy.pageAria}>
      {/* Act 1 — opener */}
      <section className="app-mfg-act app-mfg-opener" aria-labelledby="app-mfg-opener-title">
        <div className={`app-mfg-opener-inner${openerVisible ? ' is-visible' : ''}`}>
          <p className="app-mfg-kicker">{copy.opener.kicker}</p>
          <h1 id="app-mfg-opener-title" className="app-mfg-opener-title">
            {copy.opener.title}
          </h1>
          <p className="app-mfg-opener-sub">{copy.opener.subtitle}</p>
        </div>
      </section>

      {/* Act 2 — scroll storytelling (200vh bg parallax + flowing copy) */}
      <section
        ref={storyTrackRef}
        className="app-mfg-act app-mfg-story-track"
        aria-label={copy.story.ariaLabel}
        style={{ ['--app-mfg-story-vh' as string]: STORY_TRACK_VH }}
      >
        <div className="app-mfg-story-sticky" aria-hidden={reduceMotion ? undefined : true}>
          {cinemaActive ? (
            reduceMotion ? (
              <div className="app-mfg-story-video-stage app-mfg-story-video-stage--static">
                <video
                  className="app-mfg-story-video"
                  src={APPLICATION_MANUFACTURING_MEDIA.heroVideo}
                  poster={APPLICATION_MANUFACTURING_MEDIA.heroPoster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden
                />
              </div>
            ) : (
              <motion.div className="app-mfg-story-video-stage" style={{ y: videoY }}>
                <motion.video
                  className="app-mfg-story-video"
                  src={APPLICATION_MANUFACTURING_MEDIA.heroVideo}
                  poster={APPLICATION_MANUFACTURING_MEDIA.heroPoster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden
                  style={{ filter: videoFilter }}
                />
              </motion.div>
            )
          ) : (
            <div className="app-mfg-story-video-stage app-mfg-story-video-stage--static">
              <div
                className="app-mfg-story-video app-mfg-story-video--poster"
                style={{ backgroundImage: `url(${APPLICATION_MANUFACTURING_MEDIA.heroPoster})` }}
                aria-hidden
              />
            </div>
          )}

          {!reduceMotion ? (
            <motion.div className="app-mfg-story-scrim" aria-hidden style={{ opacity: scrimStrength }} />
          ) : (
            <div className="app-mfg-story-scrim" aria-hidden />
          )}

          {!reduceMotion ? (
            <motion.div className="app-mfg-story-video-dim" aria-hidden style={{ opacity: videoOpacity }} />
          ) : null}
        </div>

        <div className="app-mfg-story-flow">
          <div className="app-mfg-story-flow-chapter app-mfg-story-flow-chapter--one">
            <div className="app-mfg-story-step app-mfg-story-step--hero">
              <p className="app-mfg-kicker app-mfg-kicker--accent">{copy.story.step1.kicker}</p>
              <h2 className="app-mfg-story-hero-title">{copy.story.step1.title}</h2>
              <p className="app-mfg-story-hero-body">{copy.story.step1.body}</p>
            </div>
          </div>

          <div className="app-mfg-story-flow-chapter app-mfg-story-flow-chapter--two">
            {reduceMotion ? (
              <StoryActTwo copy={copy} />
            ) : (
              <motion.div className="app-mfg-story-act-two-wrap" style={{ opacity: act2Opacity }}>
                <StoryActTwo copy={copy} />
              </motion.div>
            )}
          </div>

          <div className="app-mfg-story-flow-chapter app-mfg-story-flow-chapter--three">
            <StoryActThree
              cellItems={cellItems}
              safeLang={safeLang}
              title={copy.story.step3.title}
              cellScrollerRef={cellScrollerRef}
              cellIndex={cellIndex}
              assignCellRef={assignCellRef}
              onSelectCell={(index) =>
                scrollHorizontalSnapItem(
                  cellScrollerRef.current,
                  cellItemRefs.current[index] ?? null,
                )
              }
            />
          </div>
        </div>
      </section>

      {/* Act 3 — before / after */}
      <section className="app-mfg-act app-mfg-compare" aria-labelledby="app-mfg-compare-title">
        <motion.div className="app-mfg-compare-inner" {...(reduceMotion ? {} : fadeUp)}>
          <h2 id="app-mfg-compare-title" className="app-mfg-section-title app-mfg-section-title--center">
            {copy.compare.title}
          </h2>
          <div className="app-mfg-compare-grid">
            <div className="app-mfg-compare-card app-mfg-compare-card--before">
              <p className="app-mfg-compare-label">{copy.compare.beforeLabel}</p>
              <p className="app-mfg-compare-body">{copy.compare.before}</p>
            </div>
            <div className="app-mfg-compare-card app-mfg-compare-card--after">
              <p className="app-mfg-compare-label">{copy.compare.afterLabel}</p>
              <p className="app-mfg-compare-body">{copy.compare.after}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Act 4 — curtain: stats → advantages */}
      <ApplicationCurtainProof
        statsTitle={copy.stats.title}
        stats={copy.stats.items}
        advantagesTitle={copy.advantages.title}
        advantages={copy.advantages.items}
      />

      {/* Act 5–6 — light tail: spec + closing */}
      <div className="app-mfg-light-tail">
        <section className="app-mfg-act app-mfg-spec" aria-labelledby="app-mfg-spec-title">
          <motion.div className="app-mfg-spec-wrap" {...(reduceMotion ? {} : fadeUp)}>
            <div className="app-mfg-spec-head">
              <h2 id="app-mfg-spec-title" className="app-mfg-spec-title">
                {copy.specSheet.title}
              </h2>
            </div>
            <article className="app-mfg-spec-sheet">
              <div className="app-mfg-spec-compare">
                {APPLICATION_MANUFACTURING_MEDIA.products.map((product) => {
                  const isLite = product.id === 'r-lite';
                  return (
                    <div key={product.id} className="app-mfg-spec-compare-model">
                      <div className="app-mfg-spec-compare-media">
                        <Image
                          src={product.image}
                          alt={resolveAlt(safeLang, product.altKey, 'variant_images')}
                          fill
                          sizes="(max-width: 734px) 42vw, 320px"
                          className="object-contain"
                        />
                      </div>
                      <h3 className="app-mfg-spec-compare-name">
                        {isLite ? copy.specSheet.columns.rLite : copy.specSheet.columns.rUltra}
                      </h3>
                    </div>
                  );
                })}
                {copy.specSheet.rows.map((row) => (
                  <div key={row.label} className="app-mfg-spec-compare-row">
                    <div className="app-mfg-spec-compare-value">
                      <span className="sr-only">{row.label}</span>
                      {row.rLite}
                    </div>
                    <div className="app-mfg-spec-compare-value">
                      <span className="sr-only">{row.label}</span>
                      {row.rUltra}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="app-mfg-spec-col-link"
                  onClick={() => openManufacturingInquiry('r-Lite')}
                >
                  {copy.specSheet.ctaLite}
                </button>
                <button
                  type="button"
                  className="app-mfg-spec-col-link"
                  onClick={() => openManufacturingInquiry('r-Ultra')}
                >
                  {copy.specSheet.ctaUltra}
                </button>
              </div>
            </article>
          </motion.div>
        </section>

        <section className="app-mfg-act app-mfg-closing app-mfg-closing--light" aria-labelledby="app-mfg-closing-title">
          <motion.div className="app-mfg-closing-inner" {...(reduceMotion ? {} : fadeUp)}>
            <h2 id="app-mfg-closing-title" className="app-mfg-closing-title app-mfg-closing-title--on-light">
              {copy.closing.title}
            </h2>
            <p className="app-mfg-closing-body app-mfg-closing-body--on-light">{copy.closing.body}</p>
            <div className="app-mfg-closing-actions">
              <button
                type="button"
                className="app-mfg-inquiry-btn app-mfg-inquiry-btn--on-light"
                onClick={() => openManufacturingInquiry()}
              >
                {copy.closing.ctaInquiry}
              </button>
              <Link href={`/${safeLang}/`} className="app-mfg-home-link app-mfg-home-link--on-light">
                {copy.closing.ctaHome}
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </article>
  );
}
