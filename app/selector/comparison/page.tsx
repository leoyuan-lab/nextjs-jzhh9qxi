'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ControllerCompareSection } from '@/components/selector/ControllerCompareSection';
import {
  AXIS_ORDER,
  buildLineup,
  lineupCardVariantShortNameForItem,
  ml,
  SubjectFillPng,
  type LineItem,
  SELECTOR_LINEUP_I18N,
  stripIndustrialModelCodes,
} from '@/components/selector/SelectorLineupUi';
import { robotSpecDisplayText, robotSpecEnvironmentText, robotVariantImageAlt, robotVariantImageUrl, specLabels } from '@/data/products';
import { trackEvent } from '@/lib/analytics';
import {
  compareIdsFromSearchParams,
  defaultCompareSlotIds,
  writeCompareIdsToUrl,
  type CompareSlotIds,
} from '@/lib/comparison-selection';
import { EmphasizeSpecNumbers, specCellEmphasize } from '@/lib/emphasize-spec-numbers';
import { openInquiry } from '@/lib/open-inquiry';
import { useSiteLang } from '@/lib/site-lang-context';

type SelectorPageCopy = (typeof SELECTOR_LINEUP_I18N)[keyof typeof SELECTOR_LINEUP_I18N];

const HERO2_DEFAULT_IDS: CompareSlotIds = ['fr3-std', 'fr5-std', 'fr16-std'];
const SELECTOR_NAV_PIN_PX = 44;

function hero2SelectLabel(item: LineItem, lang: 'zh' | 'en'): string {
  const v = lineupCardVariantShortNameForItem(item, lang);
  return v ? `${item.family.displayName} · ${v}` : item.family.displayName;
}

function openInquiryForModel(item: LineItem, lang: 'zh' | 'en') {
  const modelLabel = hero2SelectLabel(item, lang);
  const body =
    lang === 'zh'
      ? `我想咨询以下机型：\n- ${modelLabel}\n\n请联系我并提供方案与报价。`
      : `I'm interested in this model:\n- ${modelLabel}\n\nPlease contact me with recommendation and quotation.`;
  openInquiry({ body, source: 'comparison' });
}

function CompareValue({
  text,
  emphasize,
  className,
}: {
  text: string;
  emphasize: boolean;
  className: string;
}) {
  return (
    <p className={`${className} whitespace-pre-line`}>
      <EmphasizeSpecNumbers text={text} emphasize={emphasize} />
    </p>
  );
}

export default function SelectorComparisonPage() {
  return (
    <Suspense fallback={null}>
      <SelectorComparisonPageContent />
    </Suspense>
  );
}

function SelectorComparisonPageContent() {
  const lang = useSiteLang();
  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const t = SELECTOR_LINEUP_I18N[safeLang];
  const lineup = useMemo(() => buildLineup(), []);
  const searchParams = useSearchParams();
  const lineupIds = useMemo(() => lineup.map((item) => item.id), [lineup]);

  useEffect(() => {
    trackEvent('selector_view', { selector: 'comparison', locale: safeLang });
    window.dispatchEvent(new CustomEvent('roooll-main-nav-progress', { detail: { progress: 0 } }));
    return () => {
      window.dispatchEvent(new CustomEvent('roooll-main-nav-progress', { detail: { progress: 0 } }));
    };
  }, [safeLang]);

  return (
    <section className="selector-hero2 border-t border-[#d2d2d7]/80 bg-[#f5f5f7] text-[#1d1d1f]" aria-labelledby="selector-hero2-title">
      <div className="mx-auto w-full max-w-[var(--roooll-w,1024px)] px-[22px] pb-16 pt-10 md:pb-24 md:pt-12">
        <h1
          id="selector-hero2-title"
          className="mb-3 max-w-[52rem] text-[2rem] font-semibold leading-[1.07] tracking-[-0.03em] text-[#1d1d1f] md:text-[2.75rem]"
        >
          {t.hero2Title}
        </h1>
        <p className="mb-5 max-w-[46rem] text-[1.0625rem] leading-snug text-[#6e6e73] md:mb-6 md:text-[1.1875rem]">
          {t.hero2Subtitle}
        </p>
        <SelectorHero2ModelCompare
          lineup={lineup}
          lineupIds={lineupIds}
          searchParams={searchParams}
          lang={safeLang}
          t={t}
        />
      </div>
    </section>
  );
}

function SelectorHero2ModelCompare({
  lineup,
  lineupIds,
  searchParams,
  lang,
  t,
}: {
  lineup: LineItem[];
  lineupIds: readonly string[];
  searchParams: ReturnType<typeof useSearchParams>;
  lang: 'zh' | 'en';
  t: SelectorPageCopy;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [shellH, setShellH] = useState(0);
  const lastPinEventRef = useRef<boolean | null>(null);

  const [ids, setIds] = useState<CompareSlotIds>(() => {
    const fromUrl = compareIdsFromSearchParams(new URLSearchParams(searchParams.toString()), lineupIds);
    return fromUrl ?? defaultCompareSlotIds(lineupIds, HERO2_DEFAULT_IDS);
  });

  const selected = ids.map((id) => lineup.find((x) => x.id === id)).filter(Boolean) as LineItem[];

  useEffect(() => {
    const fromUrl = compareIdsFromSearchParams(searchParams, lineupIds);
    if (!fromUrl) return;
    setIds((prev) => (prev[0] === fromUrl[0] && prev[1] === fromUrl[1] && prev[2] === fromUrl[2] ? prev : fromUrl));
  }, [lineupIds, searchParams]);

  useEffect(() => {
    writeCompareIdsToUrl(ids);
  }, [ids]);

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
      const next: CompareSlotIds = [...prev] as CompareSlotIds;
      next[index] = id;
      return next;
    });
  };

  const rowSubhead =
    'mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86868b] md:text-xs';
  const valueGrid = 'grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 md:gap-x-6';
  const valueText = 'text-[0.8125rem] font-medium leading-snug text-[#1d1d1f] md:text-[0.9375rem]';
  const valueCellClass = (colIndex: number) =>
    colIndex === 2 ? 'hidden text-center md:block' : 'text-center';

  const mainRows: { label: string; get: (i: LineItem) => string }[] = [
    { label: specLabels.payload[lang], get: (i) => robotSpecDisplayText(i.payload, lang) },
    { label: specLabels.reach[lang], get: (i) => robotSpecDisplayText(i.reach, lang) },
    { label: specLabels.repeatability[lang], get: (i) => robotSpecDisplayText(i.repeatability, lang) },
    { label: specLabels.weight[lang], get: (i) => robotSpecDisplayText(i.weight, lang) },
    { label: t.dof, get: (i) => i.dof },
    { label: specLabels.ip[lang], get: (i) => robotSpecDisplayText(i.ipRating, lang) },
    {
      label: specLabels.power[lang],
      get: (i) => robotSpecDisplayText(`${i.avgPower} / ${i.peakPower}`, lang),
    },
    { label: specLabels.tcpSpeed[lang], get: (i) => robotSpecDisplayText(i.tcpSpeed, lang) },
    { label: specLabels.voltage[lang], get: (i) => robotSpecDisplayText(i.voltage, lang) },
    { label: t.noise, get: (i) => robotSpecDisplayText(i.noise, lang) },
    { label: t.mounting, get: (i) => ml(i.mounting, lang) },
    {
      label: specLabels.environment[lang],
      get: (i) => robotSpecEnvironmentText(i.temperature, i.humidity, lang),
    },
    { label: specLabels.footprint[lang], get: (i) => robotSpecDisplayText(i.footprint, lang) },
    { label: specLabels.io[lang], get: (i) => robotSpecDisplayText(i.ioPorts, lang) },
    { label: lang === 'zh' ? '工具电源' : 'Tool power', get: (i) => robotSpecDisplayText(i.toolPower, lang) },
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
            ? 'fixed left-0 right-0 top-0 z-[10000] border-b border-black/[0.08] bg-[#f5f5f7]/92 pb-3 pt-[max(env(safe-area-inset-top),10px)] shadow-[0_2px_16px_rgba(0,0,0,0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-[#f5f5f7]/80'
            : 'relative z-[1]'
        }
      >
        <div ref={measureRef} className="mx-auto w-full max-w-[var(--roooll-w,1024px)] px-[22px]">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73] md:text-xs">
            {t.hero2ChooseModel}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-0">
            {([0, 1, 2] as const).map((slot) => {
              const item = lineup.find((x) => x.id === ids[slot]);
              const ariaPick = `${t.hero2ChooseModel} ${slot + 1}`;
              return (
                <div key={slot} className={slot === 2 ? 'hidden flex-col md:flex' : 'flex flex-col'}>
                  <select
                    id={`selector-compare-model-${slot}`}
                    name={`selector_compare_model_${slot}`}
                    autoComplete="off"
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
                          {hero2SelectLabel(opt, lang)}
                        </option>
                      );
                    })}
                  </select>
                  {item ? (
                    <div className="mt-5 flex flex-col items-center md:mt-6 md:items-stretch">
                      <div className="flex h-[152px] w-full max-w-[260px] items-center justify-center md:h-[176px] md:max-w-none">
                        <SubjectFillPng
                          src={robotVariantImageUrl[item.id]}
                          alt={robotVariantImageAlt(item.id, lang)}
                          fit="contain"
                          autoTransparentBg
                          cropToSubject={false}
                          hideUntilProcessed
                          className="h-[96%] w-[96%]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => openInquiryForModel(item, lang)}
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
        {mainRows.map((row, rowIdx) => {
          const values = selected.map((item) => row.get(item));
          return (
            <div
              key={`${rowIdx}-${row.label}`}
              className="border-t border-[#e8e8ed] py-6 first:border-t-0 first:pt-0 md:py-7"
            >
              <p className={rowSubhead}>{row.label}</p>
              <div className={valueGrid}>
                {values.map((value, colIdx) => (
                  <div key={selected[colIdx]?.id ?? colIdx} className={`${valueCellClass(colIdx)} px-1`}>
                    <CompareValue
                      text={value}
                      emphasize={specCellEmphasize(values, colIdx)}
                      className={valueText}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="border-t border-[#d2d2d7] pt-8 md:pt-10">
          <p className={`${rowSubhead} mb-6 normal-case md:mb-8`}>{specLabels.axes[lang]}</p>
          {AXIS_ORDER.map((axisKey, axIdx) => {
            const values = selected.map((item) => {
              const ax = item.axes[axisKey];
              const range = robotSpecDisplayText(ax.range, lang);
              const speed = robotSpecDisplayText(ax.speed, lang);
              return `${lang === 'zh' ? '范围' : 'Range'}: ${range}\n${lang === 'zh' ? '最大角速度' : 'Max speed'}: ${speed}`;
            });
            return (
              <div key={axisKey} className={`py-6 md:py-7 ${axIdx > 0 ? 'border-t border-[#e8e8ed]' : ''}`}>
                <p className={`${rowSubhead} normal-case`}>{specLabels.axisLabels[axisKey][lang]}</p>
                <div className={valueGrid}>
                  {values.map((value, colIdx) => (
                    <div key={selected[colIdx]?.id ?? colIdx} className={`${valueCellClass(colIdx)} px-1`}>
                      <CompareValue
                        text={value}
                        emphasize={specCellEmphasize(values, colIdx)}
                        className={valueText}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <ControllerCompareSection selected={selected} lang={lang} />
      </div>
    </div>
  );
}
