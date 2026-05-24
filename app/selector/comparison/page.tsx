'use client';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import { trackEvent, trackCtaClick } from '@/lib/analytics';
import {
  compareIdsFromSearchParams,
  defaultCompareSlotIds,
  writeCompareIdsToUrl,
  type CompareSlotIds,
} from '@/lib/comparison-selection';
import { EmphasizeSpecNumbers, specCellEmphasize } from '@/lib/emphasize-spec-numbers';
import { getMessages } from '@/lib/messages';
import { openInquiry } from '@/lib/open-inquiry';
import { PIN_SHELL_OFF_PX, PIN_SHELL_ON_PX, preserveScrollOnLayoutShift } from '@/lib/pinned-shell-scroll';
import { useSiteLang } from '@/lib/site-lang-context';

type SelectorPageCopy = (typeof SELECTOR_LINEUP_I18N)[keyof typeof SELECTOR_LINEUP_I18N];
type CompareExitCopy = { title: string; summary: string; cta: string };

const HERO2_DEFAULT_IDS: CompareSlotIds = ['fr3-std', 'fr5-std', 'fr16-std'];

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

function compareSpecValueClass(emphasize: boolean): string {
  return emphasize
    ? 'selector-compare-spec-value selector-compare-spec-value--diff'
    : 'selector-compare-spec-value';
}

function CompareValue({
  text,
  emphasize,
}: {
  text: string;
  emphasize: boolean;
}) {
  return (
    <p className={`${compareSpecValueClass(emphasize)} whitespace-pre-line`}>
      <EmphasizeSpecNumbers text={text} emphasize={emphasize} />
    </p>
  );
}

function CompareExitBand({ lang, footer }: { lang: 'zh' | 'en'; footer: CompareExitCopy }) {
  return (
    <aside className="selector-compare-exit-band" aria-labelledby="selector-compare-exit-title">
      <div className="selector-compare-exit-band__inner">
        <h2 id="selector-compare-exit-title" className="selector-journey-duo-title">
          {footer.title}
        </h2>
        <p className="selector-journey-duo-summary">{footer.summary}</p>
        <Link
          href={`/${lang}/selector/advisor`}
          className="selector-journey-duo-link"
          onClick={() => trackCtaClick('compare_footer_advisor')}
        >
          {footer.cta}
          <span aria-hidden> ›</span>
        </Link>
      </div>
    </aside>
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
  const pageCopy = getMessages(safeLang).pages.selector_comparison;
  const lineup = useMemo(() => buildLineup(), []);
  const searchParams = useSearchParams();
  const lineupIds = useMemo(() => lineup.map((item) => item.id), [lineup]);

  useEffect(() => {
    trackEvent('selector_view', { selector: 'comparison', locale: safeLang });
  }, [safeLang]);

  useEffect(() => {
    const emit = (progress: number) => {
      window.dispatchEvent(new CustomEvent('roooll-main-nav-progress', { detail: { progress } }));
    };
    const onScroll = () => {
      emit(Math.min(1, window.scrollY / 36));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      emit(0);
    };
  }, []);

  return (
    <section className="selector-hero2 border-t border-[#d2d2d7]/80 bg-[#f5f5f7] text-[#1d1d1f]" aria-labelledby="selector-hero2-title">
      <div className="selector-hero2-head roooll-page-hero-top mx-auto w-full max-w-[var(--roooll-w,1024px)] px-[22px] pb-10 md:pb-14">
        <h1
          id="selector-hero2-title"
          className="roooll-page-hero-title max-w-[52rem]"
        >
          {pageCopy.headlineLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <SelectorHero2ModelCompare
          lineup={lineup}
          lineupIds={lineupIds}
          searchParams={searchParams}
          lang={safeLang}
          t={t}
          sections={pageCopy.sections}
        />
      </div>
      <CompareExitBand lang={safeLang} footer={pageCopy.footer} />
    </section>
  );
}

type CompareSpecRow = { label: string; get: (i: LineItem) => string };

function CompareSpecRowList({
  rows,
  selected,
  valueGrid,
  valueCellClass,
}: {
  rows: CompareSpecRow[];
  selected: LineItem[];
  valueGrid: string;
  valueCellClass: (colIndex: number) => string;
}) {
  return (
    <div className="selector-compare-spec-list">
      {rows.map((row, rowIdx) => {
        const values = selected.map((item) => row.get(item));
        return (
          <div key={`${rowIdx}-${row.label}`} className="selector-compare-spec-row">
            <p className="selector-compare-spec-label">{row.label}</p>
            <div className={valueGrid}>
              {values.map((value, colIdx) => (
                <div key={selected[colIdx]?.id ?? colIdx} className={`${valueCellClass(colIdx)} px-1`}>
                  <CompareValue text={value} emphasize={specCellEmphasize(values, colIdx)} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CompareSpecSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <details
      className="selector-compare-section group"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="selector-compare-section__summary">
        <span className="selector-compare-section__chevron" aria-hidden>
          ›
        </span>
        <span className="selector-compare-section__title">{title}</span>
      </summary>
      <div className="selector-compare-section__body">{children}</div>
    </details>
  );
}

function SelectorHero2ModelCompare({
  lineup,
  lineupIds,
  searchParams,
  lang,
  t,
  sections,
}: {
  lineup: LineItem[];
  lineupIds: readonly string[];
  searchParams: ReturnType<typeof useSearchParams>;
  lang: 'zh' | 'en';
  t: SelectorPageCopy;
  sections: { cobotSpecs: string; controlCabinet: string };
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(false);
  const [pinned, setPinned] = useState(false);
  const [shellH, setShellH] = useState(0);

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
    const updatePinned = (nextPinned: boolean) => {
      if (pinnedRef.current === nextPinned) return;
      preserveScrollOnLayoutShift(sentinelRef.current, () => {
        pinnedRef.current = nextPinned;
        setPinned(nextPinned);
      });
    };

    const tick = () => {
      const s = sentinelRef.current;
      if (!s) return;
      const top = s.getBoundingClientRect().top;
      if (!pinnedRef.current && top <= PIN_SHELL_ON_PX) {
        updatePinned(true);
        return;
      }
      if (pinnedRef.current && top > PIN_SHELL_OFF_PX) {
        updatePinned(false);
      }
    };

    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    return () => {
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
    };
  }, []);

  const setSlot = (index: 0 | 1 | 2, id: string) => {
    setIds((prev) => {
      const next: CompareSlotIds = [...prev] as CompareSlotIds;
      next[index] = id;
      return next;
    });
  };

  const valueGrid = 'grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 md:gap-x-6';
  const valueCellClass = (colIndex: number) =>
    colIndex === 2 ? 'hidden text-center md:block' : 'text-center';

  const cobotRows: CompareSpecRow[] = [
    { label: specLabels.payload[lang], get: (i) => robotSpecDisplayText(i.payload, lang) },
    { label: specLabels.reach[lang], get: (i) => robotSpecDisplayText(i.reach, lang) },
    { label: specLabels.repeatability[lang], get: (i) => robotSpecDisplayText(i.repeatability, lang) },
    { label: specLabels.weight[lang], get: (i) => robotSpecDisplayText(i.weight, lang) },
    { label: specLabels.tcpSpeed[lang], get: (i) => robotSpecDisplayText(i.tcpSpeed, lang) },
    { label: t.dof, get: (i) => i.dof },
    { label: specLabels.ip[lang], get: (i) => robotSpecDisplayText(i.ipRating, lang) },
    {
      label: specLabels.power[lang],
      get: (i) => robotSpecDisplayText(`${i.avgPower} / ${i.peakPower}`, lang),
    },
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

  const rowListProps = {
    selected,
    valueGrid,
    valueCellClass,
  };

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
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-0">
            {([0, 1, 2] as const).map((slot) => {
              const item = lineup.find((x) => x.id === ids[slot]);
              const ariaPick = lang === 'zh' ? `第 ${slot + 1} 款对比机型` : `Comparison model ${slot + 1}`;
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

      <div
        className="mt-10 w-full md:mt-12"
        role="region"
        aria-label={
          lang === 'zh'
            ? 'r 系列协作机器人规格对比表：负载、臂展、关节轴与控制箱'
            : 'r-Series Cobot specification comparison: payload, reach, joint axes, and control cabinets'
        }
      >
        <CompareSpecSection title={sections.cobotSpecs} defaultOpen>
          <CompareSpecRowList rows={cobotRows} {...rowListProps} />

          <p className="selector-compare-spec-group">{specLabels.axes[lang]}</p>
          <div className="selector-compare-spec-list">
            {AXIS_ORDER.map((axisKey) => {
              const values = selected.map((item) => {
                const ax = item.axes[axisKey];
                const range = robotSpecDisplayText(ax.range, lang);
                const speed = robotSpecDisplayText(ax.speed, lang);
                return `${lang === 'zh' ? '范围' : 'Range'}: ${range}\n${lang === 'zh' ? '最大角速度' : 'Max speed'}: ${speed}`;
              });
              return (
                <div key={axisKey} className="selector-compare-spec-row">
                  <p className="selector-compare-spec-label">{specLabels.axisLabels[axisKey][lang]}</p>
                  <div className={valueGrid}>
                    {values.map((value, colIdx) => (
                      <div key={selected[colIdx]?.id ?? colIdx} className={`${valueCellClass(colIdx)} px-1`}>
                      <CompareValue text={value} emphasize={specCellEmphasize(values, colIdx)} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CompareSpecSection>

        <CompareSpecSection title={sections.controlCabinet}>
          <ControllerCompareSection selected={selected} lang={lang} embedded />
        </CompareSpecSection>
      </div>
    </div>
  );
}
