'use client';

import Image from 'next/image';
import { useState } from 'react';
import { R_LITE_ADVISOR_FLANGE_HERO_IMG, ROBOT_IMG_BASE, robotVariantWebpFilename } from '@/data/products';

type Props = {
  alt: string;
};

const FR3C_WEBP = `${ROBOT_IMG_BASE}/${robotVariantWebpFilename('fr3-c')}`;

/** 法兰段大特写：`contain` 完整显示；`unoptimized` 直出 WebP，避免 `/_next/image` 二次压缩发糊 */
export function RCoreFlangeHeroStill({ alt }: Props) {
  const [src, setSrc] = useState(R_LITE_ADVISOR_FLANGE_HERO_IMG);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      unoptimized
      className="rcore-ln-flange-hero-fill"
      priority
      onError={() => {
        if (src !== FR3C_WEBP) setSrc(FR3C_WEBP);
      }}
    />
  );
}
