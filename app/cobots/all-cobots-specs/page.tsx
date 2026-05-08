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

export default function ProductSelectorPage() {
  const lang = useSiteLang();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const lineup = useMemo(() => buildLineup(), []);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const interactTimerRef = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const t = SELECTOR_I18N[safeLang];

  const openInquiryForItem = (item: (typeof lineup)[number]) => {
    const short = lineupCardVariantShortName(item.name);
    const modelLabel = `${item.family.displayName}${short ? ` · ${short}` : ''}`;
    const body =
      safeLang === 'zh'
        ? `我想咨询以下机型：\n- ${modelLabel}\n\n请联系我并提供方案与报价。`
        : `I'm interested in this model:\n- ${modelLabel}\n\nPlease contact me with recommendation and quotation.`;
    window.dispatchEvent(new CustomEvent('apple-inquiry-open', { detail: { body } }));
  };

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const clearInteractTimer = () => {
    if (interactTimerRef.current !== null) {
      window.clearTimeout(interactTimerRef.current);
      interactTimerRef.current = null;
    }
  };

  const markInteracting = () => {
    setIsInteracting(true);
    clearInteractTimer();
    interactTimerRef.current = window.setTimeout(() => {
      setIsInteracting(false);
      updateActiveFromCenter();
      interactTimerRef.current = null;
    }, 220);
  };

  const updateActiveFromCenter = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const centerX = scroller.getBoundingClientRect().left + scroller.clientWidth / 2;
    let nearestId: string | null = null;
    let nearestDist = Number.POSITIVE_INFINITY;
    for (const item of lineup) {
      const el = cardRefs.current[item.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = item.id;
      }
    }
    if (nearestId) setActiveId(nearestId);
  };

  useEffect(() => {
    updateActiveFromCenter();
    const onResize = () => updateActiveFromCenter();
    window.addEventListener('resize', onResize);
    return () => {
      clearInteractTimer();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="selector-root min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased" style={{ WebkitFontSmoothing: 'antialiased' }}>
      <section className="hero-copy mx-auto w-full max-w-[var(--apple-w,1024px)] bg-transparent px-[22px] pb-8 pt-7 text-left md:pb-10 md:pt-8">
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
            isInteracting ? 'is-interacting' : ''
          }`}
          style={{ WebkitOverflowScrolling: 'touch', scrollPaddingLeft: 22, scrollPaddingRight: 22 }}
          aria-label={safeLang === 'zh' ? '机型横向列表' : 'Model lineup'}
          onScroll={() => {
            markInteracting();
            updateActiveFromCenter();
          }}
          onPointerDown={() => {
            markInteracting();
            updateActiveFromCenter();
          }}
          onPointerMove={() => {
            if (!isInteracting) return;
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
              className={`selector-card-shell ${activeId === item.id ? 'is-active' : ''}`}
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
        <p className="mx-auto mt-3 w-full max-w-[var(--apple-w,1024px)] px-[22px] text-left text-[12px] text-[#aeaeb2]">
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
