import type { RobotVariant } from '@/data/products';
import { robotSpecDisplayText, robotVariantById } from '@/data/products';
import type { RCoreLiteVariantId } from '@/lib/rcore-lite-page-config';

export type RCoreSpecRowKey =
  | 'payload'
  | 'reach'
  | 'repeatability'
  | 'weight'
  | 'ipRating'
  | 'tcpSpeed'
  | 'dof'
  | 'controller';

export type RCoreSpecRow = {
  key: RCoreSpecRowKey;
  value: string;
};

export type RCoreFullSpecRow = {
  label: string;
  value: string;
};

type RowLabels = Record<RCoreSpecRowKey, string> & {
  controllerIntegrated: string;
  controllerExternal: string;
};

function specText(text: string, lang: 'zh' | 'en'): string {
  return robotSpecDisplayText(text, lang);
}

function controllerLabel(variantId: RCoreLiteVariantId, labels: RowLabels): string {
  return variantId === 'fr5-c' ? labels.controllerIntegrated : labels.controllerExternal;
}

export function rCoreWheelRows(
  variantId: RCoreLiteVariantId,
  labels: RowLabels,
  lang: 'zh' | 'en',
): RCoreSpecRow[] {
  const v = robotVariantById[variantId] as RobotVariant;
  return [
    { key: 'payload', value: specText(v.payload, lang) },
    { key: 'reach', value: specText(v.reach, lang) },
    { key: 'repeatability', value: specText(v.repeatability, lang) },
    { key: 'weight', value: specText(v.weight, lang) },
    { key: 'ipRating', value: specText(v.ipRating, lang) },
    { key: 'tcpSpeed', value: specText(v.tcpSpeed, lang) },
    { key: 'dof', value: specText(v.dof, lang) },
    { key: 'controller', value: specText(controllerLabel(variantId, labels), lang) },
  ];
}

export function rCoreFullSpecRows(
  variantId: RCoreLiteVariantId,
  lang: 'zh' | 'en',
  modelName: string,
): RCoreFullSpecRow[] {
  const v = robotVariantById[variantId] as RobotVariant;
  const mounting = v.mounting[lang];
  const materials = v.materials?.[lang];
  const powerNote = v.powerTestNote?.[lang];
  const desc = v.description[lang];
  const d = (text: string) => specText(text, lang);

  const rows: RCoreFullSpecRow[] = [
    { label: lang === 'zh' ? '型号' : 'Model', value: modelName },
    { label: lang === 'zh' ? '额定负载' : 'Rated payload', value: d(v.payload) },
    { label: lang === 'zh' ? '臂展' : 'Reach', value: d(v.reach) },
    { label: lang === 'zh' ? '重复定位' : 'Repeatability', value: d(v.repeatability) },
    { label: lang === 'zh' ? '本体重量' : 'Arm weight', value: d(v.weight) },
    { label: lang === 'zh' ? '自由度' : 'DOF', value: d(v.dof) },
    { label: lang === 'zh' ? '防护等级' : 'IP rating', value: d(v.ipRating) },
    { label: lang === 'zh' ? '平均功率' : 'Average power', value: d(v.avgPower) },
    { label: lang === 'zh' ? '峰值功率' : 'Peak power', value: d(v.peakPower) },
    { label: lang === 'zh' ? 'TCP 速度' : 'TCP speed', value: d(v.tcpSpeed) },
    { label: lang === 'zh' ? '供电' : 'Voltage', value: d(v.voltage) },
    { label: lang === 'zh' ? '噪声' : 'Noise', value: d(v.noise) },
    { label: lang === 'zh' ? '安装方式' : 'Mounting', value: mounting },
    { label: lang === 'zh' ? '湿度' : 'Humidity', value: d(v.humidity) },
    { label: lang === 'zh' ? '工作温度' : 'Temperature', value: d(v.temperature) },
    { label: lang === 'zh' ? '占地' : 'Footprint', value: d(v.footprint) },
    { label: lang === 'zh' ? 'I/O' : 'I/O ports', value: d(v.ioPorts) },
    { label: lang === 'zh' ? '工具供电' : 'Tool power', value: d(v.toolPower) },
  ];

  if (materials) rows.push({ label: lang === 'zh' ? '材料' : 'Materials', value: materials });
  if (powerNote) rows.push({ label: lang === 'zh' ? '功率测试条件' : 'Power test note', value: powerNote });
  rows.push({ label: lang === 'zh' ? '概述' : 'Overview', value: desc });

  return rows;
}
