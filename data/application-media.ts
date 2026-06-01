import {
  APPLICATION_HUB_CARD_IMAGES,
  APPLICATION_SCENARIO_IMAGES,
  APPLICATION_VIDEOS,
} from '@/data/application-assets';

export type ApplicationScenarioMedia =
  | {
      id: string;
      kind: 'video';
      src: string;
      altKey: string;
    }
  | {
      id: string;
      kind: 'image';
      src: string;
      altKey: string;
      altNamespace?: 'variant_images';
    };

export type ApplicationImmersiveMedia = {
  heroVideo: string;
  heroPoster: string;
  scenarios: readonly ApplicationScenarioMedia[];
  products: readonly {
    id: 'r-lite' | 'r-core' | 'r-ultra';
    href: string;
    image: string;
    altKey: string;
  }[];
};

const LITE_CORE_PRODUCTS = [
  {
    id: 'r-lite' as const,
    href: '/cobots/r-lite',
    image: '/images/robots/r-lite-cobot-fr3-c-hd.webp',
    altKey: 'r_lite_fr3_c' as const,
  },
  {
    id: 'r-core' as const,
    href: '/cobots/r-core',
    image: '/images/robots/r-core-cobot-fr5-std-hd.webp',
    altKey: 'r_core_fr5_std' as const,
  },
];

/** Application page media paths — see `data/application-assets.ts` + `public/applications/`. */
export const APPLICATION_MANUFACTURING_MEDIA: ApplicationImmersiveMedia = {
  heroVideo: APPLICATION_VIDEOS.welding,
  heroPoster: APPLICATION_HUB_CARD_IMAGES.manufacturing,
  scenarios: [
    {
      id: 'welding',
      kind: 'video',
      src: APPLICATION_VIDEOS.welding,
      altKey: 'application_mfg_video_welding',
    },
    {
      id: 'screw_driving',
      kind: 'video',
      src: APPLICATION_VIDEOS.screwDriving,
      altKey: 'application_mfg_video_screw_driving',
    },
    {
      id: 'cnc_tending',
      kind: 'image',
      src: '/images/robots/r-lite-cobot-fr3-c-hd.webp',
      altKey: 'r_lite_fr3_c',
      altNamespace: 'variant_images',
    },
  ],
  products: [
    LITE_CORE_PRODUCTS[0],
    {
      id: 'r-ultra',
      href: '/cobots/r-ultra',
      image: '/images/robots/r-ultra-cobot-fr30-std-hd.webp',
      altKey: 'r_ultra_fr30_std',
    },
  ],
};

export const APPLICATION_MEDICAL_LAB_MEDIA: ApplicationImmersiveMedia = {
  heroVideo: APPLICATION_VIDEOS.labLoading,
  heroPoster: APPLICATION_HUB_CARD_IMAGES.medicalLab,
  scenarios: [
    {
      id: 'analyzer_tending',
      kind: 'video',
      src: APPLICATION_VIDEOS.labLoading,
      altKey: 'application_medlab_video_loading',
    },
    {
      id: 'sample_handling',
      kind: 'image',
      src: APPLICATION_SCENARIO_IMAGES.medicalLabSample,
      altKey: 'application_medlab_scenario_sample',
    },
    {
      id: 'bench_repeatables',
      kind: 'image',
      src: APPLICATION_SCENARIO_IMAGES.medicalLabBench,
      altKey: 'application_medlab_scenario_bench',
    },
  ],
  products: LITE_CORE_PRODUCTS,
};

export const APPLICATION_RETAIL_SERVICE_MEDIA: ApplicationImmersiveMedia = {
  heroVideo: APPLICATION_VIDEOS.milkTea,
  heroPoster: APPLICATION_HUB_CARD_IMAGES.retailService,
  scenarios: [
    {
      id: 'beverage_dispense',
      kind: 'video',
      src: APPLICATION_VIDEOS.milkTea,
      altKey: 'application_retail_video_milk_tea',
    },
    {
      id: 'front_service',
      kind: 'image',
      src: APPLICATION_SCENARIO_IMAGES.retailDispense,
      altKey: 'application_retail_scenario_dispense',
    },
    {
      id: 'compact_station',
      kind: 'image',
      src: APPLICATION_SCENARIO_IMAGES.retailService,
      altKey: 'application_retail_scenario_service',
    },
  ],
  products: LITE_CORE_PRODUCTS,
};

export const APPLICATION_EDUCATION_MEDIA: ApplicationImmersiveMedia = {
  heroVideo: APPLICATION_VIDEOS.hospitalRecover,
  heroPoster: APPLICATION_HUB_CARD_IMAGES.education,
  scenarios: [
    {
      id: 'curriculum_demo',
      kind: 'video',
      src: APPLICATION_VIDEOS.hospitalRecover,
      altKey: 'application_education_video_demo',
    },
    {
      id: 'research_bench',
      kind: 'image',
      src: APPLICATION_SCENARIO_IMAGES.educationLab,
      altKey: 'application_education_scenario_lab',
    },
    {
      id: 'competition_lab',
      kind: 'image',
      src: APPLICATION_SCENARIO_IMAGES.educationTeam,
      altKey: 'application_education_scenario_team',
    },
  ],
  products: LITE_CORE_PRODUCTS,
};
