'use client';

import Image from 'next/image';

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

/** Static raster logo — hero column or small mark above slogan letter (mobile). */
export function LoadingBrandLogo({ logoAlt, decorative, className, frameClassName }: Props) {
  const alt = decorative ? '' : (logoAlt ?? '');
  return (
    <div className={`loading-brand-plain-root ${className ?? ''}`.trim()}>
      <div className={`loading-brand-plain-frame ${frameClassName ?? ''}`.trim()}>
        <Image
          src={LOADING_LOGO_SRC}
          alt={alt}
          width={1024}
          height={745}
          sizes={decorative ? '112px' : '(max-width: 767px) 30vw, 20vw'}
          className="loading-brand-plain-img"
          priority={!decorative}
          /* 直连静态 PNG，避免刷新时 _next/image 缓存命中与父级 scale 叠在一帧里栅格化闪一下 */
          unoptimized
        />
      </div>
    </div>
  );
}
