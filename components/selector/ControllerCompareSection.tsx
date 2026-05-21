'use client';

import {
  ml,
  SELECTOR_LINEUP_I18N,
  type LineItem,
} from '@/components/selector/SelectorLineupUi';
import {
  controllerRecommendationForVariant,
  controllerSpecLabels,
  controllerSpecs,
  type ControllerRecommendation,
  type ControllerSpec,
} from '@/data/products';
import { EmphasizeSpecNumbers, specCellEmphasize } from '@/lib/emphasize-spec-numbers';

type Lang = 'zh' | 'en';

function alternateLine(rec: ControllerRecommendation & { kind: 'external' }, lang: Lang): string {
  const { alternate } = rec;
  return `${ml(alternate.name, lang)} — ${ml(alternate.powerSupply, lang)} · ${ml(alternate.weight, lang)}`;
}

function alternateId(rec: ControllerRecommendation | null): string | null {
  return rec?.kind === 'external' ? rec.alternate.id : null;
}

function integratedLabel(lang: Lang): string {
  return SELECTOR_LINEUP_I18N[lang].controllerIntegrated;
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

export function ControllerCompareSection({
  selected,
  lang,
}: {
  selected: LineItem[];
  lang: Lang;
}) {
  const t = SELECTOR_LINEUP_I18N[lang];
  const recs = selected.map((item) => controllerRecommendationForVariant(item.id));
  const hasExternal = recs.some((r) => r?.kind === 'external');

  if (!hasExternal && !recs.some((r) => r?.kind === 'integrated')) return null;

  const rowSubhead =
    'mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86868b] md:text-xs';
  const valueGrid = 'grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 md:gap-x-6';
  const valueText = 'text-[0.8125rem] font-medium leading-snug text-[#1d1d1f] md:text-[0.9375rem]';
  const valueCellClass = (colIndex: number) =>
    colIndex === 2 ? 'hidden text-center md:block' : 'text-center';

  const keyRows: { label: string; get: (primary: ControllerSpec) => string }[] = [
    { label: controllerSpecLabels.name[lang], get: (c) => ml(c.name, lang) },
    { label: controllerSpecLabels.powerSupply[lang], get: (c) => ml(c.powerSupply, lang) },
    { label: controllerSpecLabels.outputPower[lang], get: (c) => c.outputPower },
    { label: controllerSpecLabels.dimensions[lang], get: (c) => ml(c.dimensions, lang) },
    { label: controllerSpecLabels.weight[lang], get: (c) => ml(c.weight, lang) },
    { label: controllerSpecLabels.ip[lang], get: (c) => c.ip },
    { label: controllerSpecLabels.standardComm[lang], get: (c) => ml(c.standardComm, lang) },
    { label: controllerSpecLabels.sdk[lang], get: (c) => c.sdk },
    {
      label: lang === 'zh' ? '工作温湿度' : 'Temperature / humidity',
      get: (c) => `${c.temperature} · ${c.humidity}`,
    },
  ];

  const fullRows: { label: string; get: (primary: ControllerSpec) => string }[] = [
    { label: controllerSpecLabels.ioPorts[lang], get: (c) => ml(c.ioPorts, lang) },
    { label: controllerSpecLabels.ioPower[lang], get: (c) => c.ioPower },
    { label: controllerSpecLabels.optionalComm[lang], get: (c) => ml(c.optionalComm, lang) },
    { label: controllerSpecLabels.commBoard[lang], get: (c) => ml(c.commBoard, lang) },
    { label: controllerSpecLabels.materials[lang], get: (c) => ml(c.materials, lang) },
  ];

  const cellValue = (rec: ControllerRecommendation | null, rowIdx: number, get: (c: ControllerSpec) => string) => {
    if (!rec) return '—';
    if (rec.kind === 'integrated') return rowIdx === 0 ? integratedLabel(lang) : '—';
    return get(rec.primary);
  };

  const externalAlternateIds = recs
    .map((rec) => alternateId(rec))
    .filter((id): id is string => id !== null);
  const uniqueAlternateIds = new Set(externalAlternateIds);
  const unifiedAlternate =
    uniqueAlternateIds.size === 1 && externalAlternateIds.length > 0
      ? recs.find((rec): rec is ControllerRecommendation & { kind: 'external' } => rec?.kind === 'external')
      : null;
  const hasIntegratedSelection = recs.some((rec) => rec?.kind === 'integrated');
  const footnoteText =
    'text-[0.8125rem] leading-relaxed text-[#6e6e73] md:text-[0.9375rem]';

  return (
    <div className="border-t border-[#d2d2d7] pt-8 md:pt-10">
      <p className={`${rowSubhead} normal-case md:mb-2`}>{t.controllerSectionTitle}</p>
      {hasExternal ? (
        <p className="mb-6 max-w-[46rem] text-[0.8125rem] leading-relaxed text-[#6e6e73] md:mb-8 md:text-[0.9375rem]">
          {t.controllerSharedNote}
        </p>
      ) : null}

      {hasExternal
        ? keyRows.map((row, rowIdx) => {
            const values = recs.map((rec) => cellValue(rec, rowIdx, row.get));
            return (
              <div
                key={`ctrl-key-${rowIdx}-${row.label}`}
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
          })
        : null}

      {hasExternal && unifiedAlternate ? (
        <div className="border-t border-[#e8e8ed] py-6 md:py-7">
          <p className={footnoteText}>
            <span className="font-semibold text-[#1d1d1f]">{t.controllerAlternate}: </span>
            {alternateLine(unifiedAlternate, lang)}
          </p>
          {hasIntegratedSelection ? (
            <p className={`mt-2 ${footnoteText} text-[0.75rem] md:text-[0.8125rem]`}>
              {t.controllerAlternateIntegratedSkip}
            </p>
          ) : null}
        </div>
      ) : null}

      {hasExternal && !unifiedAlternate ? (
        <div className="border-t border-[#e8e8ed] py-6 md:py-7">
          <p className={rowSubhead}>{t.controllerAlternate}</p>
          <div className={valueGrid}>
            {recs.map((rec, colIdx) => {
              const value =
                rec?.kind === 'external' ? alternateLine(rec, lang) : integratedLabel(lang);
              return (
                <div key={selected[colIdx]?.id ?? colIdx} className={`${valueCellClass(colIdx)} px-1`}>
                  <p className={`${valueText} whitespace-pre-line`}>{value}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {!hasExternal ? (
        <div className="border-t border-[#e8e8ed] py-6 md:py-7">
          <p className={rowSubhead}>{controllerSpecLabels.name[lang]}</p>
          <div className={valueGrid}>
            {recs.map((rec, colIdx) => (
              <div key={selected[colIdx]?.id ?? colIdx} className={`${valueCellClass(colIdx)} px-1`}>
                <p className={valueText}>
                  {rec?.kind === 'integrated' ? integratedLabel(lang) : '—'}
                </p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-[46rem] px-1 text-center text-[0.75rem] leading-relaxed text-[#6e6e73] md:text-[0.8125rem]">
            {ml(controllerSpecs.noteIntegrated, lang)}
          </p>
        </div>
      ) : null}

      {hasExternal ? (
        <details className="group border-t border-[#e8e8ed] py-6 md:py-7">
          <summary className="cursor-pointer list-none text-[0.8125rem] font-semibold text-[#0071e3] marker:content-none md:text-[0.9375rem] [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block text-[0.625rem] transition-transform group-open:rotate-90"
                aria-hidden
              >
                ▶
              </span>
              {t.controllerFullSpecs}
            </span>
          </summary>
          <div className="mt-6 space-y-0">
            {fullRows.map((row, rowIdx) => {
              const values = recs.map((rec) => (rec?.kind === 'external' ? row.get(rec.primary) : '—'));
              return (
                <div
                  key={`ctrl-full-${rowIdx}-${row.label}`}
                  className="border-t border-[#e8e8ed] py-6 first:border-t-0 first:pt-0 md:py-7"
                >
                  <p className={rowSubhead}>{row.label}</p>
                  <div className={valueGrid}>
                    {values.map((value, colIdx) => (
                      <div
                        key={selected[colIdx]?.id ?? colIdx}
                        className={`${valueCellClass(colIdx)} px-1`}
                      >
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
        </details>
      ) : null}
    </div>
  );
}
