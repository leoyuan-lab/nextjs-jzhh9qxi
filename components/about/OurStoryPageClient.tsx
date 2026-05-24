'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { createContext, useContext, useEffect, useRef } from 'react';
import {
  STORY_CHAPTER_IMAGES,
  STORY_CURTAIN_OPENING_OVERLAP,
  STORY_CURTAIN_PHASE,
  STORY_OPENING_PHASE,
  STORY_SCROLL_TRACK,
} from '@/lib/story-chapter-images';
import { useStoryTrackScrollProgress } from '@/lib/story-scroll-progress';
import { getMessages } from '@/lib/messages';
import { useSiteLang } from '@/lib/site-lang-context';

const OPENING_END_SCALE = 0.77;

const StoryCurtainProgressContext = createContext<MotionValue<number> | null>(null);

function curtainOpeningOverlapVh(): number {
  if (typeof window === 'undefined') return STORY_CURTAIN_OPENING_OVERLAP.desktop;
  return window.matchMedia('(max-width: 734px)').matches
    ? STORY_CURTAIN_OPENING_OVERLAP.mobile
    : STORY_CURTAIN_OPENING_OVERLAP.desktop;
}

/** Single scrollY timeline for origin lift — avoids opening/curtain track desync plateaus. */
function originTopLiftProgressFromScrollY(scrollY: number): number {
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const { exitEnd } = STORY_OPENING_PHASE;
  const { topLiftEnd } = STORY_CURTAIN_PHASE;
  const opening = STORY_SCROLL_TRACK.opening;
  const overlap = curtainOpeningOverlapVh();

  const liftStart = exitEnd * (opening - 1) * vh;
  const curtainPageTop = opening * vh - overlap * vh;
  const liftEnd = curtainPageTop + topLiftEnd * vh;

  if (scrollY <= liftStart) return 0;
  if (scrollY >= liftEnd) return topLiftEnd;
  return ((scrollY - liftStart) / (liftEnd - liftStart)) * topLiftEnd;
}

function peopleEnterY(progress: number, reduceMotion: boolean): string {
  if (reduceMotion) return '0%';
  const { stageLiftStart } = STORY_CURTAIN_PHASE;
  if (progress <= stageLiftStart) return '100%';
  if (progress >= 1) return '0%';
  const t = (progress - stageLiftStart) / (1 - stageLiftStart);
  return `${(1 - t) * 100}%`;
}

function storyNavToneForScrollY(y: number): 'dark' | 'light' | null {
  if (y <= 0) return null;

  const vh = window.innerHeight || 800;
  const openingEnd = STORY_SCROLL_TRACK.opening * vh;
  const curtainTrack = 2 * vh;
  const curtainEnd = openingEnd + curtainTrack;

  if (y < openingEnd) return 'light';
  if (y >= curtainEnd) return 'dark';
  /* Curtain zone — tone driven by CurtainPullReveal scrollYProgress for pixel-accurate sync. */
  return null;
}

function storyNavToneForCurtainProgress(progress: number): 'dark' | 'light' {
  return progress >= STORY_CURTAIN_PHASE.navDarkAt ? 'dark' : 'light';
}

function syncOurStoryNavChrome(y: number) {
  const progress = y > 0 ? 1 : 0;
  window.dispatchEvent(
    new CustomEvent('roooll-main-nav-progress', { detail: { progress, instant: true } }),
  );
  const tone = storyNavToneForScrollY(y);
  if (tone !== null) {
    window.dispatchEvent(new CustomEvent('roooll-nav-tone', { detail: { tone } }));
  }
}

/** Keep fixed opening/curtain shells aligned with iOS visual viewport (Safari bar resize). */
function useStoryVisualViewport() {
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const vv = window.visualViewport;
      const h = vv?.height ?? window.innerHeight;
      const top = vv?.offsetTop ?? 0;
      root.style.setProperty('--story-vv-h', `${h}px`);
      root.style.setProperty('--story-vv-top', `${top}px`);
    };

    sync();
    window.visualViewport?.addEventListener('resize', sync);
    window.visualViewport?.addEventListener('scroll', sync);
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('scroll', sync, { passive: true });

    return () => {
      window.visualViewport?.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync);
      root.style.removeProperty('--story-vv-h');
      root.style.removeProperty('--story-vv-top');
    };
  }, []);
}

/** Sync main nav: clear at top, ultra-light glass on scroll; dark tone only after origin lifts. */
function useOurStoryNavChrome() {
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    syncOurStoryNavChrome(y);
  });

  useEffect(() => {
    syncOurStoryNavChrome(window.scrollY);

    const onScroll = () => syncOurStoryNavChrome(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.dispatchEvent(new CustomEvent('roooll-main-nav-progress', { detail: { progress: 0 } }));
      window.dispatchEvent(new CustomEvent('roooll-nav-tone', { detail: { tone: null } }));
    };
  }, []);
}

function curtainTopY(progress: number, reduceMotion: boolean): string {
  if (reduceMotion) return '0%';
  const { topHoldEnd, topLiftEnd } = STORY_CURTAIN_PHASE;
  if (progress <= topHoldEnd) return '0%';
  if (progress >= topLiftEnd) return '-100%';
  const t = (progress - topHoldEnd) / (topLiftEnd - topHoldEnd);
  return `${-(t * 100)}%`;
}

function curtainStageY(progress: number, reduceMotion: boolean): string {
  if (reduceMotion) return '0%';
  const { stageLiftStart } = STORY_CURTAIN_PHASE;
  if (progress <= stageLiftStart) return '0%';
  if (progress >= 1) return '-100%';
  const t = (progress - stageLiftStart) / (1 - stageLiftStart);
  return `${-(t * 100)}%`;
}

type StoryCopyTone = 'light' | 'dark';

function StoryCopyBlock({
  kicker,
  title,
  body,
  titleAs = 'h2',
  tone = 'dark',
  align = 'center',
  className = '',
  children,
}: {
  kicker?: string;
  title: string;
  body?: string;
  titleAs?: 'h1' | 'h2';
  tone?: StoryCopyTone;
  align?: 'center' | 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
}) {
  const TitleTag = titleAs;
  const kickerClass = tone === 'light' ? 'our-story-kicker our-story-kicker--dark' : 'our-story-kicker';
  const titleClass =
    tone === 'light' ? 'our-story-chapter__title our-story-chapter__title--dark' : 'our-story-chapter__title';
  const bodyClass = tone === 'light' ? 'our-story-body our-story-body--dark' : 'our-story-body';
  const innerClass = [
    'our-story-chapter__inner',
    `our-story-chapter__inner--${align}`,
    tone === 'light' ? 'our-story-chapter__inner--on-light' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={innerClass}>
      {kicker ? <p className={kickerClass}>{kicker}</p> : null}
      <TitleTag className={titleClass}>{title}</TitleTag>
      {body ? <p className={bodyClass}>{body}</p> : null}
      {children}
    </div>
  );
}

type PhilosophyPillar = { title: string; body: string };

type PhilosophyContent = {
  kicker: string;
  title: string;
  pillars: PhilosophyPillar[];
};

type StoryImageChapterProps = {
  image: string;
  alt: string;
  kicker: string;
  title: string;
  body: string;
  align?: 'center' | 'left' | 'right';
  scrim?: 'default' | 'deep' | 'product';
  priority?: boolean;
  scrollYProgress: MotionValue<number>;
  parallax?: boolean;
  reduceMotion: boolean;
};

function StoryImageChapter({
  image,
  alt,
  kicker,
  title,
  body,
  align = 'center',
  scrim = 'default',
  priority = false,
  scrollYProgress,
  parallax = false,
  reduceMotion,
}: StoryImageChapterProps) {
  const mediaScale = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    reduceMotion || !parallax ? [1, 1, 1] : [1.08, 1.02, 1],
  );

  return (
    <>
      <motion.div
        className="our-story-chapter__media our-story-chapter__media--cover"
        style={{ scale: parallax ? mediaScale : 1 }}
      >
        <Image src={image} alt={alt} fill priority={priority} sizes="100vw" className="object-cover" />
      </motion.div>
      <div className={`our-story-chapter__scrim our-story-chapter__scrim--${scrim}`} aria-hidden />
      <StoryCopyBlock kicker={kicker} title={title} body={body} align={align} />
    </>
  );
}

/** Screens 1+2 — scale on white; origin enters from below when opening exits upward. */
function StoryOpeningWithOrigin({
  logoSrc,
  logoAlt,
  kicker,
  title,
  body,
  origin,
  reduceMotion,
}: {
  logoSrc: string;
  logoAlt: string;
  kicker: string;
  title: string;
  body: string;
  origin: Omit<StoryImageChapterProps, 'scrollYProgress' | 'parallax' | 'reduceMotion'>;
  reduceMotion: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useStoryTrackScrollProgress(trackRef);

  const { scaleEnd, exitStart, exitEnd, handoffEnd } = STORY_OPENING_PHASE;

  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, handoffEnd, handoffEnd + 0.001, 1],
    [1, 1, 0, 0],
  );
  const stackHidden = useTransform(scrollYProgress, (p) => (p >= handoffEnd ? 'hidden' : 'visible'));

  const windowScale = useTransform(
    scrollYProgress,
    [0, scaleEnd, exitStart, 1],
    reduceMotion ? [1, 1, 1, 1] : [1, OPENING_END_SCALE, OPENING_END_SCALE, OPENING_END_SCALE],
  );
  const windowRadius = useTransform(
    scrollYProgress,
    [0, scaleEnd, 1],
    reduceMotion ? [0, 0, 0] : [0, 18, 18],
  );
  const windowY = useTransform(
    scrollYProgress,
    [exitStart, exitEnd, 1],
    reduceMotion ? ['0%', '0%', '0%'] : ['0%', '-102%', '-102%'],
  );
  /** Hidden below viewport during scale; slides up with opening exit. */
  const originY = useTransform(
    scrollYProgress,
    [0, exitStart, exitEnd, 1],
    reduceMotion ? ['0%', '0%', '0%', '0%'] : ['100%', '100%', '0%', '0%'],
  );

  return (
    <div
      ref={trackRef}
      className="our-story-scroll-track our-story-scroll-track--opening"
      style={{ ['--story-track' as string]: STORY_SCROLL_TRACK.opening }}
    >
      <motion.div
        className="our-story-opening-stack"
        style={{ opacity: overlayOpacity, visibility: stackHidden }}
      >
        <div className="our-story-opening-stack__backdrop" aria-hidden />
        <motion.div className="our-story-opening-stack__origin-enter" style={{ y: originY }}>
          <StoryOriginCard {...origin} />
        </motion.div>
        <motion.div className="our-story-opening-stack__exit" style={{ y: windowY }}>
          <div className="our-story-opening-window">
            <motion.div
              className="our-story-opening-window__scale"
              style={{ scale: windowScale, borderRadius: windowRadius }}
            >
              <div className="our-story-opening-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt={logoAlt} width={1024} height={745} decoding="async" fetchPriority="high" />
              </div>
              <StoryCopyBlock
                kicker={kicker}
                title={title}
                body={body}
                titleAs="h1"
                tone="light"
                align="center"
                className="our-story-opening-copy"
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StoryPhilosophySection({
  kicker,
  title,
  pillars,
  embedded = false,
}: {
  kicker: string;
  title: string;
  pillars: PhilosophyPillar[];
  embedded?: boolean;
}) {
  return (
    <section
      className={`our-story-philosophy${embedded ? ' our-story-philosophy--embedded' : ''}`}
      aria-labelledby="our-story-philosophy-title"
    >
      <div className="our-story-philosophy__head">
        <p className="our-story-kicker">{kicker}</p>
        <h2 id="our-story-philosophy-title" className="our-story-philosophy__title">
          {title}
        </h2>
      </div>
      <ul className="our-story-philosophy__grid">
        {pillars.map((pillar) => (
          <li key={pillar.title} className="our-story-philosophy__card">
            <h3>{pillar.title}</h3>
            <p>{pillar.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Curtain pull — fixed viewport overlay driven by scroll progress.
 * Phase A (0→0.5): top layer lifts, bottom stays put.
 * Phase B (0.5→1): whole stage lifts, bottom scrolls away.
 */
function CurtainPullReveal({
  topLayer,
  bottomLayer,
  reduceMotion,
  children,
}: {
  topLayer: React.ReactNode;
  bottomLayer: React.ReactNode;
  reduceMotion: boolean;
  children?: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useStoryTrackScrollProgress(trackRef);
  const { scrollY } = useScroll();

  const overlayOpacity = useTransform(scrollYProgress, [0, 0.999, 1], [1, 1, 0]);

  const topY = useTransform(scrollY, (y) =>
    curtainTopY(originTopLiftProgressFromScrollY(y), reduceMotion),
  );
  const stageY = useTransform(scrollYProgress, (p) => curtainStageY(p, reduceMotion));
  const stackHidden = useTransform(scrollYProgress, (p) => (p >= 0.999 ? 'hidden' : 'visible'));

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    window.dispatchEvent(
      new CustomEvent('roooll-nav-tone', { detail: { tone: storyNavToneForCurtainProgress(p) } }),
    );
  });

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('roooll-nav-tone', {
        detail: { tone: storyNavToneForCurtainProgress(scrollYProgress.get()) },
      }),
    );
  }, [scrollYProgress]);

  return (
    <StoryCurtainProgressContext.Provider value={scrollYProgress}>
      <div ref={trackRef} className="curtain-pull">
        <motion.div className="curtain-pull__fixed" style={{ opacity: overlayOpacity, visibility: stackHidden }}>
          <motion.div className="curtain-pull__stage" style={{ y: stageY }}>
            <div className="curtain-pull__layer curtain-pull__layer--bottom">{bottomLayer}</div>
            <motion.div className="curtain-pull__layer curtain-pull__layer--top" style={{ y: topY }}>
              {topLayer}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      {children}
    </StoryCurtainProgressContext.Provider>
  );
}

function StoryOriginCard({
  image,
  alt,
  kicker,
  title,
  body,
  align = 'left',
  scrim = 'product',
  priority = false,
}: Omit<StoryImageChapterProps, 'scrollYProgress' | 'parallax' | 'reduceMotion'>) {
  return (
    <div className="our-story-origin-card our-story-chapter our-story-chapter--product">
      <div className="our-story-chapter__media our-story-chapter__media--contain our-story-chapter__media--product-bg">
        <Image src={image} alt={alt} fill priority={priority} sizes="100vw" className="object-contain" />
      </div>
      <div className={`our-story-chapter__scrim our-story-chapter__scrim--${scrim}`} aria-hidden />
      <div
        className={`our-story-chapter__inner our-story-chapter__inner--${align} our-story-chapter__inner--on-light`}
      >
        <p className="our-story-kicker">{kicker}</p>
        <h2 className="our-story-chapter__title">{title}</h2>
        <p className="our-story-body">{body}</p>
      </div>
    </div>
  );
}

function StoryScrollImageChapter(
  props: Omit<StoryImageChapterProps, 'scrollYProgress' | 'reduceMotion'> & {
    reduceMotion: boolean;
    pinOnEnter?: boolean;
    seamlessNext?: boolean;
    afterCurtain?: boolean;
  },
) {
  const { pinOnEnter, seamlessNext, afterCurtain, reduceMotion, ...chapterProps } = props;
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useStoryTrackScrollProgress(trackRef, pinOnEnter ? 'pin' : 'enter');
  const curtainProgress = useContext(StoryCurtainProgressContext);

  const peopleY = useTransform(curtainProgress ?? scrollYProgress, (p) =>
    afterCurtain ? peopleEnterY(p, reduceMotion) : '0%',
  );

  const trackClass = [
    'our-story-scroll-track',
    'our-story-scroll-track--image',
    pinOnEnter ? 'our-story-scroll-track--pin-enter' : '',
    afterCurtain ? 'our-story-scroll-track--after-curtain' : '',
    seamlessNext ? 'our-story-scroll-track--seamless-next' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={trackRef}
      className={trackClass}
      style={{ ['--story-track' as string]: STORY_SCROLL_TRACK.imageChapter }}
    >
      <motion.div
        className="our-story-sticky-panel our-story-sticky-panel--cover our-story-chapter"
        style={afterCurtain ? { y: peopleY } : undefined}
      >
        <StoryImageChapter {...chapterProps} scrollYProgress={scrollYProgress} parallax reduceMotion={reduceMotion} />
      </motion.div>
    </div>
  );
}

function StoryClosingSection({
  image,
  alt,
  title,
  body,
  exploreLabel,
  contactLabel,
  exploreHref,
  contactHref,
  reduceMotion,
}: {
  image: string;
  alt: string;
  title: string;
  body: string;
  exploreLabel: string;
  contactLabel: string;
  exploreHref: string;
  contactHref: string;
  reduceMotion: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useStoryTrackScrollProgress(trackRef, 'enter');
  const mediaScale = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? [1, 1, 1] : [1.08, 1.02, 1]);

  return (
    <div
      ref={trackRef}
      className="our-story-scroll-track our-story-scroll-track--image our-story-scroll-track--closing our-story-scroll-track--after-planet"
      style={{ ['--story-track' as string]: STORY_SCROLL_TRACK.imageChapter }}
    >
      <div className="our-story-sticky-panel our-story-sticky-panel--cover our-story-chapter our-story-chapter--closing">
        <motion.div className="our-story-chapter__media our-story-chapter__media--cover" style={{ scale: mediaScale }}>
          <Image src={image} alt={alt} fill sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="our-story-chapter__scrim our-story-chapter__scrim--closing" aria-hidden />
        <StoryCopyBlock title={title} body={body} align="center">
          <div className="our-story-closing__actions">
            <Link href={exploreHref} className="our-story-cta our-story-cta--primary">
              {exploreLabel}
            </Link>
            <Link href={contactHref} className="our-story-cta our-story-cta--ghost">
              {contactLabel}
            </Link>
          </div>
        </StoryCopyBlock>
      </div>
    </div>
  );
}

export function OurStoryPageClient() {
  useOurStoryNavChrome();
  useStoryVisualViewport();
  const lang = useSiteLang();
  const messages = getMessages(lang);
  const copy = messages.pages.story;
  const alt = messages.alt;
  const reduceMotion = useReducedMotion() ?? false;

  const exploreHref = `/${lang}/cobots/all-cobots-specs`;
  const contactHref = `/${lang}/contact`;

  const pillars: PhilosophyPillar[] = [
    copy.philosophyPillars.modular,
    copy.philosophyPillars.deploy,
    copy.philosophyPillars.operate,
  ];

  const philosophy: PhilosophyContent = {
    kicker: copy.philosophyKicker,
    title: copy.philosophyTitle,
    pillars,
  };

  return (
    <article className="our-story">
      <StoryOpeningWithOrigin
        logoSrc={STORY_CHAPTER_IMAGES.logo}
        logoAlt={alt.story_chapter_opening}
        kicker={copy.openingKicker}
        title={copy.openingTitle}
        body={copy.openingBody}
        reduceMotion={reduceMotion}
        origin={{
          image: STORY_CHAPTER_IMAGES.originProduct,
          alt: alt.story_chapter_origin,
          kicker: copy.originKicker,
          title: copy.originTitle,
          body: copy.originBody,
          align: 'left',
          scrim: 'product',
          priority: true,
        }}
      />
      <CurtainPullReveal
        reduceMotion={reduceMotion}
        topLayer={
            <StoryOriginCard
              image={STORY_CHAPTER_IMAGES.originProduct}
              alt={alt.story_chapter_origin}
              kicker={copy.originKicker}
              title={copy.originTitle}
              body={copy.originBody}
              align="left"
              scrim="product"
              priority
            />
          }
          bottomLayer={<StoryPhilosophySection {...philosophy} embedded />}
        >
          <StoryScrollImageChapter
            image={STORY_CHAPTER_IMAGES.people}
            alt={alt.story_chapter_people}
            kicker={copy.peopleKicker}
            title={copy.peopleTitle}
            body={copy.peopleBody}
            align="right"
            scrim="deep"
            reduceMotion={reduceMotion}
            pinOnEnter
            afterCurtain
          />
        </CurtainPullReveal>
      <StoryScrollImageChapter
        image={STORY_CHAPTER_IMAGES.planet}
        alt={alt.story_chapter_planet}
        kicker={copy.planetKicker}
        title={copy.planetTitle}
        body={copy.planetBody}
        reduceMotion={reduceMotion}
        seamlessNext
      />
      <StoryClosingSection
        image={STORY_CHAPTER_IMAGES.closing}
        alt={alt.story_chapter_closing}
        title={copy.closingTitle}
        body={copy.closingBody}
        exploreLabel={copy.closingExplore}
        contactLabel={copy.closingContact}
        exploreHref={exploreHref}
        contactHref={contactHref}
        reduceMotion={reduceMotion}
      />
    </article>
  );
}
