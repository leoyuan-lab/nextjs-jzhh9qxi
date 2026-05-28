'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  APPLICATION_HUB_CARDS,
  type ApplicationHubCard,
} from '@/data/application-hub';
import type { ApplicationsHubCarouselCopy } from '@/lib/applications-hub-carousel-copy';

const AUTO_ADVANCE_MS = 3500;
const CARD_GAP_PX = 18;
const CARD_COUNT = APPLICATION_HUB_CARDS.length;
const CLONE_SETS = 3;
const DOM_COUNT = CARD_COUNT * CLONE_SETS;
const MIDDLE_SET_START = CARD_COUNT;
const MIDDLE_SET_END = CARD_COUNT * 2;
/** Safari often skips `scrollend`; debounce scroll idle instead. */
const SCROLL_IDLE_MS = 420;
const ANIMATION_WATCHDOG_MS = 900;

/** Title placement per card. */
const HERO_TITLE_PLACE: readonly ('top-left' | 'center' | 'right' | 'top-right')[] = [
  'top-left',
  'center',
  'right',
  'top-right',
];

function loopedCards(): ApplicationHubCard[] {
  return Array.from({ length: CLONE_SETS }, () => APPLICATION_HUB_CARDS).flat();
}

function usePrefersReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return reduceMotion;
}

export function ApplicationsHubDesktopCarousel({ copy }: { copy: ApplicationsHubCarouselCopy }) {
  const reduceMotion = usePrefersReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const enabledRef = useRef(false);
  const animatingRef = useRef(false);
  const normalizeLockRef = useRef(false);

  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const activeIndexRef = useRef(0);
  const syncTimerRef = useRef<number | null>(null);
  const scrollIdleTimerRef = useRef<number | null>(null);
  const animationWatchdogRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDomIndex, setActiveDomIndex] = useState(MIDDLE_SET_START);
  const [mounted, setMounted] = useState(false);

  const setCardRef = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      cardRefs.current[index] = node;
    },
    [],
  );

  const singleSetWidth = useCallback(() => {
    if (CARD_COUNT === 0) return 0;
    const first = cardRefs.current[0];
    const track = viewportRef.current?.querySelector('.app-hub-carousel-track') as HTMLElement | null;
    if (!first || !track) return 0;
    const gap =
      Number.parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap) ||
      CARD_GAP_PX;
    return CARD_COUNT * (first.offsetWidth + gap);
  }, []);

  const scrollLeftForDom = useCallback((domIndex: number): number | null => {
    const viewport = viewportRef.current;
    const card = cardRefs.current[domIndex];
    if (!viewport || !card) return null;
    return card.offsetLeft + card.offsetWidth / 2 - viewport.clientWidth / 2;
  }, []);

  const findClosestDom = useCallback((): number => {
    const viewport = viewportRef.current;
    if (!viewport) return MIDDLE_SET_START;

    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let bestDom = MIDDLE_SET_START;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < DOM_COUNT; i += 1) {
      const card = cardRefs.current[i];
      if (!card) continue;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestDom = i;
      }
    }

    return bestDom;
  }, []);

  const applyActiveDom = useCallback((domIndex: number) => {
    activeIndexRef.current = domIndex % CARD_COUNT;
    setActiveIndex(domIndex % CARD_COUNT);
    setActiveDomIndex(domIndex);
  }, []);

  const syncActiveIndex = useCallback(() => {
    applyActiveDom(findClosestDom());
  }, [applyActiveDom, findClosestDom]);

  const clearAnimationWatchdog = useCallback(() => {
    if (animationWatchdogRef.current !== null) {
      window.clearTimeout(animationWatchdogRef.current);
      animationWatchdogRef.current = null;
    }
  }, []);

  const normalizeScrollInstant = useCallback(() => {
    if (normalizeLockRef.current) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const setW = singleSetWidth();
    if (setW <= 0) return;

    const centeredDom = findClosestDom();
    let delta = 0;

    if (centeredDom < MIDDLE_SET_START) {
      delta = setW;
    } else if (centeredDom >= MIDDLE_SET_END) {
      delta = -setW;
    }

    if (delta === 0) return;

    normalizeLockRef.current = true;
    viewport.classList.add('app-hub-carousel-viewport--normalizing');
    viewport.style.scrollBehavior = 'auto';
    viewport.scrollLeft += delta;
    viewport.style.scrollBehavior = '';
    viewport.classList.remove('app-hub-carousel-viewport--normalizing');

    applyActiveDom(findClosestDom());

    requestAnimationFrame(() => {
      normalizeLockRef.current = false;
    });
  }, [applyActiveDom, findClosestDom, singleSetWidth]);

  const finishScrollInteraction = useCallback(() => {
    normalizeScrollInstant();
    animatingRef.current = false;
    clearAnimationWatchdog();
  }, [clearAnimationWatchdog, normalizeScrollInstant]);

  const scheduleScrollIdle = useCallback(() => {
    if (scrollIdleTimerRef.current !== null) {
      window.clearTimeout(scrollIdleTimerRef.current);
    }
    scrollIdleTimerRef.current = window.setTimeout(() => {
      finishScrollInteraction();
      scrollIdleTimerRef.current = null;
    }, SCROLL_IDLE_MS);
  }, [finishScrollInteraction]);

  const scheduleSync = useCallback(() => {
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = window.setTimeout(() => {
      syncActiveIndex();
      syncTimerRef.current = null;
    }, reduceMotion ? 0 : 80);
  }, [reduceMotion, syncActiveIndex]);

  const markAnimating = useCallback(() => {
    animatingRef.current = true;
    clearAnimationWatchdog();
    animationWatchdogRef.current = window.setTimeout(() => {
      animatingRef.current = false;
      animationWatchdogRef.current = null;
    }, ANIMATION_WATCHDOG_MS);
  }, [clearAnimationWatchdog]);

  const scrollToDomIndex = useCallback(
    (domIndex: number, behavior: ScrollBehavior = 'smooth') => {
      const viewport = viewportRef.current;
      const left = scrollLeftForDom(domIndex);
      if (!viewport || left === null) return;

      if (behavior === 'smooth') {
        markAnimating();
        scheduleScrollIdle();
      } else {
        animatingRef.current = false;
        clearAnimationWatchdog();
      }

      viewport.style.scrollBehavior = behavior;
      viewport.scrollTo({ left, behavior });
      viewport.style.scrollBehavior = '';
      applyActiveDom(domIndex);

      if (behavior === 'auto') {
        requestAnimationFrame(() => normalizeScrollInstant());
      }
    },
    [
      applyActiveDom,
      clearAnimationWatchdog,
      markAnimating,
      normalizeScrollInstant,
      scheduleScrollIdle,
      scrollLeftForDom,
    ],
  );

  const scrollToLogicalIndex = useCallback(
    (logicalIndex: number, behavior: ScrollBehavior = 'smooth') => {
      scrollToDomIndex(MIDDLE_SET_START + logicalIndex, behavior);
    },
    [scrollToDomIndex],
  );

  const snapToNearestDom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      scrollToDomIndex(findClosestDom(), behavior);
    },
    [findClosestDom, scrollToDomIndex],
  );

  const advance = useCallback(() => {
    if (pausedRef.current || draggingRef.current || !enabledRef.current || animatingRef.current) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) return;

    const currentDom = findClosestDom();
    const logical = currentDom % CARD_COUNT;

    if (logical === CARD_COUNT - 1) {
      const eduDom = MIDDLE_SET_START + logical;
      const retailCloneDom = eduDom + 1;

      if (currentDom !== eduDom) {
        const eduLeft = scrollLeftForDom(eduDom);
        if (eduLeft !== null) {
          viewport.style.scrollBehavior = 'auto';
          viewport.scrollLeft = eduLeft;
          viewport.style.scrollBehavior = '';
          applyActiveDom(eduDom);
        }
      }

      scrollToDomIndex(retailCloneDom, reduceMotion ? 'auto' : 'smooth');
      return;
    }

    const targetDom =
      currentDom >= MIDDLE_SET_END
        ? MIDDLE_SET_START + logical + 1
        : currentDom + 1;

    scrollToDomIndex(targetDom, reduceMotion ? 'auto' : 'smooth');
  }, [
    applyActiveDom,
    findClosestDom,
    reduceMotion,
    scrollLeftForDom,
    scrollToDomIndex,
  ]);

  useLayoutEffect(() => {
    let cancelled = false;
    const viewport = viewportRef.current;
    if (!viewport) {
      setMounted(true);
      return;
    }

    const initToMiddle = (): boolean => {
      if (cancelled) return true;
      const card = cardRefs.current[MIDDLE_SET_START];
      if (!card || card.offsetWidth <= 0) return false;
      scrollToDomIndex(MIDDLE_SET_START, 'auto');
      setMounted(true);
      return true;
    };

    if (initToMiddle()) {
      return () => {
        cancelled = true;
      };
    }

    const ro = new ResizeObserver(() => {
      initToMiddle();
    });
    ro.observe(viewport);
    for (const card of cardRefs.current) {
      if (card) ro.observe(card);
    }

    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!initToMiddle()) setMounted(true);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [scrollToDomIndex]);

  useEffect(() => {
    const onResize = () => scrollToLogicalIndex(activeIndexRef.current, 'auto');
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [scrollToLogicalIndex]);

  useEffect(() => {
    enabledRef.current = true;
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(advance, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [advance, reduceMotion]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const pause = () => {
      pausedRef.current = true;
    };
    const resume = () => {
      if (!draggingRef.current) pausedRef.current = false;
    };

    const onScroll = () => {
      scheduleSync();
      scheduleScrollIdle();
    };

    const onScrollEnd = () => {
      if (scrollIdleTimerRef.current !== null) {
        window.clearTimeout(scrollIdleTimerRef.current);
        scrollIdleTimerRef.current = null;
      }
      finishScrollInteraction();
    };

    viewport.addEventListener('mouseenter', pause);
    viewport.addEventListener('mouseleave', resume);
    viewport.addEventListener('focusin', pause);
    viewport.addEventListener('focusout', resume);
    viewport.addEventListener('scroll', onScroll, { passive: true });
    viewport.addEventListener('scrollend', onScrollEnd);

    return () => {
      viewport.removeEventListener('mouseenter', pause);
      viewport.removeEventListener('mouseleave', resume);
      viewport.removeEventListener('focusin', pause);
      viewport.removeEventListener('focusout', resume);
      viewport.removeEventListener('scroll', onScroll);
      viewport.removeEventListener('scrollend', onScrollEnd);
      if (scrollIdleTimerRef.current !== null) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
      clearAnimationWatchdog();
    };
  }, [clearAnimationWatchdog, finishScrollInteraction, scheduleScrollIdle, scheduleSync]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabledRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport || event.button !== 0) return;
    draggingRef.current = true;
    pausedRef.current = true;
    animatingRef.current = false;
    clearAnimationWatchdog();
    dragStartXRef.current = event.clientX;
    dragScrollLeftRef.current = viewport.scrollLeft;
    viewport.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = dragScrollLeftRef.current - (event.clientX - dragStartXRef.current);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    pausedRef.current = false;

    const viewport = viewportRef.current;
    if (!viewport) return;
    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    snapToNearestDom(reduceMotion ? 'auto' : 'smooth');
  };

  const onDotClick = (index: number) => {
    scrollToLogicalIndex(index, reduceMotion ? 'auto' : 'smooth');
  };

  const cards = loopedCards();

  return (
    <section
      className={`app-hub-carousel-section${mounted ? ' is-mounted' : ''}`}
      aria-label={copy.cardsAria}
    >
      <div
        ref={viewportRef}
        className="app-hub-carousel-viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="app-hub-carousel-track">
          {cards.map((card, index) => {
            const baseIndex = index % CARD_COUNT;
            const place = HERO_TITLE_PLACE[baseIndex];
            const isClone = index < MIDDLE_SET_START || index >= MIDDLE_SET_END;
            const isActive = index === activeDomIndex;
            return (
              <article
                key={`${card.id}-${index}`}
                ref={setCardRef(index)}
                className={`app-hub-carousel-card app-hub-carousel-card--${card.id}${isActive ? ' is-active' : ''}`}
                aria-hidden={isClone ? true : undefined}
              >
                <div className="app-hub-carousel-card-media">
                  <Image
                    src={card.image}
                    alt={copy.cardAlt(card.altKey)}
                    fill
                    sizes="(max-width: 734px) 85vw, 70vw"
                    quality={92}
                    className="app-hub-panel-img app-hub-panel-img--carousel object-cover"
                    priority={index === MIDDLE_SET_START}
                    loading={index === MIDDLE_SET_START ? undefined : 'lazy'}
                    draggable={false}
                  />
                </div>
                <div className={`app-hub-carousel-hero-title app-hub-carousel-hero-title--${place}`}>
                  <h2 className="app-hub-carousel-hero-heading">{copy.cardTitle(card.id)}</h2>
                  <p className="app-hub-carousel-summary">{copy.cardSummary(card.id)}</p>
                </div>
                <div className="app-hub-carousel-foot">
                  <Link
                    href={`${copy.langPrefix}${card.href}`}
                    className="app-hub-pill app-hub-carousel-foot-pill"
                    tabIndex={isClone ? -1 : undefined}
                  >
                    {copy.learnMore}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="app-hub-carousel-dots" role="tablist" aria-label={copy.cardsAria}>
        {APPLICATION_HUB_CARDS.map((card, index) => (
          <button
            key={card.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={copy.cardTitle(card.id)}
            className={`app-hub-carousel-dot${index === activeIndex ? ' is-active' : ''}`}
            onClick={() => onDotClick(index)}
          />
        ))}
      </div>
    </section>
  );
}
