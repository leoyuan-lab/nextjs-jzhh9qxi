// data/products.ts — 协作机器人 FR 系列规格与配件摘要（站内统一数据源）

import enLocale from '@/locales/en.json';
import zhLocale from '@/locales/zh.json';

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
    'FR3（可选镜像版本）、FR3-C、FR3-WMS、FR3-WML、FR5、FR5-C、FR5-WML、FR10、FR16、FR20、FR30',
  frSeriesModelsEn:
    'FR3 (optional mirror), FR3-C, FR3-WMS, FR3-WML, FR5, FR5-C, FR5-WML, FR10, FR16, FR20, FR30',
  certificationsZh:
    '质量管理体系：ISO 9001。产品认证：CR, CE, KCs, NRTL, RoHS 2.0, NSF, SEMI, IP65。ISO 功能安全：ISO 10218, ISO 13849, ISO 15066。',
  certificationsEn:
    'Quality: ISO 9001. Product: CR, CE, KCs, NRTL, RoHS 2.0, NSF, SEMI, IP65. Functional safety: ISO 10218, ISO 13849, ISO 15066.',
  productVision: {
    modularization: { zh: '模块化', en: 'Modularization' },
    quickDeployment: { zh: '快部署', en: 'Quick deployment' },
    easyOperation: { zh: '易操作', en: 'Easy operation' },
  },
} as const;

/** 控制箱规格（样册「控制箱规格参数」表格摘要） */
export const controllerSpecs = {
  noteIntegrated: {
    zh: 'FR3-C 与 FR5-C 控制箱集成在机器人底座。',
    en: 'FR3-C & FR5-C: controller integrated in the robot base.',
  },
  rows: [
    {
      id: 'ctrl-a',
      powerSupply: '30–60VDC / 220VAC 10A 单相 50Hz / 100–240VAC 10A 单相 50–60Hz',
      outputPower: '48VDC / 42A max',
      applicableRobots: ['FR3', 'FR3-WMS', 'FR3-WML', 'FR5', 'FR5-WML', 'FR10', 'FR16'],
      ip: 'IP54',
      temp: '0–45℃',
      humidity: '90%RH (non-condensing)',
      io: 'DI 16 / DO 16 / AI 2 / AO 2 / 高速脉冲输入 2',
      ioPower: '24V / 1.5A',
      comm: 'TCP/IP、I/O、Modbus TCP/RTU',
    },
    {
      id: 'ctrl-b',
      powerSupply: '100–240VAC 16A 单相 50–60Hz / 30–60VDC',
      outputPower: '48VDC / 104A max',
      applicableRobots: ['FR20', 'FR30'],
      ip: 'IP54',
      temp: '0–45℃',
      humidity: '90%RH (non-condensing)',
      io: 'DI 16 / DO 16 / AI 2 / AO 2 / 高速脉冲输入 2',
      ioPower: '24V / 1.5A',
      comm: 'TCP/IP、I/O、Modbus TCP/RTU；可选 CC-Link IE Field Basic、Profinet、Ethernet/IP、EtherCAT',
    },
  ],
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
  certificate: 'CE 22.7131',
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
          zh: 'FR3 负载设置：3kg，Z 轴：18mm',
          en: 'FR3 payload setting: 3kg, Z-axis: 18mm',
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
          zh: 'FR3-C 负载设置：3kg，Z 轴：18mm',
          en: 'FR3-C payload setting: 3kg, Z-axis: 18mm',
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
          zh: 'FR3-WMS 负载设置：3kg，Z 轴：18mm',
          en: 'FR3-WMS payload setting: 3kg, Z-axis: 18mm',
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
          zh: 'FR3-WML 负载设置：3kg，Z 轴：18mm',
          en: 'FR3-WML payload setting: 3kg, Z-axis: 18mm',
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
          zh: 'FR5 负载设置：5kg，Z 轴：30mm',
          en: 'FR5 payload setting: 5kg, Z-axis: 30mm',
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
          zh: 'FR5-C 负载设置：4kg，Z 轴：30mm',
          en: 'FR5-C payload setting: 4kg, Z-axis: 30mm',
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
          zh: 'FR5-WML 负载设置：5kg，Z 轴：30mm',
          en: 'FR5-WML payload setting: 5kg, Z-axis: 30mm',
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
          zh: 'FR10 负载设置：10kg，Z 轴：60mm',
          en: 'FR10 payload setting: 10kg, Z-axis: 60mm',
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
        name: 'FR16',
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
          zh: 'FR16 负载设置：16kg，Z 轴：96mm',
          en: 'FR16 payload setting: 16kg, Z-axis: 96mm',
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
        name: 'FR20',
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
          zh: 'FR20 负载设置：20kg，Z 轴：120mm',
          en: 'FR20 payload setting: 20kg, Z-axis: 120mm',
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
          zh: 'FR30 负载设置：30kg，Z 轴：200mm',
          en: 'FR30 payload setting: 30kg, Z-axis: 200mm',
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

/** 含 3D hero 的 `.glb`，命名：`{rfamily}-cobot-{型号干名}.glb`（与 public 一致） */
export const cobotGlbModels = {
  /** r-Core 线（FR5）首页 / 详情 hero */
  rCoreFr5: '/models/r-core-cobot-fr5.glb',
  /** r-Max 线（FR20）首页 hero */
  rMaxFr20: '/models/r-max-cobot-fr20.glb',
} as const;

export function robotFamilyForVariant(variantId: string): RobotFamily {
  const fam = rSeriesData.find((f) => f.variants.some((v) => v.id === variantId));
  if (!fam) throw new Error(`Unknown robot variant id: ${variantId}`);
  return fam;
}

/** 公台文件名：`{displayName 小写}-cobot-{variantId}.png`，如 `r-core-cobot-fr5-std.png` */
export function robotVariantPngFilename(variantId: string): string {
  const fam = robotFamilyForVariant(variantId);
  return `${fam.displayName.toLowerCase()}-cobot-${variantId}.png`;
}

/** 样册营销型号码：FR5、FR5-C、FR10…（`-std` 后缀省略） */
export function variantCatalogModelCode(variantId: string): string {
  const upper = variantId.toUpperCase();
  return upper.endsWith('-STD') ? upper.slice(0, -4) : upper;
}

function descriptionSnippet(text: string, lang: 'zh' | 'en'): string {
  const t = text.trim();
  if (!t) return lang === 'zh' ? '工业协作自动化场景' : 'industrial cobot automation';
  const parts = lang === 'zh' ? t.split(/[。.]/) : t.split('.');
  const snip = (parts[0] ?? t).trim();
  return snip.length > 140 ? `${snip.slice(0, 137)}…` : snip;
}

/** Locale alt key: `r_core_fr5_std`, `r_lite_fr3_c`, etc. */
function variantAltLocaleKey(variantId: string): string {
  const fam = robotFamilyForVariant(variantId).displayName.replace(/-/g, '_').toLowerCase();
  const variant = variantId.replace(/-/g, '_').toLowerCase();
  return `${fam}_${variant}`;
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
  const code = variantCatalogModelCode(variantId);
  const purpose = descriptionSnippet(lang === 'zh' ? v.description.zh : v.description.en, lang);
  if (lang === 'zh') {
    return `${fam.displayName}（${code}）协作机器人机械臂，适用于 ${purpose}`;
  }
  return `${fam.displayName} (${code}) Collaborative Robot Arm for ${purpose}`;
}

/** 与 `robotVariantById` 的 id 一一对应；PNG 由 `scripts/robot_pdf_pipeline.py` 从样册生成 */
export const robotVariantImageUrl: Record<string, string> = Object.fromEntries(
  Object.keys(robotVariantById).map((id) => [
    id,
    `${ROBOT_IMG_BASE}/${robotVariantPngFilename(id)}`,
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
