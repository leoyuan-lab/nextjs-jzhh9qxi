'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AXIS_ORDER,
  buildLineup,
  lineupCardVariantShortName,
  ml,
  SubjectFillPng,
  type LineItem,
  SELECTOR_LINEUP_I18N,
  stripIndustrialModelCodes,
} from '@/components/selector/SelectorLineupUi';
import { robotVariantImageAlt, robotVariantImageUrl, specLabels } from '@/data/products';
import { trackEvent } from '@/lib/analytics';
import { openInquiry } from '@/lib/open-inquiry';
import { useSiteLang } from '@/lib/site-lang-context';

type SelectorPageCopy = (typeof SELECTOR_LINEUP_I18N)[keyof typeof SELECTOR_LINEUP_I18N];

/** Hero2 默认：r‑Lite 标准、r‑Core 标准、r‑Max 16 */
const HERO2_DEFAULT_IDS: [string, string, string] = ['fr3-std', 'fr5-std', 'fr16-std'];
const SELECTOR_NAV_PIN_PX = 44;

function hero2SelectLabel(item: LineItem): string {
  const v = lineupCardVariantShortName(item.name);
  return v ? `${item.family.displayName} · ${v}` : item.family.displayName;
}

function openInquiryForModel(item: LineItem, lang: 'zh' | 'en') {
  const modelLabel = hero2SelectLabel(item);
  const body =
    lang === 'zh'
      ? `我想咨询以下机型：\n- ${modelLabel}\n\n请联系我并提供方案与报价。`
      : `I'm interested in this model:\n- ${modelLabel}\n\nPlease contact me with recommendation and quotation.`;
  openInquiry({ body, source: 'comparison' });
}

export default function SelectorComparisonPage() {
  const lang = useSiteLang();
  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const t = SELECTOR_LINEUP_I18N[safeLang];
  const lineup = useMemo(() => buildLineup(), []);

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
        <SelectorHero2ModelCompare lineup={lineup} lang={safeLang} t={t} />
      </div>
    </section>
  );
}

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
                          {hero2SelectLabel(opt)}
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
            <div key={axisKey} className={`py-6 md:py-7 ${axIdx > 0 ? 'border-t border-[#e8e8ed]' : ''}`}>
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
