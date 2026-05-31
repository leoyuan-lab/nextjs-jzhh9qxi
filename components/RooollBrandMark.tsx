'use client';

import { SITE_BRAND_MARK_SVG_PATH } from '@/lib/site-brand-paths';

type Props = {
  /** Render width in CSS pixels (height follows 1024:745 aspect). Ignored when `fillContainer`. */
  width?: number;
  /** Fill the parent box (uses width/height 100% + preserveAspectRatio). */
  fillContainer?: boolean;
  className?: string;
  /** Accessible name; omit when decorative. */
  title?: string;
  decorative?: boolean;
  /** Mark color; default currentColor for CSS / parent control (e.g. white on dark, black on light). */
  color?: string;
};

const VIEWBOX_W = 1024;
const VIEWBOX_H = 745;

const MARK_MASK = `url(${SITE_BRAND_MARK_SVG_PATH})`;

/**
 * Official Roooll mark — rendered via CSS mask from `roooll-brand-mark.svg` (traced from loading logo).
 * Set parent `color` or `color` prop for light/dark surfaces.
 */
export function RooollBrandMark({
  width = 128,
  fillContainer,
  className,
  title,
  decorative,
  color = 'currentColor',
}: Props) {
  const renderHeight = (width * VIEWBOX_H) / VIEWBOX_W;
  const a11yLabel = decorative ? undefined : title;

  return (
    <span
      className={['roooll-brand-mark', className].filter(Boolean).join(' ')}
      style={{
        display: 'block',
        flexShrink: 0,
        width: fillContainer ? '100%' : width,
        height: fillContainer ? '100%' : renderHeight,
        backgroundColor: color,
        WebkitMaskImage: MARK_MASK,
        maskImage: MARK_MASK,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={a11yLabel}
    />
  );
}
