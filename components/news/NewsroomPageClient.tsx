'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useReducedMotion,
  type Transition,
} from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { RooollBrandMark } from '@/components/RooollBrandMark';
import { NEWS_ARTICLES } from '@/data/news';
import {
  newsCategoryLabel,
  newsImageAlt,
  newsText,
} from '@/lib/news-copy';
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';
import {
  NEWSROOM_HERO_MARK_PX,
  newsroomMarkBoxFromRect,
} from '@/lib/newsroom-intro';

type IntroPhase = 'measure' | 'drop' | 'title' | 'list' | 'done';

type DropMetrics = {
  anchor: { left: number; top: number };
  y: number[];
  scale: number[];
};

const DROP_TIMES = [0, 0.26, 0.36, 0.45, 0.54, 0.63, 0.74, 1] as const;
const DROP_DURATION = 1.85;

function buildDropMetrics(heroRect: DOMRect, markPx: number): DropMetrics {
  const anchor = newsroomMarkBoxFromRect(heroRect, markPx);
  const markH = markPx * (745 / 1024);

  const startY = -Math.min(96, Math.max(56, anchor.top * 0.18));
  const floorTop = window.innerHeight * 0.5 - markH / 2;
  const floorY = Math.max(56, floorTop - anchor.top);

  const travel = floorY - startY;
  const bounce1 = travel * 0.36;
  const bounce2 = bounce1 * 0.44;
  const bounce3 = bounce2 * 0.4;

  const peak1 = floorY - bounce1;
  const valley1 = peak1 + bounce1 * 0.54;
  const peak2 = valley1 - bounce2;
  const valley2 = peak2 + bounce2 * 0.5;
  const peak3 = valley2 - bounce3;

  return {
    anchor,
    y: [startY, floorY, peak1, valley1, peak2, valley2, peak3, 0],
    scale: [0.94, 0.9, 0.96, 0.93, 0.97, 0.95, 0.99, 1],
  };
}

function buildDropTransition(): Transition {
  return {
    y: {
      duration: DROP_DURATION,
      times: [...DROP_TIMES],
      ease: [
        [0.55, 0.06, 0.95, 0.82],
        [0.2, 0.85, 0.32, 1],
        [0.62, 0.02, 0.92, 0.74],
        [0.22, 0.88, 0.34, 1],
        [0.64, 0.02, 0.9, 0.72],
        [0.24, 0.9, 0.36, 1],
        [0.28, 0.08, 0.22, 1],
      ],
    },
    scale: {
      duration: DROP_DURATION,
      times: [...DROP_TIMES],
      ease: [
        'linear',
        'linear',
        'linear',
        'linear',
        'linear',
        'linear',
        [0.22, 1, 0.36, 1],
      ],
    },
  };
}

function formatNewsDate(iso: string, lang: AppLocale): string {
  const date = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

const TITLE_TRANSITION: Transition = {
  duration: 0.52,
  ease: [0.22, 1, 0.36, 1],
};

const LIST_ITEM_TRANSITION: Transition = {
  duration: 0.58,
  ease: [0.22, 1, 0.36, 1],
};

const LIST_STAGGER_S = 0.11;

const newsListVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: LIST_STAGGER_S,
      delayChildren: 0.08,
    },
  },
};

const newsListItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: LIST_ITEM_TRANSITION,
  },
};

const newsListItemVariantsReduced = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

function NewsroomMarkDrop({
  metrics,
  markAria,
  onComplete,
}: {
  metrics: DropMetrics;
  markAria: string;
  onComplete: () => void;
}) {
  const completedRef = useRef(false);

  const dropNode = (
    <motion.div
      className="newsroom-mark-flight"
      aria-hidden
      style={{
        position: 'fixed',
        left: metrics.anchor.left,
        top: metrics.anchor.top,
        width: NEWSROOM_HERO_MARK_PX,
        zIndex: 2,
        pointerEvents: 'none',
        transformOrigin: 'center center',
      }}
      initial={{ y: metrics.y[0], scale: metrics.scale[0], opacity: 1 }}
      animate={{
        y: metrics.y,
        scale: metrics.scale,
        opacity: 1,
      }}
      transition={buildDropTransition()}
      onAnimationComplete={() => {
        if (completedRef.current) return;
        completedRef.current = true;
        onComplete();
      }}
    >
      <RooollBrandMark
        width={NEWSROOM_HERO_MARK_PX}
        decorative
        color="#1d1d1f"
        title={markAria}
      />
    </motion.div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(dropNode, document.body);
}

function NewsroomHero({
  lang,
  phase,
  skipIntro,
  dropMetrics,
  heroSlotRef,
  onDropComplete,
  onTitleComplete,
}: {
  lang: AppLocale;
  phase: IntroPhase;
  skipIntro: boolean;
  dropMetrics: DropMetrics | null;
  heroSlotRef: React.RefObject<HTMLDivElement>;
  onDropComplete: () => void;
  onTitleComplete: () => void;
}) {
  const copy = getMessages(lang).pages.newsroom;
  const showHeroMark = skipIntro || phase === 'title' || phase === 'list' || phase === 'done';
  const titleVisible = skipIntro || (phase !== 'measure' && phase !== 'drop');
  const titleCompleteRef = useRef(false);

  useEffect(() => {
    titleCompleteRef.current = false;
  }, [phase]);

  return (
    <header className="newsroom-hero">
      {dropMetrics && phase === 'drop' ? (
        <NewsroomMarkDrop
          metrics={dropMetrics}
          markAria={copy.markAria}
          onComplete={onDropComplete}
        />
      ) : null}

      <div
        ref={heroSlotRef}
        data-newsroom-hero-mark-slot
        className={`newsroom-hero__mark${showHeroMark ? ' is-visible' : ' is-pending'}`}
      >
        <RooollBrandMark width={NEWSROOM_HERO_MARK_PX} title={copy.markAria} color="#1d1d1f" />
      </div>

      <motion.div
        className="newsroom-hero__copy"
        initial={false}
        animate={
          titleVisible
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 14 }
        }
        transition={TITLE_TRANSITION}
        onAnimationComplete={() => {
          if (titleCompleteRef.current) return;
          if (!skipIntro && phase === 'title' && titleVisible) {
            titleCompleteRef.current = true;
            onTitleComplete();
          }
        }}
      >
        <h1 className="newsroom-hero__title">{copy.heroTitle}</h1>
      </motion.div>
    </header>
  );
}

function NewsroomCard({
  lang,
  slug,
}: {
  lang: AppLocale;
  slug: (typeof NEWS_ARTICLES)[number]['slug'];
}) {
  const article = NEWS_ARTICLES.find((a) => a.slug === slug)!;
  const copy = getMessages(lang).pages.newsroom;
  const href = `/${lang}/news/${article.slug}`;
  const alt = newsImageAlt(article, lang);

  return (
    <article className="newsroom-card roooll-liquid-glass roooll-liquid-glass--light">
      <Link href={href} className="newsroom-card__link">
        <div className="newsroom-card__media">
          <Image
            src={article.imagePath}
            alt={alt}
            fill
            unoptimized
            sizes="(min-width: 735px) 280px, 38vw"
            className="newsroom-card__img"
          />
        </div>
        <div className="newsroom-card__body">
          <p className="newsroom-card__meta">
            <span>{newsCategoryLabel(article.category, lang)}</span>
            <span aria-hidden> · </span>
            <time dateTime={article.publishedAt}>{formatNewsDate(article.publishedAt, lang)}</time>
          </p>
          <h2 className="newsroom-card__title">{newsText(article.title, lang)}</h2>
          <p className="newsroom-card__excerpt">{newsText(article.excerpt, lang)}</p>
          <span className="newsroom-card__cta">
            {copy.readArticle}
            <span aria-hidden> ›</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

export type NewsroomPageClientProps = {
  initialLang: AppLocale;
};

export function NewsroomPageClient({ initialLang }: NewsroomPageClientProps) {
  const lang: AppLocale = initialLang === 'en' ? 'en' : 'zh';
  const reduceMotion = useReducedMotion();
  const skipIntro = Boolean(reduceMotion);
  const [phase, setPhase] = useState<IntroPhase>(skipIntro ? 'done' : 'measure');
  const [dropMetrics, setDropMetrics] = useState<DropMetrics | null>(null);
  const heroSlotRef = useRef<HTMLDivElement>(null);

  const beginDrop = useCallback(() => {
    const heroEl = heroSlotRef.current;
    if (!heroEl) return false;

    const heroRect = heroEl.getBoundingClientRect();
    if (heroRect.height <= 0) return false;

    setDropMetrics(buildDropMetrics(heroRect, NEWSROOM_HERO_MARK_PX));
    setPhase('drop');
    return true;
  }, []);

  const tryBeginDrop = useCallback(() => {
    let attempts = 0;
    const run = () => {
      attempts += 1;
      if (beginDrop()) return;
      if (attempts < 12) {
        window.requestAnimationFrame(run);
        return;
      }
      setPhase('title');
    };
    window.requestAnimationFrame(run);
  }, [beginDrop]);

  useLayoutEffect(() => {
    if (skipIntro) {
      setPhase('done');
      return undefined;
    }
    tryBeginDrop();
    return undefined;
  }, [skipIntro, tryBeginDrop]);

  const handleDropComplete = useCallback(() => {
    setPhase('title');
  }, []);

  const handleTitleComplete = useCallback(() => {
    setPhase('list');
  }, []);

  const handleListComplete = useCallback(() => {
    setPhase('done');
  }, []);

  const showList = skipIntro || phase === 'list' || phase === 'done';

  return (
    <div className="newsroom-page-root">
      <div className="newsroom-page-inner">
        <NewsroomHero
          lang={lang}
          phase={phase}
          skipIntro={skipIntro}
          dropMetrics={dropMetrics}
          heroSlotRef={heroSlotRef}
          onDropComplete={handleDropComplete}
          onTitleComplete={handleTitleComplete}
        />
        <section
          className={`newsroom-list${showList ? '' : ' is-pending'}`}
          aria-labelledby="newsroom-list-title"
        >
          <h2 id="newsroom-list-title" className="newsroom-list__sr-title">
            {getMessages(lang).pages.newsroom.latestTitle}
          </h2>
          <motion.ul
            className="newsroom-list__items"
            initial={false}
            animate={showList ? 'visible' : 'hidden'}
            variants={newsListVariants}
            onAnimationComplete={() => {
              if (showList && phase === 'list') {
                handleListComplete();
              }
            }}
          >
            {NEWS_ARTICLES.map((article) => (
              <motion.li
                key={article.slug}
                variants={skipIntro ? newsListItemVariantsReduced : newsListItemVariants}
              >
                <NewsroomCard lang={lang} slug={article.slug} />
              </motion.li>
            ))}
          </motion.ul>
        </section>
      </div>
    </div>
  );
}
