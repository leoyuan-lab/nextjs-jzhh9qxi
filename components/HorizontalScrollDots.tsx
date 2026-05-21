'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

function readSnapItems(getItems: () => readonly (HTMLElement | null)[]): HTMLElement[] {
  return getItems().filter((el): el is HTMLElement => el !== null);
}

/** Which snap item is closest to the scroller viewport center. */
export function useHorizontalScrollIndex(
  scrollerRef: RefObject<HTMLElement | null>,
  getItems: () => readonly (HTMLElement | null)[],
): number {
  const [activeIndex, setActiveIndex] = useState(0);

  const update = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const items = readSnapItems(getItems);
    if (items.length === 0) return;

    const probe = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    items.forEach((el, index) => {
      const target = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(target - probe);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });

    setActiveIndex((prev) => (prev === best ? prev : best));
  }, [getItems, scrollerRef]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scroller.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [scrollerRef, update]);

  return activeIndex;
}

export function scrollHorizontalSnapItem(
  scroller: HTMLElement | null,
  item: HTMLElement | null,
  inline: ScrollLogicalPosition = 'center',
) {
  if (!scroller || !item) return;
  item.scrollIntoView({ behavior: 'smooth', inline, block: 'nearest' });
}

export function HorizontalScrollDots({
  count,
  activeIndex,
  label,
  onSelect,
  variant = 'light',
}: {
  count: number;
  activeIndex: number;
  label: string;
  onSelect?: (index: number) => void;
  variant?: 'light' | 'dark';
}) {
  if (count <= 1) return null;

  return (
    <div
      className={`roooll-hscroll-dots${variant === 'dark' ? ' roooll-hscroll-dots--dark' : ''}`}
      role="tablist"
      aria-label={label}
    >
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === activeIndex}
          aria-label={`${label} ${index + 1}`}
          className={`roooll-hscroll-dot${index === activeIndex ? ' is-active' : ''}`}
          onClick={() => onSelect?.(index)}
        />
      ))}
    </div>
  );
}
