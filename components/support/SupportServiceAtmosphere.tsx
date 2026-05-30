'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  SUPPORT_SERVICE_ATMOSPHERE_FRAME,
  SUPPORT_SERVICE_ATMOSPHERE_VIDEO,
} from '@/lib/support-service-media';

type Props = {
  alt: string;
};

/**
 * Full-bleed service page atmosphere: looping video with static frame as poster and fallback.
 */
export function SupportServiceAtmosphere({ alt }: Props) {
  const [useStaticOnly, setUseStaticOnly] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setUseStaticOnly(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <div className="support-page-atmosphere" aria-hidden>
      <Image
        src={SUPPORT_SERVICE_ATMOSPHERE_FRAME}
        alt={alt}
        fill
        sizes="100vw"
        className="support-page-atmosphere__img"
        priority
      />
      {!useStaticOnly ? (
        <video
          className="support-page-atmosphere__video"
          src={SUPPORT_SERVICE_ATMOSPHERE_VIDEO}
          poster={SUPPORT_SERVICE_ATMOSPHERE_FRAME}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          onError={() => setUseStaticOnly(true)}
        />
      ) : null}
      <div className="support-page-atmosphere__dim" />
    </div>
  );
}
