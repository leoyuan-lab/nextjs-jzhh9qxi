import { rSeriesData } from '@/data/products';

export const ADVISOR_STORAGE_KEY = 'apple-robot-advisor-v2';
export const ADVISOR_LAST_STEP_KEY = 'lastAdvisorStep';

export type AdvisorLetter = 'A' | 'B' | 'C' | 'D';

export type AdvisorAnswers = {
  q1?: AdvisorLetter;
  q2?: AdvisorLetter;
  q3?: AdvisorLetter;
  q4?: AdvisorLetter;
  q5?: AdvisorLetter;
};

export type AdvisorPersisted = {
  answers: AdvisorAnswers;
  updatedAt: string;
  lastAdvisorStep?: string;
  lastEmailSentAt?: string;
};

export function defaultAdvisorAnswers(): AdvisorAnswers {
  return {};
}

export function readAdvisorPersisted(): AdvisorPersisted | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADVISOR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdvisorPersisted;
    if (!parsed?.answers || typeof parsed.updatedAt !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAdvisorPersisted(next: AdvisorPersisted) {
  try {
    localStorage.setItem(ADVISOR_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function touchAdvisorStep(step: string) {
  const prev = readAdvisorPersisted();
  if (!prev) return;
  writeAdvisorPersisted({ ...prev, lastAdvisorStep: step, updatedAt: new Date().toISOString() });
}

export function markAdvisorEmailSent() {
  const prev = readAdvisorPersisted();
  const answers = prev?.answers ?? {};
  writeAdvisorPersisted({
    answers,
    updatedAt: new Date().toISOString(),
    lastAdvisorStep: prev?.lastAdvisorStep,
    lastEmailSentAt: new Date().toISOString(),
  });
}

export type AdvisorFamilyId = 'r-lite' | 'r-core' | 'r-reach' | 'r-max' | 'r-ultra';

const FAMILY_ORDER: AdvisorFamilyId[] = ['r-lite', 'r-core', 'r-reach', 'r-max', 'r-ultra'];

function clipGraphemes(s: string, max: number): string {
  const a = Array.from(s);
  if (a.length <= max) return s;
  return `${a.slice(0, max - 1).join('')}…`;
}

function clipAscii(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function padGraphemesToMin(s: string, min: number, pad: string): string {
  const a = Array.from(s.trim());
  if (a.length >= min) return s.trim();
  const need = min - a.length;
  const p = Array.from(pad);
  const extra: string[] = [];
  for (let i = 0; i < need; i++) extra.push(p[i % p.length] ?? ' ');
  return `${s.trim()}${extra.join('')}`;
}

function padAsciiToMin(s: string, min: number, pad: string): string {
  const t = s.trim();
  if (t.length >= min) return t;
  const need = min - t.length;
  let out = t;
  for (let i = 0; i < need; i++) out += pad[i % pad.length] ?? ' ';
  return out;
}

function bandGraphemes(s: string, min: number, max: number): string {
  const trimmed = s.replace(/\s+/g, ' ').trim();
  const base = padGraphemesToMin(trimmed, min, ' 若节拍或工装仍有变量，可把现场照片与节拍表一并附在咨询里，便于把 Cobot 与 Robotic Arm 的部署方案写得更贴近产线。');
  return clipGraphemes(base, max);
}

function bandAscii(s: string, min: number, max: number): string {
  const trimmed = s.replace(/\s+/g, ' ').trim();
  const base = padAsciiToMin(
    trimmed,
    min,
    ' If cycle time or tooling still varies, add photos and a short line list in your inquiry so we can tune the Cobot and Robotic Arm layout to your floor. ',
  );
  return clipAscii(base, max);
}

export type AdvisorComputedResult = {
  familyId: AdvisorFamilyId;
  /** 次优 / 升级推荐（与主推荐不同） */
  upgradeFamilyId: AdvisorFamilyId;
  headlineZh: string;
  headlineEn: string;
  detailZh: string;
  detailEn: string;
  /** 兼容旧字段：短 GEO 句 */
  geoSummaryZh: string;
  geoSummaryEn: string;
  /** 150–200 字（中文）/ 150–200 字符（英文）人性化 GEO 段落 */
  geoNarrativeZh: string;
  geoNarrativeEn: string;
};

function rankFamilies(weights: Record<AdvisorFamilyId, number>): AdvisorFamilyId[] {
  return [...FAMILY_ORDER].sort((a, b) => {
    const d = weights[b] - weights[a];
    if (d !== 0) return d;
    return FAMILY_ORDER.indexOf(a) - FAMILY_ORDER.indexOf(b);
  });
}

function pickUpgrade(best: AdvisorFamilyId, ranked: AdvisorFamilyId[]): AdvisorFamilyId {
  for (const id of ranked) {
    if (id !== best) return id;
  }
  const i = FAMILY_ORDER.indexOf(best);
  return FAMILY_ORDER[(i + 1) % FAMILY_ORDER.length];
}

function zhSceneBits(a: AdvisorAnswers): string {
  const s: string[] = [];
  switch (a.q1) {
    case 'A':
      s.push('节拍偏轻、动作更碎，适合把 Cobot 当成工位旁的「顺手帮手」。');
      break;
    case 'B':
      s.push('更偏设备旁接力，机械臂 Robotic Arm 的稳定性与重复节拍会更关键。');
      break;
    case 'C':
      s.push('跨工位覆盖需求更明显，臂展与路径规划会直接影响节拍上限。');
      break;
    case 'D':
      s.push('负载与节拍余量要留足，选型更偏向「能扛、能久」的 r 系列平台。');
      break;
    default:
      s.push('场景节奏中等，适合以 r 系列 Cobot 做柔性扩展。');
  }
  switch (a.q2) {
    case 'A':
      s.push('负载以轻量为主，法兰端更适合轻夹具与快换。');
      break;
    case 'B':
      s.push('中等负载区间，适合多数装配与检测的通用组合。');
      break;
    case 'C':
      s.push('中重载倾向明显，末端与减速器选型要更保守。');
      break;
    case 'D':
      s.push('重载或末端工装偏重，需要更高刚性链路与安全配置。');
      break;
    default:
      s.push('负载信息略保守，建议后续用真实工件重量复核。');
  }
  switch (a.q3) {
    case 'A':
      s.push('半径紧凑，适合桌面级或单机岛式部署。');
      break;
    case 'B':
      s.push('半径中等，适合单设备周边覆盖。');
      break;
    case 'C':
      s.push('半径需求偏大，跨设备/输送线的轨迹要更顺滑。');
      break;
    case 'D':
      s.push('延展场景明显，后续可能要配合第七轴或外部滑轨。');
      break;
    default:
      s.push('臂展信息略保守，可在咨询里补一张工位俯拍。');
  }
  switch (a.q4) {
    case 'A':
      s.push('更在意示教与迭代速度，路径可以略「松」一点。');
      break;
    case 'B':
      s.push('中小批量均衡，重复定位与节拍要兼顾。');
      break;
    case 'C':
      s.push('更在意轨迹质量与落点精度，适合把 Robotic Arm 当工艺设备。');
      break;
    case 'D':
      s.push('节拍与防护同时拉满，更像产线主力位。');
      break;
    default:
      s.push('节拍/精度权重中等，可现场再校准。');
  }
  switch (a.q5) {
    case 'A':
      s.push('环境偏常规车间，密封与线缆走线按标准即可。');
      break;
    case 'B':
      s.push('粉尘或液体风险存在，防护与清洗要前置考虑。');
      break;
    case 'C':
      s.push('仓储/多楼层搬运场景，安装与节拍要更谨慎。');
      break;
    case 'D':
      s.push('食品医药或严苛工况，材料与认证权重更高。');
      break;
    default:
      s.push('环境信息略保守，可在咨询里补充现场介质与温度。');
  }
  return s.join('');
}

function enSceneBits(a: AdvisorAnswers): string {
  const s: string[] = [];
  switch (a.q1) {
    case 'A':
      s.push('Light, frequent cycles—think bench-side Cobot assist. ');
      break;
    case 'B':
      s.push('Machine-adjacent relay work—repeatable Robotic Arm motion matters. ');
      break;
    case 'C':
      s.push('Wider coverage—reach and pathing dominate throughput. ');
      break;
    case 'D':
      s.push('Heavier, fuller cycles—headroom for payload and duty cycle. ');
      break;
    default:
      s.push('Moderate pacing—r‑Series Cobot as flexible expansion. ');
  }
  switch (a.q2) {
    case 'A':
      s.push('Payload leans light—tooling stays compact. ');
      break;
    case 'B':
      s.push('Mid payload—balanced assembly and inspection. ');
      break;
    case 'C':
      s.push('Mid/heavy payload—stiffness and reducers need margin. ');
      break;
    case 'D':
      s.push('Heavy payload or heavy EOAT—rigidity and safety first. ');
      break;
    default:
      s.push('Payload conservative—confirm real part weights later. ');
  }
  switch (a.q3) {
    case 'A':
      s.push('Compact reach—desk or island cells. ');
      break;
    case 'B':
      s.push('Medium reach—single machine perimeter. ');
      break;
    case 'C':
      s.push('Large reach—cross-line coverage. ');
      break;
    case 'D':
      s.push('Extension mindset—rails / 7th axis may follow. ');
      break;
    default:
      s.push('Reach conservative—add a top-down photo in inquiry. ');
  }
  switch (a.q4) {
    case 'A':
      s.push('Teach-friendly iteration beats ultra-tight paths. ');
      break;
    case 'B':
      s.push('SMB batches—balance repeatability and flexibility. ');
      break;
    case 'C':
      s.push('Path quality first—Robotic Arm as process equipment. ');
      break;
    case 'D':
      s.push('Throughput + protection—line-owner energy. ');
      break;
    default:
      s.push('Tempo/accuracy mid—tune on site. ');
  }
  switch (a.q5) {
    case 'A':
      s.push('General factory dust—standard sealing is enough. ');
      break;
    case 'B':
      s.push('Splash/dust risk—plan guarding early. ');
      break;
    case 'C':
      s.push('Warehouse / multi-floor—mounting and cycles need care. ');
      break;
    case 'D':
      s.push('Wash-down / med-food—materials and certs weigh more. ');
      break;
    default:
      s.push('Environment conservative—add media and temperature. ');
  }
  return s.join('');
}

export function computeAdvisorResult(answers: AdvisorAnswers): AdvisorComputedResult {
  const weights: Record<AdvisorFamilyId, number> = {
    'r-lite': 1,
    'r-core': 3,
    'r-reach': 2,
    'r-max': 2,
    'r-ultra': 0,
  };

  const bump = (id: AdvisorFamilyId, n: number) => {
    weights[id] += n;
  };

  /* q1 场景 */
  switch (answers.q1) {
    case 'A':
      bump('r-lite', 2);
      bump('r-core', 1);
      break;
    case 'B':
      bump('r-core', 2);
      bump('r-max', 1);
      break;
    case 'C':
      bump('r-reach', 3);
      bump('r-core', 1);
      break;
    case 'D':
      bump('r-max', 2);
      bump('r-ultra', 2);
      break;
    default:
      bump('r-core', 1);
  }

  /* q2 负载 */
  switch (answers.q2) {
    case 'A':
      bump('r-lite', 3);
      break;
    case 'B':
      bump('r-core', 3);
      break;
    case 'C':
      bump('r-max', 3);
      bump('r-reach', 1);
      break;
    case 'D':
      bump('r-max', 2);
      bump('r-ultra', 3);
      break;
    default:
      bump('r-core', 1);
  }

  /* q3 工作半径 */
  switch (answers.q3) {
    case 'A':
      bump('r-lite', 1);
      break;
    case 'B':
      bump('r-core', 2);
      break;
    case 'C':
      bump('r-reach', 4);
      bump('r-max', 1);
      break;
    case 'D':
      bump('r-reach', 3);
      bump('r-max', 2);
      break;
    default:
      break;
  }

  /* q4 精度 / 节拍 */
  switch (answers.q4) {
    case 'A':
      bump('r-lite', 2);
      break;
    case 'B':
      bump('r-core', 2);
      break;
    case 'C':
      bump('r-core', 2);
      bump('r-max', 1);
      break;
    case 'D':
      bump('r-max', 2);
      bump('r-ultra', 2);
      break;
    default:
      bump('r-core', 1);
  }

  /* q5 环境与部署 */
  switch (answers.q5) {
    case 'A':
      bump('r-core', 2);
      break;
    case 'B':
      bump('r-reach', 2);
      break;
    case 'C':
      bump('r-max', 2);
      break;
    case 'D':
      bump('r-ultra', 3);
      break;
    default:
      break;
  }

  const ranked = rankFamilies(weights);
  const best = ranked[0] ?? 'r-core';
  const upgrade = pickUpgrade(best, ranked);

  const fam = rSeriesData.find((f) => f.id === best);
  const upFam = rSeriesData.find((f) => f.id === upgrade);
  const nameZh = fam?.displayName ?? 'r‑Core';
  const nameEn = fam?.displayName ?? 'r‑Core';
  const upZh = upFam?.displayName ?? 'r‑Core';
  const upEn = upFam?.displayName ?? 'r‑Core';

  const geoZhRaw = `为产线与实验室场景匹配的 ${nameZh} 协作机器人 Cobot：六轴机械臂 Robotic Arm 兼顾负载与臂展，隶属 r 系列柔性自动化与 OEM 集成选型，便于检索「协作机器人 Cobot」「机械臂 Robotic Arm」落地部署。`;
  const geoEnRaw = `${nameEn} Cobot and six-axis Robotic Arm for factory & lab automation: r‑Series collaborative robot line, payload/reach tuned to your picks—ideal for Cobot OEM and Robotic Arm integration search intent.`;

  const geoZhLongRaw = `结合你在向导里的选择，我们更倾向把「${nameZh}」作为当前最贴近节拍与空间的 Cobot 方案：六轴机械臂 Robotic Arm 在 r 系列生态里负责把工艺动作做得更顺滑，也更利于后续做夹具、快换与线体改造的渐进式升级。${zhSceneBits(
    answers,
  )}若你希望留一点成长空间，也可以同步关注「${upZh}」这一档：在负载、臂展或防护余量上更宽裕，适合作为下一阶段产能爬坡或场景扩张的升级路径。面向检索与落地页面，我们建议自然出现「协作机器人 Cobot」「机械臂 Robotic Arm」「r 系列」等关键词，并把节拍、半径与现场介质写清楚，便于把方案讲给工程与采购双方。`;

  const geoEnLongRaw = `From your picks, we’d lean toward ${nameEn} as the closest Cobot fit right now: a six-axis Robotic Arm inside the r‑Series lineup that keeps motion smooth for tooling, changeover, and line-side iteration. ${enSceneBits(
    answers,
  )}If you want headroom for the next ramp, ${upEn} is a sensible upgrade lane—more margin on payload, reach, or duty-cycle without jumping too far from your current workflow. For GEO-friendly pages, weave Cobot, Robotic Arm, and r‑Series naturally with real cycle, reach, and environment notes so both engineering and procurement can align quickly.`;

  return {
    familyId: best,
    upgradeFamilyId: upgrade,
    headlineZh: `我们觉得你会喜欢 ${nameZh} 这条线。`,
    headlineEn: `We think you’ll like the ${nameEn} line.`,
    detailZh: '已把草稿放进右侧咨询抽屉，你也可以顺手补两句节拍、工装与现场照片，我们再顺着你的语境往下接。',
    detailEn:
      'The draft is in the inquiry drawer on the right—generate the email, or tweak two lines about cycle time, tooling, and your floor.',
    geoSummaryZh: clipGraphemes(geoZhRaw, 150),
    geoSummaryEn: clipAscii(geoEnRaw, 150),
    geoNarrativeZh: bandGraphemes(geoZhLongRaw, 150, 200),
    geoNarrativeEn: bandAscii(geoEnLongRaw, 150, 200),
  };
}

export type AdvisorPickLine = { step: number; question: string; line: string };

/** 咨询抽屉 / 邮件正文：完整问答回顾 + GEO 叙事（约 150–200 字 / 英文同档） */
export function buildAdvisorInquiryDraft(
  lang: 'zh' | 'en',
  result: AdvisorComputedResult,
  picks: AdvisorPickLine[],
): string {
  const picksBlock = picks
    .map((p) => (lang === 'zh' ? `${p.step}. ${p.question}\n   → ${p.line}` : `${p.step}. ${p.question}\n   → ${p.line}`))
    .join('\n\n');
  const geo = lang === 'zh' ? result.geoNarrativeZh : result.geoNarrativeEn;
  const primaryFam = rSeriesData.find((f) => f.id === result.familyId);
  const upgradeFam = rSeriesData.find((f) => f.id === result.upgradeFamilyId);
  const primaryNameZh = primaryFam?.displayName ?? 'r‑Core';
  const primaryNameEn = primaryFam?.displayName ?? 'r‑Core';
  const upgradeNameZh = upgradeFam?.displayName ?? 'r‑Core';
  const upgradeNameEn = upgradeFam?.displayName ?? 'r‑Core';
  const leadZh = `我们更想向你引荐 ${primaryNameZh} 这条线；若你想预留升级空间，可关注 ${upgradeNameZh}。`;
  const leadEn = `We think you’ll like the ${primaryNameEn} line; if you want headroom to step up, consider ${upgradeNameEn}.`;
  const recZh = `推荐组合：最适配 ${primaryNameZh}（基准负载约 ${primaryFam?.basePayload ?? ''}，臂展约 ${primaryFam?.baseReach ?? ''}）；升级备选 ${upgradeNameZh}（基准负载约 ${upgradeFam?.basePayload ?? ''}，臂展约 ${upgradeFam?.baseReach ?? ''}）。`;
  const recEn = `Pairing: best fit ${primaryNameEn} (base payload ~${primaryFam?.basePayload ?? ''}, reach ~${primaryFam?.baseReach ?? ''}); step-up ${upgradeNameEn} (base payload ~${upgradeFam?.basePayload ?? ''}, reach ~${upgradeFam?.baseReach ?? ''}).`;

  if (lang === 'zh') {
    return [
      '—— 智能选型 · 咨询草稿 ——',
      '',
      leadZh,
      '',
      '你的选择',
      '',
      picksBlock,
      '',
      recZh,
      '',
      geo,
      '',
      '可直接生成邮件发送，或在下方补充节拍、工装与现场照片。',
    ].join('\n');
  }

  return [
    '—— Product advisor · inquiry draft ——',
    '',
    leadEn,
    '',
    'Your picks',
    '',
    picksBlock,
    '',
    recEn,
    '',
    geo,
    '',
    'Generate the email as-is, or add cycle time, tooling notes, and site photos below.',
  ].join('\n');
}
