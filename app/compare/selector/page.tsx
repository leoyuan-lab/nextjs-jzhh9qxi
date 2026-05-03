'use client';

import Image from 'next/image';
import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  robotVariantImageUrl,
  rSeriesData,
  specLabels,
  type RobotFamily,
  type RobotVariant,
} from '@/data/products';
import { useSiteLang } from '@/lib/site-lang-context';

type LineItem = RobotVariant & {
  family: RobotFamily;
};

const AXIS_ORDER: (keyof RobotVariant['axes'])[] = [
  'base',
  'shoulder',
  'elbow',
  'wrist1',
  'wrist2',
  'wrist3',
];

function buildLineup(): LineItem[] {
  return rSeriesData.flatMap((family) =>
    family.variants.map((v) => ({ ...v, family })),
  );
}

function ml(v: { zh: string; en: string }, lang: 'zh' | 'en') {
  return lang === 'zh' ? v.zh : v.en;
}

/**
 * 详情区域纵向滚动时，用 Vibration API 做「刻度式」短震（类似系统里 Industry 滚轮选择器），
 * 快慢随滑动速度变化。仅触摸类设备 + 支持 Vibration API 的浏览器；尊重 prefers-reduced-motion。
 * （iOS Safari 一般不开放网页振动，与系统里原生 <select> 滚轮触感不同，属平台限制。）
 */
function useScrollNotchHaptics(scrollRef: RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const el = scrollRef.current;
    if (!el) return;

    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMq.matches) return;
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;

    const touchLike =
      window.matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints ?? 0) > 0;
    if (!touchLike) return;

    let lastY = el.scrollTop;
    let lastTs = performance.now();
    let accPx = 0;
    let lastPulseAt = 0;
    let velEma = 0;

    const stopVibrate = () => {
      try {
        navigator.vibrate(0);
      } catch {
        /* ignore */
      }
    };

    const onScroll = () => {
      if (reducedMq.matches) return;
      const y = el.scrollTop;
      const ts = performance.now();
      const dy = y - lastY;
      const dt = Math.max(ts - lastTs, 5);
      const inst = Math.abs(dy) / dt;
      velEma = velEma * 0.55 + inst * 0.45;
      lastY = y;
      lastTs = ts;

      const ady = Math.abs(dy);
      if (ady < 0.35) return;
      accPx += ady;

      const v = Math.min(velEma, 5);
      const pxPerNotch = Math.max(12, 52 - v * 8.5);
      const minGapMs = Math.max(22, 88 - v * 14);
      const durationMs = Math.round(Math.min(18, Math.max(4, 5 + v * 2.2)));

      if (accPx >= pxPerNotch && ts - lastPulseAt >= minGapMs) {
        accPx = 0;
        lastPulseAt = ts;
        try {
          navigator.vibrate(durationMs);
        } catch {
          /* ignore */
        }
      }
    };

    const onReduced = () => {
      stopVibrate();
    };
    reducedMq.addEventListener('change', onReduced);

    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      reducedMq.removeEventListener('change', onReduced);
      el.removeEventListener('scroll', onScroll);
      stopVibrate();
    };
  }, [active, scrollRef]);
}

/** 页面上不展示原 FR 型号字样（仅影响本页展示，不改数据源） */
function stripIndustrialModelCodes(text: string): string {
  const s = text
    .replace(/fr\d{1,2}(?:-[a-z0-9]+)+/gi, '')
    .replace(/FR\d{1,2}(?:-[A-Z0-9]+)*/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([，。；、])/g, '$1')
    .trim();
  return s;
}

/** 变体展示名：FR16 → 16，FR20 → 20；其它名称去掉独立的 FR+数字 片段 */
function displayVariantLabel(name: string): string {
  return name.replace(/\bFR(\d+)\b/gi, '$1');
}

/** 小卡片 / 详情标题：去掉 Standard 及全角/半角括号内说明 */
function lineupCardVariantShortName(name: string): string {
  let s = name
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim();
  s = s.replace(/\bstandard\b/gi, '').replace(/\s+/g, ' ').trim();
  return displayVariantLabel(s).trim();
}

/** 灰色总结文案：分号处换行展示 */
function selectorSummarizeBody(text: string): string {
  return stripIndustrialModelCodes(text)
    .split(/[；;]\s*/)
    .map((x) => x.trim())
    .filter(Boolean)
    .join('\n');
}

const SELECTOR_I18N = {
  zh: {
    title: '探索全系机型',
    subtitle: '左右滑动，浏览全部 r 系列协作臂变体。',
    payload: '负载',
    reach: '工作半径',
    repeatability: '重复定位精度',
    weight: '机器自重',
    detailTitle: '规格详情',
    close: '关闭',
    dof: '自由度',
    noise: '噪声',
    mounting: '安装方式',
    hero2Title: '对比全系 r 家族',
    hero2Subtitle: '在三个下拉框中各选一款不同的 r 系列变体。',
    hero2ChooseModel: '选择机型',
    hero2Inquiry: '咨询',
  },
  en: {
    title: 'Explore the lineup',
    subtitle: 'Swipe sideways to browse every r‑Series cobot variant.',
    payload: 'Payload',
    reach: 'Reach',
    repeatability: 'Repeatability',
    weight: 'Weight',
    detailTitle: 'Specifications',
    close: 'Close',
    dof: 'DOF',
    noise: 'Noise',
    mounting: 'Mounting',
    hero2Title: 'Compare all r family',
    hero2Subtitle: 'Pick a different r‑Series variant in each menu below.',
    hero2ChooseModel: 'Choose models',
    hero2Inquiry: 'Inquiry',
  },
} as const;

/** 与 ClientLayout 主导航收起动画一致（apple-main-nav-progress） */
const SELECTOR_HERO2_NAV_HIDE_START = 44 + 100;
const SELECTOR_HERO2_NAV_HIDE_END = 44;

export default function ProductSelectorPage() {
  const lang = useSiteLang();
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const hero2SectionRef = useRef<HTMLElement | null>(null);
  const lineup = useMemo(() => buildLineup(), []);

  const detailItem = useMemo(
    () => (detailId ? lineup.find((x) => x.id === detailId) ?? null : null),
    [detailId, lineup],
  );

  const detailVariantShort = useMemo(
    () => (detailItem ? lineupCardVariantShortName(detailItem.name) : ''),
    [detailItem],
  );

  useScrollNotchHaptics(detailScrollRef, detailItem !== null);

  useEffect(() => {
    if (!detailId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detailId]);

  useEffect(() => {
    if (!detailId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailId]);

  useEffect(() => {
    const emit = (progress: number) => {
      window.dispatchEvent(
        new CustomEvent('apple-main-nav-progress', { detail: { progress } }),
      );
    };

    const tick = () => {
      const el = hero2SectionRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const span = Math.max(1, SELECTOR_HERO2_NAV_HIDE_START - SELECTOR_HERO2_NAV_HIDE_END);
      const p = Math.max(0, Math.min(1, (SELECTOR_HERO2_NAV_HIDE_START - top) / span));
      emit(p);
    };

    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    return () => {
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
      emit(0);
    };
  }, []);

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

      <section
        ref={hero2SectionRef}
        className="selector-hero2 border-t border-[#d2d2d7]/80 bg-white text-[#1d1d1f]"
        aria-labelledby="selector-hero2-title"
      >
        <div className="mx-auto w-full max-w-[var(--apple-w,1024px)] px-[22px] pb-16 pt-10 md:pb-24 md:pt-12">
          <h2
            id="selector-hero2-title"
            className="mb-3 max-w-[52rem] text-[2rem] font-semibold leading-[1.07] tracking-[-0.03em] text-[#1d1d1f] md:text-[2.75rem]"
          >
            {t.hero2Title}
          </h2>
          <p className="mb-5 max-w-[46rem] text-[1.0625rem] leading-snug text-[#6e6e73] md:mb-6 md:text-[1.1875rem]">
            {t.hero2Subtitle}
          </p>
          <SelectorHero2ModelCompare lineup={lineup} lang={safeLang} t={t} />
        </div>
      </section>

      {detailItem &&
        createPortal(
        <div
          className="fixed inset-0 z-[100100] flex flex-col sm:flex-row sm:items-center sm:justify-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="variant-detail-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            aria-label={t.close}
            onClick={() => setDetailId(null)}
          />
          <div className="relative z-[1] flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none bg-[#fbfbfd] shadow-none sm:max-h-[min(92dvh,900px)] sm:max-w-[780px] sm:flex-none sm:rounded-[1.35rem] sm:shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-black/[0.06] px-5 py-4 sm:px-8 sm:py-6">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73] sm:text-xs">{t.detailTitle}</p>
                <h2 id="variant-detail-title" className="mt-1 text-[1.25rem] font-semibold tracking-tight text-[#1d1d1f] sm:text-[1.6rem]">
                  {detailItem.family.displayName}
                  {detailVariantShort ? (
                    <>
                      <span className="font-normal text-[#86868b]"> · </span>
                      {detailVariantShort}
                    </>
                  ) : null}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDetailId(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d2d2d7] bg-white text-[1.25rem] font-light leading-none text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] sm:h-10 sm:w-10 sm:text-[1.35rem]"
                aria-label={t.close}
              >
                ×
              </button>
            </header>
            <div
              ref={detailScrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-8 sm:py-6"
            >
              <p className="mb-6 whitespace-pre-line text-[0.9375rem] leading-relaxed text-[#424245] sm:text-[1.125rem] sm:leading-relaxed">
                {selectorSummarizeBody(
                  safeLang === 'zh' ? detailItem.description.zh : detailItem.description.en,
                )}
              </p>
              <dl className="space-y-4 text-[0.875rem] sm:space-y-5 sm:text-[1.0625rem]">
                <SpecRow label={specLabels.payload[safeLang]} value={detailItem.payload} detail />
                <SpecRow label={specLabels.reach[safeLang]} value={detailItem.reach} detail />
                <SpecRow label={specLabels.repeatability[safeLang]} value={detailItem.repeatability} detail />
                <SpecRow label={specLabels.weight[safeLang]} value={detailItem.weight} detail />
                <SpecRow label={t.dof} value={detailItem.dof} detail />
                <SpecRow label={specLabels.ip[safeLang]} value={detailItem.ipRating} detail />
                <SpecRow
                  label={specLabels.power[safeLang]}
                  value={`${detailItem.avgPower} / ${detailItem.peakPower}`}
                  detail
                />
                <SpecRow label={specLabels.tcpSpeed[safeLang]} value={detailItem.tcpSpeed} detail />
                <SpecRow label={specLabels.voltage[safeLang]} value={detailItem.voltage} detail />
                <SpecRow label={t.noise} value={detailItem.noise} detail />
                <SpecRow label={t.mounting} value={ml(detailItem.mounting, safeLang)} detail />
                <SpecRow
                  label={specLabels.environment[safeLang]}
                  value={`${detailItem.temperature}；${detailItem.humidity}`}
                  detail
                />
                <SpecRow label={specLabels.footprint[safeLang]} value={detailItem.footprint} detail />
                <SpecRow label={specLabels.io[safeLang]} value={detailItem.ioPorts} detail />
                <SpecRow label={safeLang === 'zh' ? '工具电源' : 'Tool power'} value={detailItem.toolPower} detail />
                {detailItem.materials && (
                  <SpecRow label={specLabels.materials[safeLang]} value={ml(detailItem.materials, safeLang)} detail />
                )}
                {detailItem.powerTestNote && (
                  <SpecRow
                    label={safeLang === 'zh' ? '功率测试说明' : 'Power test note'}
                    value={stripIndustrialModelCodes(ml(detailItem.powerTestNote, safeLang))}
                    detail
                  />
                )}
              </dl>
              <div className="mt-8 border-t border-black/[0.06] pt-5 sm:mt-10">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73] sm:text-xs">
                  {specLabels.axes[safeLang]}
                </p>
                <dl className="space-y-3 text-[0.8125rem] sm:space-y-3.5 sm:text-[0.9375rem]">
                  {AXIS_ORDER.map((key) => {
                    const ax = detailItem.axes[key];
                    return (
                      <div key={key} className="flex flex-col gap-0.5 border-b border-black/[0.04] pb-3 last:border-0">
                        <dt className="font-semibold text-[#1d1d1f] sm:text-[1rem]">{specLabels.axisLabels[key][safeLang]}</dt>
                        <dd className="text-[#424245] sm:text-[0.9375rem]">
                          <span className="text-[#6e6e73]">{safeLang === 'zh' ? '范围' : 'Range'}: </span>
                          {ax.range}
                        </dd>
                        <dd className="text-[#424245] sm:text-[0.9375rem]">
                          <span className="text-[#6e6e73]">{safeLang === 'zh' ? '最大角速度' : 'Max speed'}: </span>
                          {ax.speed}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </div>
          </div>
        </div>,
        document.body,
        )}
    </div>
  );
}

type CardCopy = {
  payload: string;
  reach: string;
  repeatability: string;
  weight: string;
};

type SelectorPageCopy = (typeof SELECTOR_I18N)[keyof typeof SELECTOR_I18N];

/** Hero2 默认：r‑Lite 标准、r‑Core 标准、r‑Max 16 */
const HERO2_DEFAULT_IDS: [string, string, string] = ['fr3-std', 'fr5-std', 'fr16-std'];

function hero2SelectLabel(item: LineItem): string {
  const v = lineupCardVariantShortName(item.name);
  return v ? `${item.family.displayName} · ${v}` : item.family.displayName;
}

const SELECTOR_NAV_PIN_PX = 44;

function SelectorHero2ModelCompare({
  lineup,
  lang,
  t,
}: {
  lineup: LineItem[];
  lang: 'zh' | 'en';
  t: SelectorPageCopy;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [shellH, setShellH] = useState(0);
  const lastPinEventRef = useRef<boolean | null>(null);

  const [ids, setIds] = useState<[string, string, string]>(() => {
    const ok = (id: string) => lineup.some((x) => x.id === id);
    const a = ok(HERO2_DEFAULT_IDS[0]) ? HERO2_DEFAULT_IDS[0] : lineup[0]?.id ?? '';
    const b =
      ok(HERO2_DEFAULT_IDS[1]) && HERO2_DEFAULT_IDS[1] !== a
        ? HERO2_DEFAULT_IDS[1]
        : lineup.find((x) => x.id !== a)?.id ?? a;
    const c =
      ok(HERO2_DEFAULT_IDS[2]) && HERO2_DEFAULT_IDS[2] !== a && HERO2_DEFAULT_IDS[2] !== b
        ? HERO2_DEFAULT_IDS[2]
        : lineup.find((x) => x.id !== a && x.id !== b)?.id ?? a;
    return [a, b, c];
  });

  const selected = ids.map((id) => lineup.find((x) => x.id === id)).filter(Boolean) as LineItem[];

  useEffect(() => {
    const el = measureRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      setShellH(el.offsetHeight);
    });
    ro.observe(el);
    setShellH(el.offsetHeight);
    return () => ro.disconnect();
  }, [ids, lang]);

  useEffect(() => {
    const emit = (next: boolean) => {
      if (lastPinEventRef.current === next) return;
      lastPinEventRef.current = next;
      window.dispatchEvent(new CustomEvent('selector-compare-sticky-pin', { detail: { pinned: next } }));
    };

    const tick = () => {
      const s = sentinelRef.current;
      if (!s) return;
      const shouldPin = s.getBoundingClientRect().top <= SELECTOR_NAV_PIN_PX;
      setPinned(shouldPin);
      emit(shouldPin);
    };

    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    return () => {
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
      emit(false);
      lastPinEventRef.current = null;
    };
  }, []);

  const setSlot = (index: 0 | 1 | 2, id: string) => {
    setIds((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string];
      next[index] = id;
      return next;
    });
  };

  const rowSubhead =
    'mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86868b] md:text-xs';
  const valueGrid = 'grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 md:gap-x-6';
  const valueText = 'text-[0.8125rem] font-medium leading-snug text-[#1d1d1f] md:text-[0.9375rem]';

  /** 手机只对比前两台；第三台仅 md+ 显示 */
  const valueCellClass = (colIndex: number) =>
    colIndex === 2 ? 'hidden text-center md:block' : 'text-center';

  const mainRows: { label: string; get: (i: LineItem) => string }[] = [
    { label: specLabels.payload[lang], get: (i) => i.payload },
    { label: specLabels.reach[lang], get: (i) => i.reach },
    { label: specLabels.repeatability[lang], get: (i) => i.repeatability },
    { label: specLabels.weight[lang], get: (i) => i.weight },
    { label: t.dof, get: (i) => i.dof },
    { label: specLabels.ip[lang], get: (i) => i.ipRating },
    { label: specLabels.power[lang], get: (i) => `${i.avgPower} / ${i.peakPower}` },
    { label: specLabels.tcpSpeed[lang], get: (i) => i.tcpSpeed },
    { label: specLabels.voltage[lang], get: (i) => i.voltage },
    { label: t.noise, get: (i) => i.noise },
    { label: t.mounting, get: (i) => ml(i.mounting, lang) },
    { label: specLabels.environment[lang], get: (i) => `${i.temperature}；${i.humidity}` },
    { label: specLabels.footprint[lang], get: (i) => i.footprint },
    { label: specLabels.io[lang], get: (i) => i.ioPorts },
    { label: lang === 'zh' ? '工具电源' : 'Tool power', get: (i) => i.toolPower },
    { label: specLabels.materials[lang], get: (i) => (i.materials ? ml(i.materials, lang) : '—') },
    {
      label: lang === 'zh' ? '功率测试说明' : 'Power test note',
      get: (i) => (i.powerTestNote ? stripIndustrialModelCodes(ml(i.powerTestNote, lang)) : '—'),
    },
  ];

  return (
    <div>
      <div ref={sentinelRef} className="h-0 w-full shrink-0" aria-hidden />
      <div className="shrink-0" style={{ height: pinned ? shellH : 0 }} aria-hidden />
      <div
        ref={shellRef}
        className={
          pinned
            ? 'fixed left-0 right-0 top-0 z-[10000] border-b border-black/[0.08] bg-white/92 pb-3 pt-[max(env(safe-area-inset-top),10px)] shadow-[0_2px_16px_rgba(0,0,0,0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-white/80'
            : 'relative z-[1]'
        }
      >
        <div ref={measureRef} className="mx-auto w-full max-w-[var(--apple-w,1024px)] px-[22px]">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73] md:text-xs">
            {t.hero2ChooseModel}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-0">
            {([0, 1, 2] as const).map((slot) => {
              const item = lineup.find((x) => x.id === ids[slot]);
              const ariaPick = `${t.hero2ChooseModel} ${slot + 1}`;
              return (
                <div
                  key={slot}
                  className={
                    slot === 2
                      ? 'hidden flex-col md:flex'
                      : 'flex flex-col'
                  }
                >
                  <select
                    aria-label={ariaPick}
                    value={ids[slot]}
                    onChange={(e) => setSlot(slot, e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-[0.85rem] border border-black/[0.12] bg-[#f5f5f7] py-3 pl-3.5 pr-9 text-[0.9375rem] font-medium text-[#1d1d1f] outline-none transition-[border-color,box-shadow] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/25 md:rounded-[1rem] md:py-3.5 md:pl-4"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236e6e73' d='M2.5 4.25L6 7.75l3.5-3.5'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center',
                    }}
                  >
                    {lineup.map((opt) => {
                      const takenElsewhere = ids.some((id, j) => j !== slot && id === opt.id);
                      return (
                        <option key={opt.id} value={opt.id} disabled={takenElsewhere}>
                          {hero2SelectLabel(opt)}
                        </option>
                      );
                    })}
                  </select>
                  {item ? (
                    <div
                      className={
                        slot === 2
                          ? 'mt-5 flex flex-col items-center md:mt-6 md:items-stretch'
                          : 'mt-5 flex flex-col items-center md:mt-6 md:items-stretch'
                      }
                    >
                      <div className="flex h-[120px] w-full max-w-[220px] items-center justify-center md:h-[132px] md:max-w-none">
                        <Image
                          src={robotVariantImageUrl[item.id]}
                          alt=""
                          width={200}
                          height={160}
                          className="h-auto max-h-[120px] w-auto max-w-full object-contain md:max-h-[132px]"
                          sizes="(max-width:768px) 50vw, 220px"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new Event('apple-inquiry-open'))}
                        className="mt-3 inline-flex min-w-[4.5rem] max-w-[220px] shrink-0 items-center justify-center self-center rounded-full bg-[#0071e3] px-3.5 py-1 text-center text-[11px] font-semibold text-white shadow-sm transition-[background,transform] hover:bg-[#0077ed] active:scale-[0.97] md:min-w-[5rem] md:px-4 md:py-1.5 md:text-xs md:max-w-none"
                      >
                        {t.hero2Inquiry}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-10 w-full md:mt-12">
        {mainRows.map((row, rowIdx) => (
          <div
            key={`${rowIdx}-${row.label}`}
            className="border-t border-[#e8e8ed] py-6 first:border-t-0 first:pt-0 md:py-7"
          >
            <p className={rowSubhead}>{row.label}</p>
            <div className={valueGrid}>
              {selected.map((item, colIdx) => (
                <div key={item.id} className={`${valueCellClass(colIdx)} px-1`}>
                  <p className={`${valueText} whitespace-pre-line`}>{row.get(item)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="border-t border-[#d2d2d7] pt-8 md:pt-10">
          <p className={`${rowSubhead} mb-6 normal-case md:mb-8`}>{specLabels.axes[lang]}</p>
          {AXIS_ORDER.map((axisKey, axIdx) => (
            <div
              key={axisKey}
              className={`py-6 md:py-7 ${axIdx > 0 ? 'border-t border-[#e8e8ed]' : ''}`}
            >
              <p className={`${rowSubhead} normal-case`}>{specLabels.axisLabels[axisKey][lang]}</p>
              <div className={valueGrid}>
                {selected.map((item, colIdx) => {
                  const ax = item.axes[axisKey];
                  const txt = `${lang === 'zh' ? '范围' : 'Range'}: ${ax.range}\n${lang === 'zh' ? '最大角速度' : 'Max speed'}: ${ax.speed}`;
                  return (
                    <div key={item.id} className={`${valueCellClass(colIdx)} px-1`}>
                      <p className={`${valueText} whitespace-pre-line`}>{txt}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SelectorLineupCard({
  item,
  lang,
  t,
  index,
  onOpenDetail,
}: {
  item: LineItem;
  lang: 'zh' | 'en';
  t: CardCopy;
  index: number;
  onOpenDetail: () => void;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = shellRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const maxDeg = 5.5;
    setTilt({ rx: py * -maxDeg, ry: px * maxDeg * 1.4 });
  }, []);

  const onLeave = useCallback(() => setTilt({ rx: 0, ry: 0 }), []);

  const variantShort = lineupCardVariantShortName(item.name);
  const staggerMs = index * 180;

  return (
    <article
      className="selector-card-surface relative flex w-[min(92vw,408px)] shrink-0 snap-start flex-col overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white md:w-[428px]"
      style={{ ['--stagger' as string]: `${staggerMs}ms` }}
    >
      <div className="selector-card-scale-pulse flex min-h-0 flex-1 flex-col">
        <div
          ref={shellRef}
          className="selector-card-tilt flex min-h-0 flex-1 flex-col will-change-transform"
          style={{
            transform: `perspective(960px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transition: 'transform 0.18s ease-out',
          }}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
        <div
          className="selector-card-visual relative flex max-h-[320px] min-h-[260px] items-center justify-center md:min-h-[300px]"
          style={{
            backgroundColor: '#f5f5f7',
            backgroundImage:
              'linear-gradient(45deg, #e8e8ed 25%, transparent 25%), linear-gradient(-45deg, #e8e8ed 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e8ed 75%), linear-gradient(-45deg, transparent 75%, #e8e8ed 75%)',
            backgroundSize: '12px 12px',
            backgroundPosition: '0 0, 6px 6px, 6px -6px, -6px 0',
          }}
        >
          <div className="flex h-full w-full items-center justify-center px-8 pb-4 pt-10">
            <Image
              src={robotVariantImageUrl[item.id]}
              alt=""
              width={340}
              height={380}
              className="h-auto max-h-[260px] w-auto max-w-full object-contain md:max-h-[280px]"
              sizes="(max-width:768px) 92vw, 428px"
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-8 pb-8 pt-6 text-left">
          <h2 className="mb-3 text-[1.5625rem] font-semibold leading-tight tracking-[-0.02em] text-[#1d1d1f]">
            {item.family.displayName}
            {variantShort ? (
              <>
                <span className="font-normal text-[#86868b]"> · </span>
                <span className="text-[1.1875rem] font-medium text-[#1d1d1f]">{variantShort}</span>
              </>
            ) : null}
          </h2>
          <p className="mb-5 line-clamp-3 whitespace-pre-line text-[0.9375rem] leading-relaxed text-[#424245]">
            {selectorSummarizeBody(lang === 'zh' ? item.description.zh : item.description.en)}
          </p>
          <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3.5 text-[0.8125rem]">
            <div>
              <dt className="mb-0.5 font-medium text-[#86868b]">{t.payload}</dt>
              <dd className="font-semibold text-[#1d1d1f]">{item.payload}</dd>
            </div>
            <div>
              <dt className="mb-0.5 font-medium text-[#86868b]">{t.reach}</dt>
              <dd className="font-semibold text-[#1d1d1f]">{item.reach}</dd>
            </div>
            <div>
              <dt className="mb-0.5 font-medium text-[#86868b]">{t.repeatability}</dt>
              <dd className="font-semibold text-[#1d1d1f]">{item.repeatability}</dd>
            </div>
            <div>
              <dt className="mb-0.5 font-medium text-[#86868b]">{t.weight}</dt>
              <dd className="font-semibold text-[#1d1d1f]">{item.weight}</dd>
            </div>
          </dl>
          <div className="mt-auto flex justify-end pt-1">
            <button
              type="button"
              aria-label={
                lang === 'zh'
                  ? `查看 ${item.family.displayName}${variantShort ? ` ${variantShort}` : ''} 完整规格`
                  : `View full specifications for ${item.family.displayName}${variantShort ? ` ${variantShort}` : ''}`
              }
              onClick={onOpenDetail}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d2d2d7] bg-white text-[1.35rem] font-light leading-none text-[#1d1d1f] shadow-sm transition-colors hover:bg-[#f5f5f7] active:scale-95"
            >
              +
            </button>
          </div>
        </div>
        </div>
      </div>
    </article>
  );
}

function SpecRow({
  label,
  value,
  detail,
  multilineValue,
}: {
  label: string;
  value: string;
  detail?: boolean;
  multilineValue?: boolean;
}) {
  return (
    <div className="border-b border-black/[0.06] pb-3.5 last:border-0">
      <dt
        className={`mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#86868b]${detail ? ' sm:text-xs' : ''}`}
      >
        {label}
      </dt>
      <dd
        className={`font-medium leading-snug text-[#1d1d1f] text-[0.9375rem]${detail ? ' sm:text-[1.125rem] sm:leading-snug' : ''}${multilineValue ? ' whitespace-pre-line' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}
