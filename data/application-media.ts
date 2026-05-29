import { APPLICATION_HUB_CARD_IMAGES, APPLICATION_VIDEOS } from '@/data/application-assets';

/** Application page media paths — see `data/application-assets.ts` + `public/applications/`. */
export const APPLICATION_MANUFACTURING_MEDIA = {
  heroVideo: APPLICATION_VIDEOS.welding,
  /** Mid-timeline frame from welding master — not a product thumbnail. */
  heroPoster: APPLICATION_HUB_CARD_IMAGES.manufacturing,
  scenarios: [
    {
      id: 'welding',
      kind: 'video' as const,
      src: APPLICATION_VIDEOS.welding,
      altKey: 'application_mfg_video_welding' as const,
    },
    {
      id: 'screw_driving',
      kind: 'video' as const,
      src: APPLICATION_VIDEOS.screwDriving,
      altKey: 'application_mfg_video_screw_driving' as const,
    },
    {
      id: 'cnc_tending',
      kind: 'image' as const,
      src: '/images/robots/r-lite-cobot-fr3-c-hd.webp',
      altKey: 'r_lite_fr3_c' as const,
      altNamespace: 'variant_images' as const,
    },
  ],
  products: [
    {
      id: 'r-lite',
      href: '/cobots/r-lite',
      image: '/images/robots/r-lite-cobot-fr3-c-hd.webp',
      altKey: 'r_lite_fr3_c' as const,
    },
    {
      id: 'r-ultra',
      href: '/cobots/r-ultra',
      image: '/images/robots/r-ultra-cobot-fr30-std-hd.webp',
      altKey: 'r_ultra_fr30_std' as const,
    },
  ],
} as const;
