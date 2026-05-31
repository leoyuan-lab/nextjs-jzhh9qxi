// data/products.ts — 协作机器人 FR 系列规格与配件摘要（站内统一数据源）

import enLocale from '@/locales/en.json';
import zhLocale from '@/locales/zh.json';
import { rooollVariantShortLabel } from '@/lib/roooll-product-schema';

export interface MultiLang {
  zh: string;
  en: string;
}

export interface AxisSpec {
  range: string;
  speed: string;
}

export interface RobotVariant {
  id: string;
  name: string;
  /** 卡片 / 下拉展示短名（缺省用 `name`） */
  shortName?: MultiLang;
  payload: string;
  reach: string;
  repeatability: string;
  weight: string;
  dof: string;
  ipRating: string;
  avgPower: string;
  peakPower: string;
  tcpSpeed: string;
  voltage: string;
  noise: string;
  mounting: MultiLang;
  humidity: string;
  temperature: string;
  footprint: string;
  ioPorts: string;
  toolPower: string;
  /** 设备材料（样册 Materials） */
  materials?: MultiLang;
  /** 典型功率测试负载说明（样册 payload setting） */
  powerTestNote?: MultiLang;
  axes: {
    base: AxisSpec;
    shoulder: AxisSpec;
    elbow: AxisSpec;
    wrist1: AxisSpec;
    wrist2: AxisSpec;
    wrist3: AxisSpec;
  };
  description: MultiLang;
}

export interface RobotFamily {
  id: string;
  displayName: string;
  originalSeries: string;
  basePayload: string;
  baseReach: string;
  variants: RobotVariant[];
}

/** 产品目录与认证摘要（无第三方品牌联系方式） */
export const productCatalogMeta = {
  datasheetRef: 'EV1.4-20260403',
  frSeriesModelsZh:
    'r-Lite（标准 / 一体式 / 移动短臂 / 移动长臂）、r-Core、r-Reach、r-Max（16kg / 20kg）、r-Ultra',
  frSeriesModelsEn:
    'r-Lite (standard, integrated, mobile S/L), r-Core, r-Reach, r-Max (16kg / 20kg), r-Ultra',
  certificationsZh:
    '设计符合 RoHS 及国际协作机器人安全标准口径。目标市场的合规与检测资料可按项目提供。功能安全设计参考 ISO 10218、ISO 13849、ISO 15066 等主流标准。',
  certificationsEn:
    'Designed to align with RoHS and widely referenced international cobot safety benchmarks. Compliance and test documentation for target markets available per project. Functional safety design references ISO 10218, ISO 13849, and ISO 15066.',
  productVision: {
    modularization: { zh: '模块化', en: 'Modularization' },
    quickDeployment: { zh: '快部署', en: 'Quick deployment' },
    easyOperation: { zh: '易操作', en: 'Easy operation' },
  },
} as const;

/** 控制箱单行规格（样册 EV1.4「控制箱规格参数 / CONTROLLER TECHNICAL SPECIFICATION」） */
export interface ControllerSpec {
  id: string;
  name: MultiLang;
  powerType: 'dc' | 'ac';
  formFactor: 'mini' | 'standard';
  outputKw: 2 | 5;
  ip: string;
  temperature: string;
  humidity: string;
  ioPorts: MultiLang;
  ioPower: string;
  standardComm: MultiLang;
  optionalComm: MultiLang;
  commBoard: MultiLang;
  sdk: string;
  dimensions: MultiLang;
  weight: MultiLang;
  materials: MultiLang;
  powerSupply: MultiLang;
  outputPower: string;
  /** 与 `robotVariantById` 键对应，便于按机型筛选外置控制箱 */
  applicableVariantIds: readonly string[];
}

const CONTROLLER_2KW_VARIANT_IDS = [
  'fr3-std',
  'fr3-wms',
  'fr3-wml',
  'fr5-std',
  'fr5-wml',
  'fr10-std',
  'fr16-std',
] as const;

const CONTROLLER_5KW_VARIANT_IDS = ['fr20-std', 'fr30-std'] as const;

const CONTROLLER_SHARED = {
  ip: 'IP54',
  temperature: '0–45℃',
  humidity: '90%RH (non-condensing)',
  ioPorts: {
    zh: '数字输入(DI) 16 / 数字输出(DO) 16 / 模拟输入(AI) 2 / 模拟输出(AO) 2 / 高速脉冲输入 2',
    en: 'DI 16 / DO 16 / AI 2 / AO 2 / High speed pulse input 2',
  },
  ioPower: '24V / 1.5A',
  standardComm: {
    zh: 'TCP/IP、I/O、Modbus_TCP/RTU',
    en: 'I/O, TCP/IP, Modbus TCP/RTU',
  },
  optionalComm: {
    zh: 'CC-Link IE Field Basic、Profinet、Ethernet/IP、EtherCAT',
    en: 'CC-Link IE Field Basic, Profinet, Ethernet/IP, EtherCAT',
  },
  commBoard: {
    zh: 'MiniPCI Express 实时以太网 PC 板卡',
    en: 'MiniPCI Express — real-time Ethernet PC Board',
  },
  sdk: 'C# / C++ / Python / ROS / ROS2',
  materials: { zh: '镀锌板', en: 'Galvanized plate' },
} as const;

/** 控制箱规格（样册「控制箱规格参数」四款外置控制箱） */
export const controllerSpecs = {
  noteIntegrated: {
    zh: '注：r-Lite · C 与 r-Core · C 控制箱集成在机器人底座。',
    en: 'Note: The r-Lite · C and r-Core · C control cabinets are integrated into the robot base.',
  },
  models: [
    {
      id: 'roooll-dc-mini-2kw',
      name: { zh: 'Roooll直流mini控制箱2kW', en: 'Roooll DC Mini Controller 2kW' },
      powerType: 'dc',
      formFactor: 'mini',
      outputKw: 2,
      ...CONTROLLER_SHARED,
      dimensions: {
        zh: '245×180×44.5mm（不含凸出物）',
        en: '245×180×44.5mm (no protrusions)',
      },
      weight: { zh: '2.1kg（不含线重量）', en: '2.1kg (weight without wire)' },
      powerSupply: { zh: '30–60VDC', en: '30–60VDC' },
      outputPower: '48VDC / 42A max',
      applicableVariantIds: CONTROLLER_2KW_VARIANT_IDS,
    },
    {
      id: 'roooll-dc-5kw',
      name: { zh: 'Roooll直流控制箱5kW', en: 'Roooll DC Controller 5kW' },
      powerType: 'dc',
      formFactor: 'standard',
      outputKw: 5,
      ...CONTROLLER_SHARED,
      dimensions: {
        zh: '245×180×89mm（不含凸出物）',
        en: '245×180×89mm (no protrusions)',
      },
      weight: { zh: '2.957kg（不含线重量）', en: '2.957kg (weight without wire)' },
      powerSupply: { zh: '30–60VDC', en: '30–60VDC' },
      outputPower: '48VDC / 104A max',
      applicableVariantIds: CONTROLLER_5KW_VARIANT_IDS,
    },
    {
      id: 'roooll-ac-mini-2kw',
      name: { zh: 'Roooll交流mini控制箱2kW', en: 'Roooll AC Mini Controller 2kW' },
      powerType: 'ac',
      formFactor: 'mini',
      outputKw: 2,
      ...CONTROLLER_SHARED,
      dimensions: {
        zh: '245×180×44.5mm（不含凸出物）',
        en: '245×180×44.5mm (no protrusions)',
      },
      weight: { zh: '2.5kg（不含线重量）', en: '2.5kg (weight without wire)' },
      powerSupply: {
        zh: '100–240VAC / 10A / 单相 / 50–60Hz',
        en: '100–240VAC / 10A / Single-phase / 50–60Hz',
      },
      outputPower: '48VDC / 42A max',
      applicableVariantIds: CONTROLLER_2KW_VARIANT_IDS,
    },
    {
      id: 'roooll-ac-5kw',
      name: { zh: 'Roooll交流控制箱5kW', en: 'Roooll AC Controller 5kW' },
      powerType: 'ac',
      formFactor: 'standard',
      outputKw: 5,
      ...CONTROLLER_SHARED,
      dimensions: {
        zh: '245×180×89mm（不含凸出物）',
        en: '245×180×89mm (no protrusions)',
      },
      weight: { zh: '3.6kg（不含线重量）', en: '3.6kg (weight without wire)' },
      powerSupply: {
        zh: '100–240VAC / 16A / 单相 / 50–60Hz',
        en: '100–240VAC / 16A / Single-phase / 50–60Hz',
      },
      outputPower: '48VDC / 104A max',
      applicableVariantIds: CONTROLLER_5KW_VARIANT_IDS,
    },
  ] satisfies readonly ControllerSpec[],
} as const;

export const controllerById: Record<string, ControllerSpec> = Object.fromEntries(
  controllerSpecs.models.map((m) => [m.id, m]),
);

/** 一体式控制箱机型（底座集成，无外置控制箱选配） */
export const integratedControllerVariantIds = ['fr3-c', 'fr5-c'] as const;

/** 某 variant 可用的外置控制箱（一体式机型返回空数组） */
export function externalControllersForVariant(variantId: string): readonly ControllerSpec[] {
  if ((integratedControllerVariantIds as readonly string[]).includes(variantId)) return [];
  return controllerSpecs.models.filter((m) =>
    (m.applicableVariantIds as readonly string[]).includes(variantId),
  );
}

export type ControllerRecommendation =
  | { kind: 'integrated' }
  | { kind: 'external'; primary: ControllerSpec; alternate: ControllerSpec };

/** 对比页默认推荐交流版为主、直流版为备选（同功率档） */
export function controllerRecommendationForVariant(
  variantId: string,
): ControllerRecommendation | null {
  if ((integratedControllerVariantIds as readonly string[]).includes(variantId)) {
    return { kind: 'integrated' };
  }
  const external = externalControllersForVariant(variantId);
  if (external.length === 0) return null;
  const primary = external.find((c) => c.powerType === 'ac') ?? external[0]!;
  const alternate = external.find((c) => c.id !== primary.id);
  if (!alternate) return { kind: 'external', primary, alternate: primary };
  return { kind: 'external', primary, alternate };
}

/** 卡片 / 详情：控制箱展示（主推荐 AC + 可选 DC 提示） */
export function controllerDisplayForVariant(
  variantId: string,
  lang: 'zh' | 'en',
  opts?: { compact?: boolean },
): { primary: string; secondary?: string; dcOptional: boolean } | null {
  const rec = controllerRecommendationForVariant(variantId);
  if (!rec) return null;
  if (rec.kind === 'integrated') {
    return {
      primary:
        opts?.compact
          ? lang === 'zh'
            ? '集成于机器人底座'
            : 'Integrated in robot base'
          : lang === 'zh'
            ? '控制箱集成于机器人底座，无需外置控制柜。'
            : 'Control cabinet is integrated in the robot base—no external cabinet required.',
      dcOptional: false,
    };
  }
  const primary = lang === 'zh' ? rec.primary.name.zh : rec.primary.name.en;
  const secondary = `${rec.primary.outputKw} kW · ${rec.primary.outputPower}`;
  const dcOptional = rec.alternate.id !== rec.primary.id && rec.alternate.powerType === 'dc';
  return { primary, secondary, dcOptional };
}

/** @deprecated Use `controllerDisplayForVariant` */
export function controllerBriefForVariant(variantId: string, lang: 'zh' | 'en'): string | null {
  return controllerDisplayForVariant(variantId, lang)?.primary ?? null;
}

/** @deprecated Use `controllerDisplayForVariant` */
export function controllerDetailIntroForVariant(
  variantId: string,
  lang: 'zh' | 'en',
): { primary: string; secondary?: string } | null {
  const display = controllerDisplayForVariant(variantId, lang);
  if (!display) return null;
  if (display.dcOptional) {
    return {
      primary:
        lang === 'zh'
          ? `${display.primary}（默认推荐交流版）`
          : `${display.primary} (AC recommended)`,
      secondary: display.secondary,
    };
  }
  return { primary: display.primary, secondary: display.secondary };
}

export const controllerSpecLabels = {
  name: { zh: '型号', en: 'Model' },
  ip: { zh: '防护等级', en: 'IP classification' },
  temperature: { zh: '工作温度', en: 'Operating temperature' },
  humidity: { zh: '工作湿度', en: 'Operating humidity' },
  ioPorts: { zh: 'I/O 端口', en: 'I/O ports' },
  ioPower: { zh: 'I/O 电源', en: 'I/O power supply' },
  standardComm: { zh: '标配通讯', en: 'Standard communication' },
  optionalComm: { zh: '可选通讯', en: 'Optional communication' },
  commBoard: { zh: '通讯板卡选配', en: 'Communication board (optional)' },
  sdk: { zh: '软件开发包', en: 'Software development kit' },
  dimensions: { zh: '尺寸 (L×W×H)', en: 'L×W×H' },
  weight: { zh: '设备重量', en: 'Weight' },
  materials: { zh: '设备材料', en: 'Materials' },
  powerSupply: { zh: '供电电源', en: 'Power supply' },
  outputPower: { zh: '输出功率', en: 'Output power' },
  applicableRobots: { zh: '适配机器人', en: 'Applicable robot' },
  features: { zh: '设备特性', en: 'Features' },
  physical: { zh: '物理性能', en: 'Physical' },
} as const;

/** 示教器（样册选配） */
export const teachPendantSpec = {
  ip: 'IP54',
  humidity: '90%RH (non-condensing)',
  resolution: '1280 × 800 pixels',
  dimensions: '268 × 210 × 88 mm',
  weight: '1.6kg',
  materials: 'ABS、PP',
  cableLength: '5m',
} as const;

/** 按钮盒（样册） */
export const safetyBoxSpec = {
  ip: 'IP54',
  networkRate: '100M',
  keys: '≥ 20W 次',
  power: '标准 POE',
  protocol: 'TCP/IP',
  dimensions: '136 × 60 × 66 mm',
  weight: '490g（含线）',
  materials: 'ABS',
  cableLength: '5m',
} as const;

/** 防爆柜（样册选配摘要） */
export const explosionProofCabinetSpec = {
  ip: 'IP65',
  ratedVoltage: '100–240 Vac',
  ventFlow: '120 L/min',
  maxLeakage: '15 L/min',
  maxPositivePressure: '1000 Pa',
  minPositivePressure: '100 Pa',
  temp: '0℃–45℃',
  dimensions: '682 × 500 × 1100 mm（含报警灯 1286）',
  weight: '75kg',
  materials: '碳钢 + 不锈钢',
  volume: '126L',
  ventTime: '14 min',
  protectiveGas: '空气 (AIR)',
  certificate: 'Compliance documentation available per project',
} as const;

/** 移动安装套件（样册摘要） */
export const mobileMountingKitMeta = {
  lightAppliesTo: [
    'FR3',
    'FR3-C',
    'FR3-WMS',
    'FR3-WML',
    'FR5-WML',
    'FR5-C',
    'FR10',
    'FR16',
  ],
  heavyAppliesTo: ['FR10', 'FR16', 'FR20', 'FR30'],
  lightBaseSize: '1020 × 600 × 250 mm',
  heavyBaseSize: '1240 × 920 × 300 mm',
  columnHeightsMm: [610, 760, 915, 1065, 1220],
} as const;

export const rSeriesData: RobotFamily[] = [
  {
    id: 'r-lite',
    displayName: 'r-Lite',
    originalSeries: 'FR3 Series',
    basePayload: '3kg',
    baseReach: '622mm',
    variants: [
      {
        id: 'fr3-std',
        name: 'Standard',
        payload: '3kg（瞬时 5kg）',
        reach: '622mm',
        repeatability: '±0.02mm',
        weight: '≈15kg',
        dof: '6',
        ipRating: 'IP54（可选 IP65）',
        avgPower: '220W',
        peakPower: '280W',
        tcpSpeed: '1m/s',
        voltage: 'DC 24V / 48V',
        noise: '<65dB',
        mounting: { zh: '任何方向', en: 'Any orientation' },
        humidity: '90%RH（非凝结）',
        temperature: '0–45℃',
        footprint: 'φ128mm',
        ioPorts: 'DI 2 / DO 2 / AI 1 / AO 1',
        toolPower: '24V / 1.5A',
        materials: { zh: '铝、钢', en: 'Aluminum, steel' },
        powerTestNote: {
          zh: 'r-Lite 负载测试：3kg，Z 轴：18mm',
          en: 'r-Lite payload test: 3kg, Z-axis: 18mm',
        },
        axes: {
          base: { range: '±175°', speed: '180°/s' },
          shoulder: { range: '+85° / −265°', speed: '180°/s' },
          elbow: { range: '±150°', speed: '180°/s' },
          wrist1: { range: '+85° / −265°', speed: '180°/s' },
          wrist2: { range: '±175°', speed: '180°/s' },
          wrist3: { range: '±175°（可选 ±360°）', speed: '180°/s' },
        },
        description: {
          zh: '有镜像版本，可组建双臂机器人；典型 TCP 速度 1m/s。',
          en: 'Optional mirror version; dual-arm capable. Typical TCP speed 1 m/s.',
        },
      },
      {
        id: 'fr3-c',
        name: 'C（控制箱一体）',
        payload: '3kg（瞬时 5kg）',
        reach: '622mm',
        repeatability: '±0.05mm',
        weight: '≈12kg',
        dof: '6',
        ipRating: 'IP54',
        avgPower: '200W',
        peakPower: '230W',
        tcpSpeed: '1m/s',
        voltage: 'DC 24V / 48V',
        noise: '<65dB',
        mounting: { zh: '任何方向', en: 'Any orientation' },
        humidity: '90%RH（非凝结）',
        temperature: '0–45℃',
        footprint: 'φ125mm',
        ioPorts: 'DI 2 / DO 2 / AI 1 / AO 1',
        toolPower: '24V / 1.5A',
        materials: { zh: '铝、钢', en: 'Aluminum, steel' },
        powerTestNote: {
          zh: 'r-Lite 一体式 负载测试：3kg，Z 轴：18mm',
          en: 'r-Lite integrated payload test: 3kg, Z-axis: 18mm',
        },
        axes: {
          base: { range: '±175°', speed: '150°/s' },
          shoulder: { range: '+85° / −265°', speed: '150°/s' },
          elbow: { range: '±150°', speed: '150°/s' },
          wrist1: { range: '+85° / −265°', speed: '180°/s' },
          wrist2: { range: '0°–355°', speed: '180°/s' },
          wrist3: { range: '±175°', speed: '180°/s' },
        },
        description: {
          zh: '控制箱集成于底座，节省空间；人机交互为 Web App。',
          en: 'Integrated controller in base; Web App HMI.',
        },
      },
      {
        id: 'fr3-wms',
        name: 'WMS（移动 S）',
        payload: '3kg',
        reach: '622mm',
        repeatability: '±0.02mm',
        weight: '≈10.5kg',
        dof: '6',
        ipRating: 'IP54（可选 IP65）',
        avgPower: '90W',
        peakPower: '130W',
        tcpSpeed: '1m/s',
        voltage: 'DC 24V / 48V',
        noise: '<65dB',
        mounting: { zh: '任何方向', en: 'Any orientation' },
        humidity: '90%RH（非凝结）',
        temperature: '0–45℃',
        footprint: 'φ128mm',
        ioPorts: 'DI 2 / DO 2 / AI 1 / AO 1',
        toolPower: '24V / 1.5A',
        materials: { zh: '铝、钢', en: 'Aluminum, steel' },
        powerTestNote: {
          zh: 'r-Lite 移动短臂 负载测试：3kg，Z 轴：18mm',
          en: 'r-Lite mobile short-arm payload test: 3kg, Z-axis: 18mm',
        },
        axes: {
          base: { range: '±175°', speed: '150°/s' },
          shoulder: { range: '+85° / −265°', speed: '150°/s' },
          elbow: { range: '±150°', speed: '150°/s' },
          wrist1: { range: '+85° / −265°', speed: '180°/s' },
          wrist2: { range: '±175°', speed: '180°/s' },
          wrist3: { range: '±360°', speed: '180°/s' },
        },
        description: {
          zh: '移动短臂型；示教器为 10.1 英寸选配或移动终端。',
          en: 'Mobile short-reach; 10.1" teach pendant optional or mobile terminal.',
        },
      },
      {
        id: 'fr3-wml',
        name: 'WML（移动 L）',
        payload: '3kg',
        reach: '922mm',
        repeatability: '±0.05mm',
        weight: '≈11.25kg',
        dof: '6',
        ipRating: 'IP54（可选 IP65）',
        avgPower: '130W',
        peakPower: '140W',
        tcpSpeed: '1m/s',
        voltage: 'DC 24V / 48V',
        noise: '<65dB',
        mounting: { zh: '任何方向', en: 'Any orientation' },
        humidity: '90%RH（非凝结）',
        temperature: '0–45℃',
        footprint: 'φ128mm',
        ioPorts: 'DI 2 / DO 2 / AI 1 / AO 1',
        toolPower: '24V / 1.5A',
        materials: { zh: '铝、钢', en: 'Aluminum, steel' },
        powerTestNote: {
          zh: 'r-Lite 移动长臂 负载测试：3kg，Z 轴：18mm',
          en: 'r-Lite mobile long-arm payload test: 3kg, Z-axis: 18mm',
        },
        axes: {
          base: { range: '±175°', speed: '150°/s' },
          shoulder: { range: '+85° / −265°', speed: '150°/s' },
          elbow: { range: '±150°', speed: '150°/s' },
          wrist1: { range: '+85° / −265°', speed: '180°/s' },
          wrist2: { range: '±175°', speed: '180°/s' },
          wrist3: { range: '±360°', speed: '180°/s' },
        },
        description: {
          zh: '移动长臂型；扩大作业范围。',
          en: 'Mobile long-reach variant.',
        },
      },
    ],
  },
  {
    id: 'r-core',
    displayName: 'r-Core',
    originalSeries: 'FR5 Series',
    basePayload: '5kg',
    baseReach: '922mm',
    variants: [
      {
        id: 'fr5-std',
        name: 'Standard',
        payload: '5kg（最大 7kg）',
        reach: '922mm',
        repeatability: '±0.02mm',
        weight: '≈22kg',
        dof: '6',
        ipRating: 'IP54（可选 IP65）',
        avgPower: '260W',
        peakPower: '310W',
        tcpSpeed: '1m/s',
        voltage: 'DC 24V / 48V',
        noise: '<65dB',
        mounting: { zh: '任何方向', en: 'Any orientation' },
        humidity: '90%RH（非凝结）',
        temperature: '0–45℃',
        footprint: 'φ149mm',
        ioPorts: 'DI 2 / DO 2 / AI 1 / AO 1',
        toolPower: '24V / 1.5A',
        materials: { zh: '铝、钢', en: 'Aluminum, steel' },
        powerTestNote: {
          zh: 'r-Core 负载测试：5kg，Z 轴：30mm',
          en: 'r-Core payload test: 5kg, Z-axis: 30mm',
        },
        axes: {
          base: { range: '±175°', speed: '180°/s' },
          shoulder: { range: '+85° / −265°', speed: '180°/s' },
          elbow: { range: '±160°', speed: '180°/s' },
          wrist1: { range: '+85° / −265°', speed: '180°/s' },
          wrist2: { range: '±175°', speed: '180°/s' },
          wrist3: { range: '±175°（可选 ±360°）', speed: '180°/s' },
        },
        description: {
          zh: '经典 5kg 级协作臂，工业场景通用。',
          en: 'Classic 5 kg cobot for general industrial tasks.',
        },
      },
      {
        id: 'fr5-c',
        name: 'C（控制箱一体）',
        payload: '4kg（最大 5kg）',
        reach: '922mm',
        repeatability: '±0.05mm',
        weight: '≈11.8kg',
        dof: '6',
        ipRating: 'IP54',
        avgPower: '190W',
        peakPower: '340W',
        tcpSpeed: '1m/s',
        voltage: 'DC 24V / 48V',
        noise: '<65dB',
        mounting: { zh: '任何方向', en: 'Any orientation' },
        humidity: '90%RH（非凝结）',
        temperature: '0–45℃',
        footprint: 'φ125mm',
        ioPorts: 'DI 2 / DO 2 / AI 1 / AO 1',
        toolPower: '24V / 1.5A',
        materials: { zh: '铝、钢', en: 'Aluminum, steel' },
        powerTestNote: {
          zh: 'r-Core 一体式 负载测试：4kg，Z 轴：30mm',
          en: 'r-Core integrated payload test: 4kg, Z-axis: 30mm',
        },
        axes: {
          base: { range: '±175°', speed: '150°/s' },
          shoulder: { range: '+85° / −265°', speed: '150°/s' },
          elbow: { range: '±160°', speed: '150°/s' },
          wrist1: { range: '+85° / −265°', speed: '180°/s' },
          wrist2: { range: '±175°', speed: '180°/s' },
          wrist3: { range: '±360°', speed: '180°/s' },
        },
        description: {
          zh: '一体式控制箱；Web App / 10.1 英寸示教器或移动终端。',
          en: 'Integrated controller; Web App / 10.1" pendant or mobile terminal.',
        },
      },
      {
        id: 'fr5-wml',
        name: 'WML（移动 L）',
        payload: '5kg',
        reach: '1900mm',
        repeatability: '±0.1mm',
        weight: '≤45kg',
        dof: '6',
        ipRating: 'IP54（可选 IP65）',
        avgPower: '190W',
        peakPower: '340W',
        tcpSpeed: '1m/s',
        voltage: 'DC 24V / 48V',
        noise: '<65dB',
        mounting: { zh: '任何方向', en: 'Any orientation' },
        humidity: '95%RH（非凝结）',
        temperature: '−20–45℃',
        footprint: 'φ190mm',
        ioPorts: 'DI 2 / DO 2 / AI 1 / AO 1',
        toolPower: '24V / 1.5A',
        materials: { zh: '铝、钢', en: 'Aluminum, steel' },
        powerTestNote: {
          zh: 'r-Core 移动长臂 负载测试：5kg，Z 轴：30mm',
          en: 'r-Core mobile long-arm payload test: 5kg, Z-axis: 30mm',
        },
        axes: {
          base: { range: '±175°', speed: '120°/s' },
          shoulder: { range: '+85° / −265°', speed: '120°/s' },
          elbow: { range: '±170°', speed: '180°/s' },
          wrist1: { range: '+85° / −265°', speed: '180°/s' },
          wrist2: { range: '±175°', speed: '180°/s' },
          wrist3: { range: '±360°', speed: '180°/s' },
        },
        description: {
          zh: '1.9m 工作半径移动协作臂。',
          en: '1.9 m reach mobile cobot arm.',
        },
      },
    ],
  },
  {
    id: 'r-reach',
    displayName: 'r-Reach',
    originalSeries: 'FR10 Series',
    basePayload: '10kg',
    baseReach: '1400mm',
    variants: [
      {
        id: 'fr10-std',
        name: 'Standard',
        payload: '10kg（最大 14kg）',
        reach: '1400mm',
        repeatability: '±0.05mm',
        weight: '≈40kg',
        dof: '6',
        ipRating: 'IP54（可选 IP65）',
        avgPower: '300W',
        peakPower: '500W',
        tcpSpeed: '1.5m/s',
        voltage: 'DC 24V / 48V',
        noise: '<65dB',
        mounting: { zh: '任何方向', en: 'Any orientation' },
        humidity: '90%RH（非凝结）',
        temperature: '0–45℃',
        footprint: 'φ190mm',
        ioPorts: 'DI 2 / DO 2 / AI 1 / AO 1',
        toolPower: '24V / 1.5A',
        materials: { zh: '铝、钢', en: 'Aluminum, steel' },
        powerTestNote: {
          zh: 'r-Reach 负载测试：10kg，Z 轴：60mm',
          en: 'r-Reach payload test: 10kg, Z-axis: 60mm',
        },
        axes: {
          base: { range: '±175°', speed: '120°/s' },
          shoulder: { range: '+85° / −265°', speed: '120°/s' },
          elbow: { range: '±160°', speed: '180°/s' },
          wrist1: { range: '+85° / −265°', speed: '180°/s' },
          wrist2: { range: '±175°', speed: '180°/s' },
          wrist3: { range: '±175°（可选 ±360°）', speed: '180°/s' },
        },
        description: {
          zh: '10kg 级长臂展机型；典型 TCP 速度 1.5m/s。',
          en: '10 kg class long reach; typical TCP speed 1.5 m/s.',
        },
      },
    ],
  },
  {
    id: 'r-max',
    displayName: 'r-Max',
    originalSeries: 'FR16 / FR20',
    basePayload: '16–20kg',
    baseReach: '1034–1854 mm',
    variants: [
      {
        id: 'fr16-std',
        name: '16kg 重载',
        shortName: { zh: '16', en: '16' },
        payload: '16kg（最大 20kg）',
        reach: '1034mm',
        repeatability: '±0.03mm',
        weight: '≈40kg',
        dof: '6',
        ipRating: 'IP54（可选 IP65）',
        avgPower: '310W',
        peakPower: '410W',
        tcpSpeed: '1m/s',
        voltage: 'DC 24V / 48V',
        noise: '<65dB',
        mounting: { zh: '任何方向', en: 'Any orientation' },
        humidity: '90%RH（非凝结）',
        temperature: '0–45℃',
        footprint: 'φ190mm',
        ioPorts: 'DI 2 / DO 2 / AI 1 / AO 1',
        toolPower: '24V / 1.5A',
        materials: { zh: '铝、钢', en: 'Aluminum, steel' },
        powerTestNote: {
          zh: 'r-Max 16kg 负载测试：16kg，Z 轴：96mm',
          en: 'r-Max 16kg payload test: 16kg, Z-axis: 96mm',
        },
        axes: {
          base: { range: '±175°', speed: '120°/s' },
          shoulder: { range: '+85° / −265°', speed: '120°/s' },
          elbow: { range: '±160°', speed: '180°/s' },
          wrist1: { range: '+85° / −265°', speed: '180°/s' },
          wrist2: { range: '±175°', speed: '180°/s' },
          wrist3: { range: '±175°（可选 ±360°）', speed: '180°/s' },
        },
        description: {
          zh: '16kg 紧凑重载协作臂。',
          en: '16 kg compact heavy-duty cobot.',
        },
      },
      {
        id: 'fr20-std',
        name: '20kg 长臂重载',
        shortName: { zh: '20', en: '20' },
        payload: '20kg（最大 25kg）',
        reach: '1854mm',
        repeatability: '±0.1mm',
        weight: '≈85kg',
        dof: '6',
        ipRating: 'IP54（可选 IP65）',
        avgPower: '610W',
        peakPower: '810W',
        tcpSpeed: '2m/s',
        voltage: 'DC 24V / 48V',
        noise: '<70dB',
        mounting: { zh: '任何方向', en: 'Any orientation' },
        humidity: '90%RH（非凝结）',
        temperature: '0–45℃',
        footprint: '240×240mm',
        ioPorts: 'DI 2 / DO 2 / AI 1 / AO 1',
        toolPower: '24V / 1.5A',
        materials: { zh: '铝、钢', en: 'Aluminum, steel' },
        powerTestNote: {
          zh: 'r-Max 20kg 负载测试：20kg，Z 轴：120mm',
          en: 'r-Max 20kg payload test: 20kg, Z-axis: 120mm',
        },
        axes: {
          base: { range: '±175°', speed: '120°/s' },
          shoulder: { range: '+85° / −265°', speed: '120°/s' },
          elbow: { range: '±160°', speed: '120°/s' },
          wrist1: { range: '+85° / −265°', speed: '180°/s' },
          wrist2: { range: '±175°', speed: '180°/s' },
          wrist3: { range: '±175°', speed: '180°/s' },
        },
        description: {
          zh: '重载长臂展机型，适用于大工作空间搬运与码垛。',
          en: 'Heavy-duty long reach for large workspaces, palletizing and handling.',
        },
      },
    ],
  },
  {
    id: 'r-ultra',
    displayName: 'r-Ultra',
    originalSeries: 'FR30 Series',
    basePayload: '30kg',
    baseReach: '1402mm',
    variants: [
      {
        id: 'fr30-std',
        name: 'Standard',
        payload: '30kg（最大 35kg）',
        reach: '1402mm',
        repeatability: '±0.1mm',
        weight: '≈85kg',
        dof: '6',
        ipRating: 'IP54（可选 IP65）',
        avgPower: '600W',
        peakPower: '910W',
        tcpSpeed: '2m/s',
        voltage: 'DC 24V / 48V',
        noise: '<70dB',
        mounting: { zh: '任何方向', en: 'Any orientation' },
        humidity: '90%RH（非凝结）',
        temperature: '0–45℃',
        footprint: '240×240mm',
        ioPorts: 'DI 2 / DO 2 / AI 1 / AO 1',
        toolPower: '24V / 1.5A',
        materials: { zh: '铝、钢', en: 'Aluminum, steel' },
        powerTestNote: {
          zh: 'r-Ultra 负载测试：30kg，Z 轴：200mm',
          en: 'r-Ultra payload test: 30kg, Z-axis: 200mm',
        },
        axes: {
          base: { range: '±175°', speed: '120°/s' },
          shoulder: { range: '+85° / −265°', speed: '120°/s' },
          elbow: { range: '±160°', speed: '120°/s' },
          wrist1: { range: '+85° / −265°', speed: '180°/s' },
          wrist2: { range: '±175°', speed: '180°/s' },
          wrist3: { range: '±175°', speed: '180°/s' },
        },
        description: {
          zh: '30kg 级旗舰负载协作臂。',
          en: '30 kg class flagship cobot.',
        },
      },
    ],
  },
];

/** 扁平索引：按 variant `id` 快速取整条规格 */
export const robotVariantById: Record<string, RobotVariant> = Object.fromEntries(
  rSeriesData.flatMap((f) => f.variants.map((v) => [v.id, v])),
);

export const ROBOT_IMG_BASE = '/images/robots';
export const ROBOT_VECTOR_BASE = '/images/robots/_vectors';

/** 含 3D hero 的 `.glb`，命名：`{rfamily}-cobot-{型号干名}.glb`（与 public 一致） */
export const cobotGlbModels = {
  /** r-Lite 线（FR3-C）首页 / `/cobots/r-lite` / 选型向导 hero */
  rLiteFr3C: '/models/r-lite-cobot-fr3-c.glb',
  /** r-Lite FR3-C 首页 AR（1:1 米制；点击 AR 后懒加载，不参与首屏 preload） */
  rLiteFr3CArGlb: '/models/r-lite-cobot-fr3-c-ar.glb',
  /** r-Lite FR3-C iOS Quick Look AR */
  rLiteFr3CArUsdz: '/models/r-lite-cobot-fr3-c.usdz',
  /** r-Ultra 线（FR30）首页 / `/cobots/r-ultra` hero */
  rUltraFr30: '/models/r-ultra-cobot-fr30.glb',
  /** r-Ultra FR30 首页 / 沉浸页 AR（Android Scene Viewer；1:1 米制） */
  rUltraFr30ArGlb: '/models/r-ultra-cobot-fr30-ar.glb',
  /** r-Ultra FR30 iOS Quick Look AR */
  rUltraFr30ArUsdz: '/models/r-ultra-cobot-fr30.usdz',
} as const;

/** r-Lite 法兰三特征段静态主视觉（WebP，与 `public/images/robots/` 命名一致） */
export const R_LITE_ADVISOR_FLANGE_HERO_IMG =
  '/images/robots/r-lite-cobot-fr3-c-advisor-hero-flange.webp';

/** 与 `R_LITE_ADVISOR_FLANGE_HERO_IMG` 源文件像素一致（换图时请同步更新，供 hero 容器 aspect-ratio） */
export const R_LITE_ADVISOR_FLANGE_HERO_DIM = { width: 2828, height: 1430 } as const;

/** 全系列规格页 journey 区块裁切主视觉（自 `r-core-cobot-fr5-wml-hd.webp` 裁出） */
export const ALL_COBOTS_JOURNEY_HERO_IMG =
  '/images/robots/r-core-cobot-fr5-wml-hd-big.webp';

/** 与 `ALL_COBOTS_JOURNEY_HERO_IMG` 源文件像素一致 */
export const ALL_COBOTS_JOURNEY_HERO_DIM = { width: 1904, height: 1270 } as const;

/** @deprecated Use `R_LITE_ADVISOR_FLANGE_HERO_IMG` */
export const RCORE_ADVISOR_FLANGE_HERO_IMG = R_LITE_ADVISOR_FLANGE_HERO_IMG;

/** @deprecated Use `R_LITE_ADVISOR_FLANGE_HERO_DIM` */
export const RCORE_ADVISOR_FLANGE_HERO_DIM = R_LITE_ADVISOR_FLANGE_HERO_DIM;

/** 变体与 3D 模型路径映射（用于按型号分发 hero 模型） */
export const robotVariantModelPath: Partial<Record<string, string>> = {
  'fr3-c': cobotGlbModels.rLiteFr3C,
  'fr30-std': cobotGlbModels.rUltraFr30,
};

export function robotFamilyForVariant(variantId: string): RobotFamily {
  const fam = rSeriesData.find((f) => f.variants.some((v) => v.id === variantId));
  if (!fam) throw new Error(`Unknown robot variant id: ${variantId}`);
  return fam;
}

/** 公台文件名：`{displayName 小写}-cobot-{variantId}.webp`，如 `r-core-cobot-fr5-std.webp` */
export function robotVariantWebpFilename(variantId: string): string {
  const fam = robotFamilyForVariant(variantId);
  return `${fam.displayName.toLowerCase()}-cobot-${variantId}.webp`;
}

/** 营销高清实拍 WebP：与 `robotVariantWebpFilename` 同源，文件名后缀 `-hd.webp` */
export function robotVariantWebpHdFilename(variantId: string): string {
  return robotVariantWebpFilename(variantId).replace(/\.webp$/i, '-hd.webp');
}

/** 图纸 SVG 文件名：`{displayName 小写}-cobot-{variantId}.svg` */
export function robotVariantBlueprintSvgFilename(variantId: string): string {
  const fam = robotFamilyForVariant(variantId);
  return `${fam.displayName.toLowerCase()}-cobot-${variantId}.svg`;
}

/** 样册营销型号码：FR5、FR5-C、FR10…（`-std` 后缀省略） */
export function variantCatalogModelCode(variantId: string): string {
  const upper = variantId.toUpperCase();
  return upper.endsWith('-STD') ? upper.slice(0, -4) : upper;
}

/** 访客可见机型行（r-Lite · WMS），与蓝图/Schema 命名一致 */
export function rooollCatalogModelCode(variantId: string, lang: 'zh' | 'en' = 'en'): string {
  return robotVariantBlueprintModelName(variantId, lang);
}

/** 控制箱「适配机器人」行：由 variant id 派生 r-Lite / r-Core 公开名 */
export function controllerApplicableRobotsText(
  spec: Pick<ControllerSpec, 'applicableVariantIds'>,
  lang: 'zh' | 'en',
): string {
  const sep = lang === 'zh' ? '、' : ', ';
  return spec.applicableVariantIds.map((id) => rooollCatalogModelCode(id, lang)).join(sep);
}

export function descriptionSnippet(text: string, lang: 'zh' | 'en'): string {
  const t = text.trim();
  if (!t) return lang === 'zh' ? '工业协作自动化场景' : 'industrial cobot automation';
  const parts = lang === 'zh' ? t.split(/[。.]/) : t.split('.');
  const snip = (parts[0] ?? t).trim();
  return snip.length > 140 ? `${snip.slice(0, 137)}…` : snip;
}

/**
 * 规格参数字符串英文规范化（数据源层）。
 * 样册字段以中文术语录入；英文界面统一替换，避免中英混杂。
 */
export function robotSpecDisplayText(text: string, lang: 'zh' | 'en'): string {
  if (lang === 'zh' || !text) return text;
  return text
    .replace(/（瞬时\s+/g, ' (peak ')
    .replace(/（最大\s+/g, ' (max ')
    .replace(/（可选\s+/g, ' (optional ')
    .replace(/（非凝结）/g, ' (non-condensing)')
    .replace(/（/g, ' (')
    .replace(/）/g, ')')
    .replace(/；/g, '; ')
    .replace(/\s+\)/g, ')')
    .replace(/\(\s+/g, '(')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** 英文界面：环境行温湿度分隔符 */
export function robotSpecEnvironmentText(temperature: string, humidity: string, lang: 'zh' | 'en'): string {
  const sep = lang === 'zh' ? '；' : '; ';
  return `${robotSpecDisplayText(temperature, lang)}${sep}${robotSpecDisplayText(humidity, lang)}`;
}

/** Locale alt key: `r_core_fr5_std`, `r_lite_fr3_c`, etc. */
function variantAltLocaleKey(variantId: string): string {
  const fam = robotFamilyForVariant(variantId).displayName.replace(/-/g, '_').toLowerCase();
  const variant = variantId.replace(/-/g, '_').toLowerCase();
  return `${fam}_${variant}`;
}

function blueprintLocaleSection(lang: 'zh' | 'en') {
  return lang === 'zh' ? zhLocale.alt : enLocale.alt;
}

function variantPublicNameRaw(v: RobotVariant, lang: 'zh' | 'en'): string {
  if (v.shortName) return lang === 'zh' ? v.shortName.zh : v.shortName.en;
  return v.name;
}

function robotVariantPublicShortLabel(variantId: string, lang: 'zh' | 'en'): string {
  const v = robotVariantById[variantId];
  return rooollVariantShortLabel(variantPublicNameRaw(v, lang));
}

/** 蓝图 / 无障碍对外机型行：r 系列产品线 + 变体短名（无 FR 型号码）。 */
export function robotVariantBlueprintModelName(variantId: string, lang: 'zh' | 'en'): string {
  const fam = robotFamilyForVariant(variantId);
  const short = robotVariantPublicShortLabel(variantId, lang);
  if (lang === 'zh') {
    return short ? `${fam.displayName} · ${short}` : fam.displayName;
  }
  return short ? `${fam.displayName} · ${short}` : fam.displayName;
}

const BLUEPRINT_FALLBACK_ALT = {
  zh: '{{modelName}} 协作机器人技术规格工程示意图（technical schematic）：展示工作半径与结构外形要点。',
  en: 'Technical schematic of {{modelName}} showing arm reach and structural details.',
} as const;

const BLUEPRINT_FALLBACK_DESC = {
  zh: '{{modelName}} 协作机器人技术图纸与技术示意图（technical drawing / schematic / blueprint），包含工作半径 {{reach}}、关节包络与外形尺寸标注（dimensions），供工程设计参考。',
  en: 'Engineering blueprint and technical drawing of {{modelName}} collaborative robotic arm: {{reach}} working radius, schematic views with joint limits, footprint, and dimension callouts for mechanical integration.',
} as const;

function applyBlueprintTemplate(template: string, modelName: string, reach: string): string {
  return template
    .replace(/\{\{\s*modelName\s*\}\}/gi, modelName)
    .replace(/\{\{\s*reach\s*\}\}/gi, reach);
}

/** 清除文案里意外出现的内部 variant id（如 URL 暴露 fr3），避免替代公开机型名 */
function sanitizeBlueprintLeak(text: string, variantId: string, publicLabel: string): string {
  if (!variantId.trim() || !text) return text;
  const escaped = variantId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escaped, 'gi'), publicLabel);
}

type AltJson = (typeof enLocale)['alt'];

/**
 * 技术图纸 `<object>` 专用短标签（与 `robotVariantImageAlt` 产品缩略图语义分离）。
 * - `{{modelName}}` 一律解析为公开机型行（产品线 + FR 型号码），从不插入 `variantId`。
 * - 可选 `alt.variant_blueprints`：仅允许与 `variant_images` 相同的 **locale key**（如 `r_lite_fr3_std`），字符串可含占位符。
 */
export function robotVariantBlueprintAlt(variantId: string, lang: 'zh' | 'en'): string {
  const alt = blueprintLocaleSection(lang) as AltJson & {
    variant_blueprints?: Record<string, string>;
    blueprint_alt?: string;
  };
  const key = variantAltLocaleKey(variantId);
  const override = alt.variant_blueprints?.[key];
  const v = robotVariantById[variantId];
  const publicModelName = v
    ? robotVariantBlueprintModelName(variantId, lang)
    : lang === 'zh'
      ? '协作机器人'
      : 'Roooll collaborative robot arm';
  const reach = v?.reach ?? '';

  const tmplRaw = typeof alt.blueprint_alt === 'string' ? alt.blueprint_alt.trim() : '';
  const tmpl = tmplRaw || (lang === 'zh' ? BLUEPRINT_FALLBACK_ALT.zh : BLUEPRINT_FALLBACK_ALT.en);

  let out: string;
  if (typeof override === 'string' && override.trim()) {
    out = applyBlueprintTemplate(override.trim(), publicModelName, reach);
  } else {
    out = applyBlueprintTemplate(tmpl, publicModelName, reach);
  }

  out = sanitizeBlueprintLeak(out, variantId, publicModelName).trim();

  if (!out) {
    out =
      lang === 'zh'
        ? `${publicModelName} 协作机器人技术示意图`
        : `Technical schematic of ${publicModelName}`;
  }

  return out;
}

/**
 * 图纸补充说明：`alt.blueprint_description`；可选 `alt.variant_blueprint_descriptions` 覆盖（同 locale key 规则）。
 */
export function robotVariantBlueprintDescription(variantId: string, lang: 'zh' | 'en'): string {
  const alt = blueprintLocaleSection(lang) as AltJson & {
    variant_blueprint_descriptions?: Record<string, string>;
    blueprint_description?: string;
  };
  const key = variantAltLocaleKey(variantId);
  const override = alt.variant_blueprint_descriptions?.[key];
  const v = robotVariantById[variantId];
  const publicModelName = v
    ? robotVariantBlueprintModelName(variantId, lang)
    : lang === 'zh'
      ? '协作机器人'
      : 'Roooll collaborative robot arm';
  const reach = v?.reach ?? '';

  const tmplRaw = typeof alt.blueprint_description === 'string' ? alt.blueprint_description.trim() : '';
  const tmpl =
    tmplRaw || (lang === 'zh' ? BLUEPRINT_FALLBACK_DESC.zh : BLUEPRINT_FALLBACK_DESC.en);

  let out: string;
  if (typeof override === 'string' && override.trim()) {
    out = applyBlueprintTemplate(override.trim(), publicModelName, reach);
  } else {
    out = applyBlueprintTemplate(tmpl, publicModelName, reach);
  }

  out = sanitizeBlueprintLeak(out, variantId, publicModelName).trim();

  if (!out) {
    out =
      lang === 'zh'
        ? `${publicModelName} 技术图纸与尺寸说明`
        : `Engineering schematic and dimensional drawing — ${publicModelName}`;
  }

  return out;
}

/** `<Image alt>` / 无障碍：r 系列名 + 型号 + 数据摘用途 */
export function robotVariantImageAlt(variantId: string, lang: 'zh' | 'en'): string {
  const localeAlt = (lang === 'zh' ? zhLocale.alt.variant_images : enLocale.alt.variant_images) as
    | Record<string, string>
    | undefined;
  const mapped = localeAlt?.[variantAltLocaleKey(variantId)] ?? localeAlt?.[variantId];
  if (mapped) return mapped;

  const v = robotVariantById[variantId];
  if (!v) return lang === 'zh' ? '协作机器人机械臂' : 'Collaborative robot arm';
  const fam = robotFamilyForVariant(variantId);
  const short = robotVariantPublicShortLabel(variantId, lang);
  const purpose = descriptionSnippet(lang === 'zh' ? v.description.zh : v.description.en, lang);
  if (lang === 'zh') {
    const line = short ? `${fam.displayName}（${short}）` : fam.displayName;
    return `${line}协作机器人机械臂，适用于 ${purpose}`;
  }
  const line = short ? `${fam.displayName} (${short})` : fam.displayName;
  return `${line} Collaborative Robot Arm for ${purpose}`;
}

/** 与 `robotVariantById` 的 id 一一对应；站点 UI 统一使用营销高清 `-hd.webp` */
export const robotVariantImageUrl: Record<string, string> = Object.fromEntries(
  Object.keys(robotVariantById).map((id) => [
    id,
    `${ROBOT_IMG_BASE}/${robotVariantWebpHdFilename(id)}`,
  ]),
) as Record<string, string>;

/** 与 `robotVariantById` 一一对应；SVG 图纸放在 `public/images/robots/_vectors` */
export const robotVariantBlueprintSvgUrl: Record<string, string> = Object.fromEntries(
  Object.keys(robotVariantById).map((id) => [
    id,
    `${ROBOT_VECTOR_BASE}/${robotVariantBlueprintSvgFilename(id)}`,
  ]),
) as Record<string, string>;

/** 扁平索引：按显示型号名（如 FR3、FR5-WML）模糊匹配首条 variant */
export function findVariantByModelName(name: string): RobotVariant | undefined {
  const key = name.trim().toUpperCase().replace(/\s+/g, '');
  for (const family of rSeriesData) {
    const hit = family.variants.find(
      (v) =>
        v.id.toUpperCase().includes(key) ||
        family.originalSeries.toUpperCase().includes(key) ||
        v.name.toUpperCase().includes(key),
    );
    if (hit) return hit;
  }
  return undefined;
}

export const specLabels = {
  payload: { zh: '负载(额定/最大)', en: 'Payload (rated/max)' },
  reach: { zh: '工作半径', en: 'Working radius' },
  repeatability: { zh: '重复定位精度', en: 'Repeatability' },
  weight: { zh: '机器自重', en: 'Weight' },
  ip: { zh: '防护等级', en: 'IP rating' },
  power: { zh: '功率(平均/峰值)', en: 'Power (avg/peak)' },
  tcpSpeed: { zh: '典型 TCP 速度', en: 'Typical TCP speed' },
  io: { zh: '末端 I/O', en: 'Tool I/O' },
  voltage: { zh: '额定电压', en: 'Voltage' },
  environment: { zh: '温湿度要求', en: 'Temperature / humidity' },
  footprint: { zh: '底座尺寸', en: 'Footprint' },
  materials: { zh: '设备材料', en: 'Materials' },
  axes: { zh: '单轴运动参数', en: 'Axis movement' },
  axisLabels: {
    base: { zh: '基座 J1', en: 'Base J1' },
    shoulder: { zh: '肩部 J2', en: 'Shoulder J2' },
    elbow: { zh: '肘部 J3', en: 'Elbow J3' },
    wrist1: { zh: '腕部 J4', en: 'Wrist J4' },
    wrist2: { zh: '腕部 J5', en: 'Wrist J5' },
    wrist3: { zh: '腕部 J6', en: 'Wrist J6' },
  },
} as const;
