'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HorizontalScrollDots,
  scrollHorizontalSnapItem,
  useHorizontalScrollIndex,
} from '@/components/HorizontalScrollDots';
import {
  buildLineup,
  lineupCardVariantShortNameForItem,
  SelectorLineupCard,
  SELECTOR_LINEUP_I18N,
  VariantDetailPortal,
} from '@/components/selector/SelectorLineupUi';
import { SelectorJourneySection } from '@/components/selector/SelectorJourneySection';
import { trackEvent } from '@/lib/analytics';
import { getMessages } from '@/lib/messages';
import { openInquiry } from '@/lib/open-inquiry';
import { useSiteLang } from '@/lib/site-lang-context';
import {
  variantDetailPathname,
  variantIdFromPublicUrlToken,
  variantPublicSlug,
} from '@/lib/variant-public-slug';

const SELECTOR_I18N = SELECTOR_LINEUP_I18N;
const ACTIVE_SWITCH_HYSTERESIS_PX = 18;

type Props = {
  /** When set, opens the detail modal for this public slug (from `/all-cobots-specs/{slug}`). */
  initialVariantSlug?: string;
};

export default function AllCobotsSpecsClient({ initialVariantSlug }: Props) {
  const lang = useSiteLang();
  const router = useRouter();
  const resolvedInitialId = useMemo(
    () => (initialVariantSlug ? variantIdFromPublicUrlToken(initialVariantSlug) : null),
    [initialVariantSlug],
  );
  const [detailId, setDetailId] = useState<string | null>(resolvedInitialId);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [enableMagnetActive, setEnableMagnetActive] = useState(false);
  const [desktopHoverId, setDesktopHoverId] = useState<string | null>(null);
  const lineup = useMemo(() => buildLineup(), []);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const interactTimerRef = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const magnetScrollRafRef = useRef<number | null>(null);

  const getSnapItems = useCallback(
    () => lineup.map((item) => cardRefs.current[item.id] ?? null),
    [lineup],
  );
  const dotActiveIndex = useHorizontalScrollIndex(scrollerRef, getSnapItems);

  const scrollToLineupIndex = (index: number) => {
    const item = lineup[index];
    if (!item) return;
    scrollHorizontalSnapItem(scrollerRef.current, cardRefs.current[item.id] ?? null, 'center');
  };

  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const t = SELECTOR_I18N[safeLang];
  const lineupSubtitle = getMessages(safeLang).pages.all_cobots_specs.lineup.subtitle;

  const openInquiryForItem = (item: (typeof lineup)[number]) => {
    const short = lineupCardVariantShortNameForItem(item, safeLang);
    const modelLabel = `${item.family.displayName}${short ? ` · ${short}` : ''}`;
    const body =
      safeLang === 'zh'
        ? `我想咨询以下机型：\n- ${modelLabel}\n\n请联系我并提供方案与报价。`
        : `I'm interested in this model:\n- ${modelLabel}\n\nPlease contact me with recommendation and quotation.`;
    openInquiry({ body, source: 'all_cobots_specs' });
  };

  useEffect(() => {
    trackEvent('selector_view', { selector: 'all_cobots_specs', locale: safeLang });
  }, [safeLang]);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    setDetailId(resolvedInitialId);
  }, [resolvedInitialId]);

  const openDetailForItem = useCallback(
    (itemId: string) => {
      setDetailId(itemId);
      const slug = variantPublicSlug(itemId);
      router.push(`/${lang}${variantDetailPathname(slug)}`, { scroll: false });
    },
    [lang, router],
  );

  const closeDetail = useCallback(() => {
    setDetailId(null);
    router.push(`/${lang}/cobots/all-cobots-specs`, { scroll: false });
  }, [lang, router]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const apply = () => setEnableMagnetActive(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const clearInteractTimer = () => {
    if (interactTimerRef.current !== null) {
      window.clearTimeout(interactTimerRef.current);
      interactTimerRef.current = null;
    }
  };

  const updateActiveFromCenter = useCallback(() => {
    if (!enableMagnetActive) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // Use layout coordinates (offsetLeft/offsetWidth) instead of viewport rects:
    // hover/active scale transforms should not affect magnetic center detection.
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
    let nearestId: string | null = null;
    let nearestDist = Number.POSITIVE_INFINITY;
    for (const item of lineup) {
      const el = cardRefs.current[item.id];
      if (!el) continue;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = item.id;
      }
    }
    if (!nearestId) return;

    const currentId = activeIdRef.current;
    if (!currentId || currentId === nearestId) {
      setActiveId(nearestId);
      return;
    }

    const currentEl = cardRefs.current[currentId];
    if (!currentEl) {
      setActiveId(nearestId);
      return;
    }

    const currentCenter = currentEl.offsetLeft + currentEl.offsetWidth / 2;
    const currentDist = Math.abs(currentCenter - centerX);
    // Hysteresis: only switch when the newcomer is meaningfully closer.
    if (nearestDist + ACTIVE_SWITCH_HYSTERESIS_PX < currentDist) {
      setActiveId(nearestId);
    }
  }, [enableMagnetActive, lineup]);

  /** Desktop: which card (if any) contains the last known pointer — scroll-safe, no CSS :hover. */
  const updateDesktopHoverFromPointer = useCallback(() => {
    if (enableMagnetActive) return;
    const scroller = scrollerRef.current;
    const pos = lastPointerRef.current;
    if (!scroller || !pos) {
      setDesktopHoverId((prev) => (prev !== null ? null : prev));
      return;
    }
    const scrollerRect = scroller.getBoundingClientRect();
    const inside =
      pos.x >= scrollerRect.left &&
      pos.x <= scrollerRect.right &&
      pos.y >= scrollerRect.top &&
      pos.y <= scrollerRect.bottom;
    if (!inside) {
      setDesktopHoverId((prev) => (prev !== null ? null : prev));
      return;
    }
    let foundId: string | null = null;
    for (const item of lineup) {
      const el = cardRefs.current[item.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (pos.x >= r.left && pos.x <= r.right && pos.y >= r.top && pos.y <= r.bottom) {
        foundId = item.id;
        break;
      }
    }
    setDesktopHoverId((prev) => (prev === foundId ? prev : foundId));
  }, [enableMagnetActive, lineup]);

  const scheduleMagnetScrollUpdate = useCallback(() => {
    if (magnetScrollRafRef.current !== null) return;
    magnetScrollRafRef.current = window.requestAnimationFrame(() => {
      magnetScrollRafRef.current = null;
      updateActiveFromCenter();
    });
  }, [updateActiveFromCenter]);

  const markInteracting = () => {
    if (!enableMagnetActive) return;
    setIsInteracting(true);
    clearInteractTimer();
    interactTimerRef.current = window.setTimeout(() => {
      setIsInteracting(false);
      updateActiveFromCenter();
      interactTimerRef.current = null;
    }, 220);
  };

  /** Track pointer anywhere while on this page so drag-scroll / wheel still updates card-under-cursor. */
  useEffect(() => {
    if (enableMagnetActive) return undefined;
    const onMove = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      updateDesktopHoverFromPointer();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enableMagnetActive, updateDesktopHoverFromPointer]);

  useEffect(() => {
    updateActiveFromCenter();
    const onResize = () => updateActiveFromCenter();
    window.addEventListener('resize', onResize);
    return () => {
      clearInteractTimer();
      window.removeEventListener('resize', onResize);
      if (magnetScrollRafRef.current !== null) {
        window.cancelAnimationFrame(magnetScrollRafRef.current);
        magnetScrollRafRef.current = null;
      }
    };
  }, [enableMagnetActive, updateActiveFromCenter]);

  return (
    <div className="selector-root min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased" style={{ WebkitFontSmoothing: 'antialiased' }}>
      <section className="hero-copy roooll-page-hero-top mx-auto w-full max-w-[var(--roooll-w,1024px)] bg-transparent px-[22px] pb-8 text-left md:pb-10">
        <h1 className="roooll-page-hero-title mb-4">{t.title}</h1>
        <p className="max-w-[46rem] text-[1.0625rem] font-normal leading-snug text-[#6e6e73] md:text-[1.3125rem]">
          {lineupSubtitle}
        </p>
      </section>

      <div className="relative bg-transparent pb-8 md:pb-10">
        <div className="selector-scroller-stage">
          <div
            ref={scrollerRef}
            className={`selector-scroller roooll-hscroll flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible bg-transparent pl-0 pr-0 md:gap-6 md:pl-[22px] md:pr-[22px] ${
              enableMagnetActive && isInteracting ? 'is-interacting' : ''
            }`}
            style={{ WebkitOverflowScrolling: 'touch', scrollPaddingLeft: 22, scrollPaddingRight: 22 }}
            aria-label={safeLang === 'zh' ? '机型横向列表' : 'Model lineup'}
            onPointerEnter={(e) => {
              if (enableMagnetActive) return;
              lastPointerRef.current = { x: e.clientX, y: e.clientY };
              updateDesktopHoverFromPointer();
            }}
            onPointerLeave={() => {
              if (enableMagnetActive) return;
              lastPointerRef.current = null;
              setDesktopHoverId(null);
            }}
            onScroll={() => {
              if (enableMagnetActive) {
                markInteracting();
                scheduleMagnetScrollUpdate();
                return;
              }
              updateDesktopHoverFromPointer();
            }}
            onPointerDown={() => {
              if (!enableMagnetActive) return;
              markInteracting();
              updateActiveFromCenter();
            }}
            onPointerUp={markInteracting}
            onPointerCancel={markInteracting}
          >
            <div
              className="shrink-0 snap-none md:hidden"
              style={{ width: 'max(22px, calc(50vw - min(46vw, 204px)))' }}
              aria-hidden
            />
            {lineup.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[item.id] = el;
                }}
                className={`selector-card-shell ${
                  enableMagnetActive && activeId === item.id ? 'is-active' : ''
                } ${!enableMagnetActive && desktopHoverId === item.id ? 'is-hovered' : ''}`}
              >
                <SelectorLineupCard
                  item={item}
                  lang={safeLang}
                  t={t}
                  index={index}
                  onOpenDetail={() => openDetailForItem(item.id)}
                  onOpenInquiry={() => openInquiryForItem(item)}
                  deferImageProcessingUntilVisible
                />
              </div>
            ))}
            <div
              className="shrink-0 snap-none md:hidden"
              style={{ width: 'max(22px, calc(50vw - min(46vw, 204px)))' }}
              aria-hidden
            />
            <div className="hidden w-8 shrink-0 snap-none md:block" aria-hidden />
          </div>
        </div>
        <HorizontalScrollDots
          count={lineup.length}
          activeIndex={dotActiveIndex}
          label={safeLang === 'zh' ? '机型列表分页' : 'Model lineup pages'}
          onSelect={scrollToLineupIndex}
        />
      </div>

      <SelectorJourneySection />

      <VariantDetailPortal lineup={lineup} detailId={detailId} onClose={closeDetail} lang={safeLang} />
    </div>
  );
}
