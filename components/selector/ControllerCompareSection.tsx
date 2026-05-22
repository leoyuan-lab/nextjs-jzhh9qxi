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

export function ControllerCompareSection({
  selected,
  lang,
  embedded = false,
}: {
  selected: LineItem[];
  lang: Lang;
  embedded?: boolean;
}) {
  const t = SELECTOR_LINEUP_I18N[lang];
  const recs = selected.map((item) => controllerRecommendationForVariant(item.id));
  const hasExternal = recs.some((r) => r?.kind === 'external');

  if (!hasExternal && !recs.some((r) => r?.kind === 'integrated')) return null;

  const valueGrid = 'grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 md:gap-x-6';
  const valueCellClass = (colIndex: number) =>
    colIndex === 2 ? 'hidden text-center md:block' : 'text-center';

  const externalRows: { label: string; get: (primary: ControllerSpec) => string }[] = [
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

  return (
    <div className={embedded ? '' : 'border-t border-[#d2d2d7] pt-8 md:pt-10'}>
      {!embedded ? (
        <p className="selector-compare-spec-group !mt-0 !border-t-0 !pt-0">{t.controllerSectionTitle}</p>
      ) : null}
      {hasExternal ? (
        <p className="selector-compare-spec-footnote mb-4 max-w-[46rem] md:mb-5">{t.controllerSharedNote}</p>
      ) : null}

      <div className="selector-compare-spec-list">
        {hasExternal
          ? externalRows.map((row, rowIdx) => {
              const values = recs.map((rec) => cellValue(rec, rowIdx, row.get));
              return (
                <div key={`ctrl-${rowIdx}-${row.label}`} className="selector-compare-spec-row">
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
            })
          : null}

        {hasExternal && unifiedAlternate ? (
          <div className="selector-compare-spec-row">
            <p className="selector-compare-spec-footnote">
              <span className="font-semibold text-[#1d1d1f]">{t.controllerAlternate}: </span>
              {alternateLine(unifiedAlternate, lang)}
            </p>
            {hasIntegratedSelection ? (
              <p className="selector-compare-spec-footnote mt-2 text-[0.75rem] md:text-[0.8125rem]">
                {t.controllerAlternateIntegratedSkip}
              </p>
            ) : null}
          </div>
        ) : null}

        {hasExternal && !unifiedAlternate ? (
          <div className="selector-compare-spec-row">
            <p className="selector-compare-spec-label">{t.controllerAlternate}</p>
            <div className={valueGrid}>
              {recs.map((rec, colIdx) => {
                const value =
                  rec?.kind === 'external' ? alternateLine(rec, lang) : integratedLabel(lang);
                return (
                  <div key={selected[colIdx]?.id ?? colIdx} className={`${valueCellClass(colIdx)} px-1`}>
                    <p className="selector-compare-spec-value whitespace-pre-line">{value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {!hasExternal ? (
          <div className="selector-compare-spec-row">
            <p className="selector-compare-spec-label">{controllerSpecLabels.name[lang]}</p>
            <div className={valueGrid}>
              {recs.map((rec, colIdx) => (
                <div key={selected[colIdx]?.id ?? colIdx} className={`${valueCellClass(colIdx)} px-1`}>
                  <p className="selector-compare-spec-value">
                    {rec?.kind === 'integrated' ? integratedLabel(lang) : '—'}
                  </p>
                </div>
              ))}
            </div>
            <p className="selector-compare-spec-footnote selector-compare-spec-footnote--center">
              {ml(controllerSpecs.noteIntegrated, lang)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
