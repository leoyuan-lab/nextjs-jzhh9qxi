'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  HorizontalScrollDots,
  scrollHorizontalSnapItem,
  useHorizontalScrollIndex,
} from '@/components/HorizontalScrollDots';
import { rCoreFullSpecRows, rCoreWheelRows, type RCoreSpecRowKey } from '@/lib/rcore-lite-specs';
import {
  R_CORE_LITE_VARIANT_IDS,
  type RCoreLiteVariantId,
} from '@/lib/rcore-lite-page-config';

type SpecsCopy = {
  kicker: string;
  title: string;
  variantTabsAria: string;
  variants: Record<RCoreLiteVariantId, string>;
  spotlightAria: string;
  specPrev: string;
  specNext: string;
  specProgress: string;
  specProgressAria: string;
  specDotsLabel: string;
  fullTableTitle: string;
  fullTableToggleExpand: string;
  fullTableToggleCollapse: string;
  viewAllModels: string;
  viewVariantDetail: string;
  rows: Record<RCoreSpecRowKey, string>;
  controllerIntegrated: string;
  controllerExternal: string;
};

export type RCoreSpecSectionProps = {
  lang: 'zh' | 'en';
  copy: SpecsCopy;
  variantId: RCoreLiteVariantId;
  onVariantChange: (id: RCoreLiteVariantId) => void;
};

type RowVisualStyle = {
  opacity: number;
  transform: string;
  filter: string;
};

/** Must match `.rcore-lite-spec-focus__row { height }` in globals.css */
const SPEC_FOCUS_ROW_HEIGHT_PX = 60;

function rowFocusStyle(offsetPx: number, reduceMotion: boolean): RowVisualStyle {
  const step = Math.max(SPEC_FOCUS_ROW_HEIGHT_PX * 0.82, 44);
  const dist = Math.abs(offsetPx) / step;
  const t = Math.min(dist, 3.6) / 3.6;
  const opacity = Math.max(0.16, 1 - t * 0.8);
  const scale = 1 - t * 0.13;
  const blur = reduceMotion ? 0 : t * 3.8;
  return {
    opacity,
    transform: `scale(${scale.toFixed(3)})`,
    filter: blur >= 0.35 ? `blur(${blur.toFixed(2)}px)` : 'none',
  };
}

function scrollFocusRowToCenter(
  scroller: HTMLElement | null,
  row: HTMLElement | null,
) {
  if (!scroller || !row) return;
  const target = row.offsetTop - (scroller.clientHeight - row.offsetHeight) / 2;
  scroller.scrollTo({ top: target, behavior: 'smooth' });
}

function RCoreSpecFocusList({
  copy,
  variantId,
  rows,
  rowLabels,
}: {
  copy: SpecsCopy;
  variantId: RCoreLiteVariantId;
  rows: ReturnType<typeof rCoreWheelRows>;
  rowLabels: Record<RCoreSpecRowKey, string>;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const syncRafRef = useRef<number | null>(null);
  const [rowStyles, setRowStyles] = useState<RowVisualStyle[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const syncFocus = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const centerY = scroller.scrollTop + scroller.clientHeight / 2;
    let closest = 0;
    let closestDist = Number.POSITIVE_INFINITY;
    const nextStyles = rows.map((_, i) => {
      const el = rowRefs.current[i];
      if (!el) return { opacity: 0.35, transform: 'scale(0.92)', filter: 'none' };
      const offset = el.offsetTop + SPEC_FOCUS_ROW_HEIGHT_PX / 2 - centerY;
      const dist = Math.abs(offset);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
      return rowFocusStyle(offset, reduceMotion);
    });
    setRowStyles(nextStyles);
    setActiveIndex((prev) => (prev === closest ? prev : closest));
  }, [rows, reduceMotion]);

  const scheduleSyncFocus = useCallback(() => {
    if (syncRafRef.current != null) return;
    syncRafRef.current = requestAnimationFrame(() => {
      syncRafRef.current = null;
      syncFocus();
    });
  }, [syncFocus]);

  useEffect(() => {
    syncFocus();
  }, [syncFocus, variantId]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;
    scroller.scrollTop = 0;
    syncFocus();
  }, [variantId, syncFocus]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;
    const onScroll = () => scheduleSyncFocus();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (syncRafRef.current != null) {
        cancelAnimationFrame(syncRafRef.current);
        syncRafRef.current = null;
      }
    };
  }, [scheduleSyncFocus]);

  const scrollByRow = useCallback(
    (direction: -1 | 1) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      scroller.scrollBy({ top: direction * SPEC_FOCUS_ROW_HEIGHT_PX, behavior: 'smooth' });
    },
    [],
  );

  return (
    <div className="rcore-lite-spec-focus" aria-label={copy.spotlightAria}>
      <div className="rcore-lite-spec-focus__card">
        <div className="rcore-lite-spec-focus__fade rcore-lite-spec-focus__fade--top" aria-hidden />
        <div className="rcore-lite-spec-focus__fade rcore-lite-spec-focus__fade--bottom" aria-hidden />

        <div className="rcore-lite-spec-focus__shell">
          <div
            ref={scrollerRef}
            className="rcore-lite-spec-focus__scroller"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                scrollByRow(1);
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                scrollByRow(-1);
              }
            }}
          >
            <div className="rcore-lite-spec-focus__pad" aria-hidden />
            {rows.map((row, i) => (
              <div
                key={`${variantId}-${row.key}`}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className={`rcore-lite-spec-focus__row${activeIndex === i ? ' is-active' : ''}`}
                style={rowStyles[i]}
              >
                <span className="rcore-lite-spec-focus__label">{rowLabels[row.key]}</span>
                <span className="rcore-lite-spec-focus__value">{row.value}</span>
              </div>
            ))}
            <div className="rcore-lite-spec-focus__pad" aria-hidden />
          </div>
        </div>

        <HorizontalScrollDots
          count={rows.length}
          activeIndex={activeIndex}
          label={copy.specDotsLabel}
          onSelect={(index) =>
            scrollFocusRowToCenter(scrollerRef.current, rowRefs.current[index] ?? null)
          }
        />
      </div>
    </div>
  );
}

export function RCoreSpecSection({
  lang,
  copy,
  variantId,
  onVariantChange,
  layout = 'default',
}: RCoreSpecSectionProps & { layout?: 'default' | 'wide' }) {
  const [tableOpen, setTableOpen] = useState(true);

  const rowLabels = useMemo(
    () => ({
      ...copy.rows,
      controllerIntegrated: copy.controllerIntegrated,
      controllerExternal: copy.controllerExternal,
    }),
    [copy],
  );

  const focusRows = useMemo(
    () => rCoreWheelRows(variantId, rowLabels, lang),
    [variantId, rowLabels, lang],
  );
  const fullRows = useMemo(
    () => rCoreFullSpecRows(variantId, lang, copy.variants[variantId]),
    [variantId, lang, copy.variants],
  );

  return (
    <section
      className={`rcore-lite-specs${layout === 'wide' ? ' rcore-lite-specs--wide rcore-lite-tail-container' : ''}`}
      aria-labelledby="rcore-lite-specs-title"
    >
      <div className="rcore-lite-specs__head">
        <h2 id="rcore-lite-specs-title" className="rcore-lite-section-title">
          {copy.title}
        </h2>
      </div>

      <div className="rcore-lite-specs__tabs" role="tablist" aria-label={copy.variantTabsAria}>
        {R_CORE_LITE_VARIANT_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={variantId === id}
            className={`rcore-lite-specs__tab${variantId === id ? ' is-active' : ''}`}
            onClick={() => onVariantChange(id)}
          >
            {copy.variants[id]}
          </button>
        ))}
      </div>

      <RCoreSpecFocusList
        copy={copy}
        variantId={variantId}
        rows={focusRows}
        rowLabels={rowLabels}
      />

      <div className="rcore-lite-specs__actions">
        <button
          type="button"
          className="rcore-lite-specs__table-toggle"
          aria-expanded={tableOpen}
          onClick={() => setTableOpen((o) => !o)}
        >
          {tableOpen ? copy.fullTableToggleCollapse : copy.fullTableToggleExpand}
        </button>
      </div>

      <div
        className={`rcore-lite-spec-table${tableOpen ? ' is-open' : ''}`}
        id="rcore-lite-full-spec-table"
        hidden={!tableOpen}
      >
        <table className="rcore-lite-spec-table__grid">
          <tbody>
            {fullRows.map((row) => (
              <tr key={`${variantId}-${row.label}`}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type FeaturesCopy = {
  kicker: string;
  title: string;
  items: { title: string; body: string }[];
};

export function RCoreFeaturesSection({
  lang,
  copy,
}: {
  lang: 'zh' | 'en';
  copy: FeaturesCopy;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const snapRefs = useRef<(HTMLElement | null)[]>([]);
  const dotIndex = useHorizontalScrollIndex(scrollerRef, () => snapRefs.current);

  return (
    <section className="rcore-lite-features" aria-labelledby="rcore-lite-features-title">
      <div className="rcore-lite-features__head">
        <h2 id="rcore-lite-features-title" className="rcore-lite-section-title">
          {copy.title}
        </h2>
      </div>

      <div className="rcore-lite-features__desktop">
        {copy.items.map((item) => (
          <article key={item.title} className="rcore-lite-feature-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>

      <div className="rcore-lite-features__mobile">
        <div
          ref={scrollerRef}
          className="rcore-lite-features__scroller roooll-hscroll"
          aria-label={lang === 'zh' ? 'r-Core 特点列表' : 'r-Core feature highlights'}
        >
          {copy.items.map((item, i) => (
            <article
              key={item.title}
              ref={(el) => {
                snapRefs.current[i] = el;
              }}
              className="rcore-lite-feature-card rcore-lite-feature-card--snap"
            >
              <span className="rcore-lite-feature-card__index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <HorizontalScrollDots
          count={copy.items.length}
          activeIndex={dotIndex}
          label={lang === 'zh' ? '特点分页' : 'Feature pages'}
          onSelect={(index) =>
            scrollHorizontalSnapItem(scrollerRef.current, snapRefs.current[index] ?? null, 'center')
          }
        />
      </div>
    </section>
  );
}
