'use client';

import Image from 'next/image';
import { useCallback, useRef } from 'react';
import {
  HorizontalScrollDots,
  scrollHorizontalSnapItem,
  useHorizontalScrollIndex,
} from '@/components/HorizontalScrollDots';
import {
  accessoryItemsByLane,
  accessorySpecValue,
  accessoryLaneSectionId,
  type AccessoryCatalogItem,
  type AccessoryLaneId,
} from '@/lib/accessories-catalog';
import { openInquiry } from '@/lib/open-inquiry';

export type AccessoryLaneCopy = {
  expandSpecs: string;
  inquiry: string;
  lanes: Record<AccessoryLaneId, { title: string; aria: string; note?: string }>;
};

function openInquiryForAccessory(item: AccessoryCatalogItem, lang: 'zh' | 'en') {
  const name = lang === 'zh' ? item.name.zh : item.name.en;
  const body =
    lang === 'zh'
      ? `我想咨询以下配件：\n- ${name}\n\n请联系我并提供方案与报价。`
      : `I'm interested in this accessory:\n- ${name}\n\nPlease contact me with recommendation and quotation.`;
  openInquiry({ body, source: 'accessories' });
}

function AccessoryCard({
  item,
  lang,
  copy,
  cardRef,
  onLayoutChange,
}: {
  item: AccessoryCatalogItem;
  lang: 'zh' | 'en';
  copy: AccessoryLaneCopy;
  cardRef?: (el: HTMLElement | null) => void;
  onLayoutChange?: () => void;
}) {
  const name = lang === 'zh' ? item.name.zh : item.name.en;
  const summary = lang === 'zh' ? item.summary.zh : item.summary.en;
  const alt = lang === 'zh' ? item.alt.zh : item.alt.en;

  return (
    <article id={item.id} ref={cardRef} className="accessories-lane-card">
      <div className="accessories-lane-card-image">
        <Image src={item.image} alt={alt} fill loading="lazy" sizes="320px" className="object-contain" />
      </div>
      <div className="accessories-lane-card-body">
        <div className="accessories-lane-card-shell">
          <div className="accessories-lane-card-intro">
            <h3 className="accessories-lane-card-title">{name}</h3>
            <p className="accessories-lane-card-summary">{summary}</p>
          </div>
          <div className="accessories-lane-card-spacer" aria-hidden="true" />
          <div className="accessories-lane-inquiry-row">
            <button
              type="button"
              className="accessories-lane-inquiry"
              onClick={() => openInquiryForAccessory(item, lang)}
            >
              {copy.inquiry}
            </button>
          </div>
        </div>
        <div className="accessories-lane-card-footer">
          {item.specRows?.length ? (
            <details className="accessories-lane-details group" onToggle={onLayoutChange}>
              <summary className="accessories-lane-details-summary">
                <span className="accessories-lane-details-label">{copy.expandSpecs}</span>
                <span className="accessories-lane-details-chevron" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3.5 5.25 7 8.75l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </summary>
              <dl className="accessories-lane-specs">
                {item.specRows.map((row) => (
                  <div key={`${item.id}-${row.label.en}`} className="accessories-lane-spec-row">
                    <dt>{lang === 'zh' ? row.label.zh : row.label.en}</dt>
                    <dd>{accessorySpecValue(row.value, lang)}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ) : (
            <p className="accessories-lane-placeholder-note">
              {lang === 'zh' ? '规格即将发布。' : 'Specifications coming soon.'}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export function AccessoryLaneSection({
  lane,
  lang,
  copy,
  showHeader = true,
}: {
  lane: AccessoryLaneId;
  lang: 'zh' | 'en';
  copy: AccessoryLaneCopy;
  showHeader?: boolean;
}) {
  const laneCopy = copy.lanes[lane];
  const items = accessoryItemsByLane(lane);
  const sectionId = accessoryLaneSectionId(lane);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const snapRefs = useRef<(HTMLElement | null)[]>([]);
  snapRefs.current.length = items.length;

  const getSnapItems = useCallback(
    () => snapRefs.current.slice(0, items.length),
    [items.length],
  );
  const activeIndex = useHorizontalScrollIndex(scrollerRef, getSnapItems);

  const onDotSelect = (index: number) => {
    scrollHorizontalSnapItem(scrollerRef.current, snapRefs.current[index] ?? null, 'start');
  };

  const relayoutScroller = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    requestAnimationFrame(() => {
      for (const card of snapRefs.current) {
        if (card) card.style.height = 'auto';
      }
      scroller.style.height = 'auto';
      void scroller.offsetHeight;
      scroller.style.height = '';
    });
  }, []);

  return (
    <section
      id={sectionId}
      className="accessories-lane"
      aria-label={showHeader ? undefined : laneCopy.aria}
      aria-labelledby={showHeader ? `${sectionId}-title` : undefined}
    >
      {showHeader ? (
        <div className="accessories-lane-header">
          <h2 id={`${sectionId}-title`}>{laneCopy.title}</h2>
          {laneCopy.note ? <p className="accessories-lane-note">{laneCopy.note}</p> : null}
        </div>
      ) : laneCopy.note ? (
        <div className="accessories-lane-header">
          <p className="accessories-lane-note">{laneCopy.note}</p>
        </div>
      ) : null}
      <div className="accessories-lane-scroller-wrap">
        <div
          ref={scrollerRef}
          className="accessories-lane-scroller roooll-hscroll"
          aria-label={laneCopy.aria}
        >
          {items.map((item, index) => (
            <AccessoryCard
              key={item.id}
              item={item}
              lang={lang}
              copy={copy}
              cardRef={(el) => {
                snapRefs.current[index] = el;
              }}
              onLayoutChange={relayoutScroller}
            />
          ))}
        </div>
        <HorizontalScrollDots
          count={items.length}
          activeIndex={activeIndex}
          label={laneCopy.aria}
          onSelect={onDotSelect}
        />
      </div>
    </section>
  );
}
