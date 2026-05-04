'use client';

import { useMemo, useState } from 'react';
import {
  buildLineup,
  SelectorLineupCard,
  SELECTOR_LINEUP_I18N,
  VariantDetailPortal,
} from '@/components/selector/SelectorLineupUi';
import { useSiteLang } from '@/lib/site-lang-context';

const SELECTOR_I18N = SELECTOR_LINEUP_I18N;

export default function ProductSelectorPage() {
  const lang = useSiteLang();
  const [detailId, setDetailId] = useState<string | null>(null);
  const lineup = useMemo(() => buildLineup(), []);

  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const t = SELECTOR_I18N[safeLang];

  return (
    <div className="selector-root min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased" style={{ WebkitFontSmoothing: 'antialiased' }}>
      <section className="hero-copy mx-auto w-full max-w-[var(--apple-w,1024px)] bg-[#f5f5f7] px-[22px] pb-8 pt-7 text-left md:pb-10 md:pt-8">
        <div className="mb-3 h-[11px] shrink-0 md:h-3" aria-hidden />
        <h1 className="mb-4 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#1d1d1f] md:text-[3.25rem]">
          {t.title}
        </h1>
        <p className="max-w-[46rem] text-[1.0625rem] font-normal leading-snug text-[#6e6e73] md:text-[1.3125rem]">
          {t.subtitle}
        </p>
      </section>

      <div className="relative bg-[#f5f5f7] pb-16 md:pb-24">
        <div
          className="selector-scroller flex snap-x snap-mandatory gap-5 overflow-x-auto bg-[#f5f5f7] pb-3 pl-[22px] pr-[22px] [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 md:pb-4 md:pl-[22px] md:pr-[22px] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch', scrollPaddingLeft: 22, scrollPaddingRight: 22 }}
          aria-label={safeLang === 'zh' ? '机型横向列表' : 'Model lineup'}
        >
          {lineup.map((item, index) => (
            <SelectorLineupCard
              key={item.id}
              item={item}
              lang={safeLang}
              t={t}
              index={index}
              onOpenDetail={() => setDetailId(item.id)}
            />
          ))}
          <div className="w-5 shrink-0 snap-none md:w-8" aria-hidden />
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
