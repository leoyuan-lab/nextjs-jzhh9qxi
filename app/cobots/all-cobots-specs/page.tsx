'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildLineup,
  lineupCardVariantShortName,
  SelectorLineupCard,
  SELECTOR_LINEUP_I18N,
  VariantDetailPortal,
} from '@/components/selector/SelectorLineupUi';
import { useSiteLang } from '@/lib/site-lang-context';

const SELECTOR_I18N = SELECTOR_LINEUP_I18N;
const ACTIVE_SWITCH_HYSTERESIS_PX = 18;

export default function ProductSelectorPage() {
  const lang = useSiteLang();
  const [detailId, setDetailId] = useState<string | null>(null);
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

  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const t = SELECTOR_I18N[safeLang];

  const openInquiryForItem = (item: (typeof lineup)[number]) => {
    const short = lineupCardVariantShortName(item.name);
    const modelLabel = `${item.family.displayName}${short ? ` · ${short}` : ''}`;
    const body =
      safeLang === 'zh'
        ? `我想咨询以下机型：\n- ${modelLabel}\n\n请联系我并提供方案与报价。`
        : `I'm interested in this model:\n- ${modelLabel}\n\nPlease contact me with recommendation and quotation.`;
    window.dispatchEvent(new CustomEvent('roooll-inquiry-open', { detail: { body } }));
  };

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

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

  const updateActiveFromCenter = () => {
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
  };

  const updateDesktopHoverFromPointer = () => {
    if (enableMagnetActive) return;
    const scroller = scrollerRef.current;
    const pos = lastPointerRef.current;
    if (!scroller || !pos) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const inside =
      pos.x >= scrollerRect.left &&
      pos.x <= scrollerRect.right &&
      pos.y >= scrollerRect.top &&
      pos.y <= scrollerRect.bottom;
    if (!inside) {
      setDesktopHoverId(null);
      return;
    }
    const hit = document.elementFromPoint(pos.x, pos.y);
    const shell = hit instanceof Element ? hit.closest('.selector-card-shell') : null;
    if (!(shell instanceof HTMLDivElement)) {
      setDesktopHoverId(null);
      return;
    }
    const found = lineup.find((item) => cardRefs.current[item.id] === shell);
    setDesktopHoverId((prev) => (prev === (found?.id ?? null) ? prev : (found?.id ?? null)));
  };

  useEffect(() => {
    updateActiveFromCenter();
    const onResize = () => updateActiveFromCenter();
    window.addEventListener('resize', onResize);
    return () => {
      clearInteractTimer();
      window.removeEventListener('resize', onResize);
    };
  }, [enableMagnetActive]);

  return (
    <div className="selector-root min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased" style={{ WebkitFontSmoothing: 'antialiased' }}>
      <section className="hero-copy mx-auto w-full max-w-[var(--roooll-w,1024px)] bg-transparent px-[22px] pb-8 pt-7 text-left md:pb-10 md:pt-8">
        <div className="mb-3 h-[11px] shrink-0 md:h-3" aria-hidden />
        <h1 className="mb-4 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#1d1d1f] md:text-[3.25rem]">
          {t.title}
        </h1>
        <p className="max-w-[46rem] text-[1.0625rem] font-normal leading-snug text-[#6e6e73] md:text-[1.3125rem]">
          {t.subtitle}
        </p>
      </section>

      <div className="relative bg-transparent pb-16 md:pb-24">
        <div
          ref={scrollerRef}
          className={`selector-scroller flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible bg-transparent pb-3 pt-3 pl-0 pr-0 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 md:pb-4 md:pt-4 md:pl-[22px] md:pr-[22px] [&::-webkit-scrollbar]:hidden ${
            enableMagnetActive && isInteracting ? 'is-interacting' : ''
          }`}
          style={{ WebkitOverflowScrolling: 'touch', scrollPaddingLeft: 22, scrollPaddingRight: 22 }}
          aria-label={safeLang === 'zh' ? '机型横向列表' : 'Model lineup'}
          onScroll={() => {
            if (enableMagnetActive) {
              markInteracting();
              updateActiveFromCenter();
              return;
            }
            updateDesktopHoverFromPointer();
          }}
          onPointerDown={() => {
            if (!enableMagnetActive) return;
            markInteracting();
            updateActiveFromCenter();
          }}
          onMouseMove={(e) => {
            if (enableMagnetActive) return;
            lastPointerRef.current = { x: e.clientX, y: e.clientY };
            updateDesktopHoverFromPointer();
          }}
          onMouseLeave={() => {
            if (enableMagnetActive) return;
            lastPointerRef.current = null;
            setDesktopHoverId(null);
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
                onOpenDetail={() => setDetailId(item.id)}
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
        <p className="mx-auto mt-3 w-full max-w-[var(--roooll-w,1024px)] px-[22px] text-left text-[12px] text-[#aeaeb2]">
          {safeLang === 'zh' ? '← 在触控板或触摸屏上左右滑动 →' : '← Swipe or scroll horizontally →'}
        </p>
      </div>

      <VariantDetailPortal
        lineup={lineup}
        detailId={detailId}
        onClose={() => setDetailId(null)}
        lang={safeLang}
      />
    </div>
  );
}
