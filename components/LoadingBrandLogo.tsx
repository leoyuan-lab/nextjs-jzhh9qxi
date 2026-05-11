'use client';

const LOADING_LOGO_SRC = '/images/brand/roooll-loading-logo.png';

type Props = {
  /** Ignored when `decorative` (alt becomes empty). */
  logoAlt?: string;
  /** Second instance above slogan letter: not announced, no LCP priority. */
  decorative?: boolean;
  className?: string;
  /** Extra class on the inner frame (e.g. smaller mobile-over-letter size). */
  frameClassName?: string;
};

/** Static raster logo — 原生 img 避免 Next/Image 包装层在父级 zoom/scale 下刷新时多一帧合成。 */
export function LoadingBrandLogo({ logoAlt, decorative, className, frameClassName }: Props) {
  const a11yAlt = decorative ? '' : (logoAlt ?? '');
  return (
    <div className={`loading-brand-plain-root ${className ?? ''}`.trim()}>
      <div className={`loading-brand-plain-frame ${frameClassName ?? ''}`.trim()}>
        <img
          src={LOADING_LOGO_SRC}
          alt={a11yAlt}
          width={1024}
          height={745}
          className="loading-brand-plain-img"
          decoding="async"
          fetchPriority={decorative ? 'auto' : 'high'}
        />
      </div>
    </div>
  );
}
