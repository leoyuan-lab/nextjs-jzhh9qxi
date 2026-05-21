import {
  controllerApplicableRobotsText,
  controllerSpecLabels,
  controllerSpecs,
  type ControllerSpec,
  type MultiLang,
} from '@/data/products';

export type AccessoryLaneId = 'controllers' | 'grippers' | 'fixtures';

export interface AccessoryCatalogItem {
  id: string;
  lane: AccessoryLaneId;
  name: MultiLang;
  summary: MultiLang;
  image: string;
  alt: MultiLang;
  /** Live spec rows (controllers); placeholders omit */
  specRows?: readonly { label: MultiLang; value: MultiLang | string }[];
  schemaCategory: MultiLang;
  schemaDescription: MultiLang;
}

const PLACEHOLDER_IMAGE = '/images/robots/r-lite-cobot-fr3-std.webp';
const CONTROLLER_IMAGE = '/images/robots/r-ultra-cobot-fr30-std.webp';

function ml(v: MultiLang, lang: 'zh' | 'en'): string {
  return lang === 'zh' ? v.zh : v.en;
}

function controllerSpecRows(spec: ControllerSpec): AccessoryCatalogItem['specRows'] {
  return [
    { label: controllerSpecLabels.powerSupply, value: spec.powerSupply },
    { label: controllerSpecLabels.outputPower, value: spec.outputPower },
    { label: controllerSpecLabels.dimensions, value: spec.dimensions },
    { label: controllerSpecLabels.weight, value: spec.weight },
    { label: controllerSpecLabels.ip, value: spec.ip },
    { label: controllerSpecLabels.standardComm, value: spec.standardComm },
    { label: controllerSpecLabels.sdk, value: spec.sdk },
    {
      label: controllerSpecLabels.applicableRobots,
      value: {
        zh: controllerApplicableRobotsText(spec, 'zh'),
        en: controllerApplicableRobotsText(spec, 'en'),
      },
    },
    { label: controllerSpecLabels.ioPorts, value: spec.ioPorts },
    { label: controllerSpecLabels.optionalComm, value: spec.optionalComm },
    { label: controllerSpecLabels.commBoard, value: spec.commBoard },
    { label: controllerSpecLabels.materials, value: spec.materials },
  ];
}

function controllerSummary(spec: ControllerSpec): MultiLang {
  const tier =
    spec.formFactor === 'mini'
      ? { zh: 'mini', en: 'mini' }
      : { zh: '标准', en: 'standard' };
  const power = spec.powerType === 'ac' ? { zh: '交流', en: 'AC' } : { zh: '直流', en: 'DC' };
  return {
    zh: `${spec.outputKw}kW ${power.zh} ${tier.zh} 外置控制箱 · ${spec.outputPower}`,
    en: `${spec.outputKw} kW ${power.en} ${tier.en} external cabinet · ${spec.outputPower}`,
  };
}

function controllerSchemaDescription(spec: ControllerSpec): MultiLang {
  const rows = controllerSpecRows(spec) ?? [];
  const parts = rows.slice(0, 6).map((row) => {
    const val = typeof row.value === 'string' ? row.value : row.value.en;
    return `${row.label.en}: ${val}`;
  });
  return {
    zh: `${spec.name.zh}。${controllerSummary(spec).zh}`,
    en: `${spec.name.en}. ${parts.join('. ')}.`,
  };
}

const GRIPPER_PLACEHOLDERS: Omit<AccessoryCatalogItem, 'lane' | 'specRows'>[] = [
  {
    id: 'roooll-gripper-parallel-placeholder',
    name: { zh: 'Roooll 平行夹爪（占位）', en: 'Roooll Parallel Gripper (placeholder)' },
    summary: {
      zh: '两指平行夹持，适配 Roooll 协作臂 ISO 9409-1 法兰（占位）。',
      en: 'Two-finger parallel gripper for Roooll cobot ISO 9409-1 flange (placeholder).',
    },
    image: PLACEHOLDER_IMAGE,
    alt: {
      zh: 'Roooll 协作机器人平行夹爪配件占位图',
      en: 'Roooll collaborative robot parallel gripper accessory placeholder',
    },
    schemaCategory: { zh: '协作机器人夹爪', en: 'Collaborative Robot Gripper' },
    schemaDescription: {
      zh: 'Roooll 平行夹爪配件占位条目，正式规格即将发布。',
      en: 'Roooll parallel gripper accessory placeholder; specifications coming soon.',
    },
  },
  {
    id: 'roooll-gripper-vacuum-placeholder',
    name: { zh: 'Roooll 真空吸盘套件（占位）', en: 'Roooll Vacuum Gripper Kit (placeholder)' },
    summary: {
      zh: '轻量搬运与面板吸附，含快换接口（占位）。',
      en: 'Light handling and panel picking with quick-change interface (placeholder).',
    },
    image: '/images/robots/r-core-cobot-fr5-std.webp',
    alt: {
      zh: 'Roooll 协作机器人真空吸盘配件占位图',
      en: 'Roooll collaborative robot vacuum gripper accessory placeholder',
    },
    schemaCategory: { zh: '协作机器人夹爪', en: 'Collaborative Robot Gripper' },
    schemaDescription: {
      zh: 'Roooll 真空吸盘套件占位条目，正式规格即将发布。',
      en: 'Roooll vacuum gripper kit placeholder; specifications coming soon.',
    },
  },
];

const FIXTURE_PLACEHOLDERS: Omit<AccessoryCatalogItem, 'lane' | 'specRows'>[] = [
  {
    id: 'roooll-fixture-quick-change-placeholder',
    name: { zh: 'Roooll 快换夹具板（占位）', en: 'Roooll Quick-Change Fixture Plate (placeholder)' },
    summary: {
      zh: '末端快换与工装定位基准，缩短换线时间（占位）。',
      en: 'Tool-side quick change and locating plate for faster line changeover (placeholder).',
    },
    image: '/images/robots/r-max-cobot-fr16-std.webp',
    alt: {
      zh: 'Roooll 协作机器人快换夹具配件占位图',
      en: 'Roooll collaborative robot quick-change fixture placeholder',
    },
    schemaCategory: { zh: '协作机器人夹具', en: 'Collaborative Robot Fixture' },
    schemaDescription: {
      zh: 'Roooll 快换夹具板占位条目，正式规格即将发布。',
      en: 'Roooll quick-change fixture plate placeholder; specifications coming soon.',
    },
  },
  {
    id: 'roooll-fixture-assembly-placeholder',
    name: { zh: 'Roooll 装配工装夹具（占位）', en: 'Roooll Assembly Fixture (placeholder)' },
    summary: {
      zh: '针对锁付、压装等工位的定制工装框架（占位）。',
      en: 'Custom fixture frames for fastening and press-fit stations (placeholder).',
    },
    image: PLACEHOLDER_IMAGE,
    alt: {
      zh: 'Roooll 协作机器人装配夹具配件占位图',
      en: 'Roooll collaborative robot assembly fixture placeholder',
    },
    schemaCategory: { zh: '协作机器人夹具', en: 'Collaborative Robot Fixture' },
    schemaDescription: {
      zh: 'Roooll 装配工装夹具占位条目，正式规格即将发布。',
      en: 'Roooll assembly fixture placeholder; specifications coming soon.',
    },
  },
];

export function accessoryCatalogItems(): AccessoryCatalogItem[] {
  const controllers: AccessoryCatalogItem[] = controllerSpecs.models.map((spec) => ({
    id: spec.id,
    lane: 'controllers',
    name: spec.name,
    summary: controllerSummary(spec),
    image: CONTROLLER_IMAGE,
    alt: {
      zh: `${spec.name.zh} 协作机器人外置控制箱产品图（占位）`,
      en: `${spec.name.en} external control cabinet product image (placeholder)`,
    },
    specRows: controllerSpecRows(spec),
    schemaCategory: { zh: '协作机器人控制箱', en: 'Collaborative Robot Control Cabinet' },
    schemaDescription: controllerSchemaDescription(spec),
  }));

  const grippers: AccessoryCatalogItem[] = GRIPPER_PLACEHOLDERS.map((item) => ({
    ...item,
    lane: 'grippers',
  }));

  const fixtures: AccessoryCatalogItem[] = FIXTURE_PLACEHOLDERS.map((item) => ({
    ...item,
    lane: 'fixtures',
  }));

  return [...controllers, ...grippers, ...fixtures];
}

export function accessoryItemsByLane(lane: AccessoryLaneId): AccessoryCatalogItem[] {
  return accessoryCatalogItems().filter((item) => item.lane === lane);
}

export function accessorySpecValue(
  value: MultiLang | string,
  lang: 'zh' | 'en',
): string {
  return typeof value === 'string' ? value : ml(value, lang);
}

export function buildAccessoriesPageJsonLd(
  lang: 'zh' | 'en',
  origin: string,
  items: readonly AccessoryCatalogItem[],
) {
  const base = origin.replace(/\/$/, '');
  const pageUrl = new URL(`/${lang}/accessories`, `${base}/`).href;
  const pageName =
    lang === 'zh' ? 'Roooll 协作机器人配件' : 'Roooll Cobot Accessories Ecosystem';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        name: pageName,
        url: pageUrl,
        inLanguage: lang === 'zh' ? 'zh-CN' : 'en-US',
        isPartOf: { '@type': 'WebSite', name: 'Roooll', url: base },
        mainEntity: { '@id': `${pageUrl}#itemlist` },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#itemlist`,
        name: pageName,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            '@id': `${pageUrl}#${item.id}`,
            name: ml(item.name, lang),
            description: ml(item.schemaDescription, lang),
            sku: item.id,
            url: `${pageUrl}#${item.id}`,
            image: new URL(item.image, `${base}/`).href,
            brand: { '@type': 'Brand', name: 'Roooll' },
            manufacturer: { '@type': 'Organization', name: 'Roooll' },
            category: ml(item.schemaCategory, lang),
            offers: {
              '@type': 'Offer',
              availability: 'https://schema.org/InStock',
              url: `${pageUrl}#${item.id}`,
              seller: { '@type': 'Organization', name: 'Roooll' },
            },
          },
        })),
      },
    ],
  };
}
