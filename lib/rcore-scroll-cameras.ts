/** r-Core 沉浸卷轴：与 Advisor 首屏 / 本站首屏 hero 对齐的机位 */

export type RcoreCameraPreset = {
  orbit: string;
  target: string;
  fov: string;
};

export const RCORE_PAGE_HERO_CAMERA: RcoreCameraPreset = {
  orbit: '45deg 85deg 1900m',
  target: 'auto 110% auto',
  fov: '15.5deg',
};

export const RCORE_BLUEPRINT_WIDE_CAMERA: RcoreCameraPreset = {
  orbit: '-22deg 84deg 2.28m',
  target: '0m 0.82m 0m',
  fov: '17.5deg',
};

/** 沉浸卷轴：首屏 + 三个优点（slice 0–3） */
export const RCORE_FILM_SLICE_COUNT = 4;

/** 优点 1–3 各自机位（slice 3 仍用第三优点机位，不切 Advisor） */
export const RCORE_FILM_ADV_CAMERAS: readonly RcoreCameraPreset[] = [
  { orbit: '40deg 84deg 1680m', target: 'auto 111% auto', fov: '14.2deg' },
  { orbit: '52deg 81deg 1420m', target: 'auto 107% auto', fov: '13.8deg' },
  { orbit: '30deg 87deg 1280m', target: 'auto 114% auto', fov: '14deg' },
];

export function computeFilmScrollSlice(
  filmEl: HTMLElement,
  reducedMotion: boolean,
): { si: number; local: number; progress: number; inView: boolean } {
  const rect = filmEl.getBoundingClientRect();
  const vh = window.innerHeight;
  const range = Math.max(1, filmEl.offsetHeight - vh);
  const raw = reducedMotion ? 0.42 : -rect.top / range;
  const progress = Math.max(0, Math.min(1, raw));
  const sp = progress * RCORE_FILM_SLICE_COUNT;
  const si = Math.min(RCORE_FILM_SLICE_COUNT - 1, Math.max(0, Math.floor(sp)));
  return {
    si,
    local: sp - si,
    progress,
    inView: rect.bottom > 0 && rect.top < vh,
  };
}

/** 卷轴叙事是否已滚完（含第三个优点 slice 3） */
export function isFilmScrollComplete(filmEl: HTMLElement | null, reducedMotion: boolean): boolean {
  if (!filmEl) return true;
  return computeFilmScrollSlice(filmEl, reducedMotion).progress >= 0.995;
}

/** 每条优点在 slice 内的进入阶段长度（与 `advPanelScrollMotion` enter 一致） */
export const RCORE_FILM_ADV_ENTER_END = 0.38;

export const RCORE_FILM_ADV_EXIT_START = 0.52;
export const RCORE_FILM_ADV_EXIT_END = 1;

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** 第三个优点 slice 内退出进度（与文案 `advPanelScrollMotion` 共用） */
export function filmAdvSliceExitT(local: number): number {
  return smoothstep(RCORE_FILM_ADV_EXIT_START, RCORE_FILM_ADV_EXIT_END, local);
}

/** 单条优点在 slice 内的位移与透明度：自下进入 → 中部最清晰 → 向上退出 */
export function advPanelScrollMotion(local: number): { opacity: number; yPercent: number } {
  const enter = smoothstep(0, RCORE_FILM_ADV_ENTER_END, local);
  const exit = filmAdvSliceExitT(local);
  const opacity = enter * (1 - exit);
  const yPercent = (1 - enter) * 22 - exit * 22;
  return { opacity, yPercent };
}

/** 第三条优点退场：与卷轴同速上移滚出，退出段不额外淡出（仅跟手滚动） */
export function advPanelScrollRollOutMotion(local: number): { opacity: number; yPercent: number } {
  const enter = smoothstep(0, RCORE_FILM_ADV_ENTER_END, local);
  const exit = filmAdvSliceExitT(local);
  const opacity = enter;
  const yPercent = (1 - enter) * 22 - exit * 22;
  return { opacity, yPercent };
}

/** 第三条优点滚出：从退出 scroll 起点滚到卷轴段末尾（与鼠标 1:1 像素上移） */
export function filmAdv3RollOutMetrics(filmEl: HTMLElement): {
  exitStartY: number;
  exitEndY: number;
} {
  const { range, filmTop, vh } = filmScrollMetrics(filmEl);
  const sliceSpan = range / RCORE_FILM_SLICE_COUNT;
  const exitStartY = filmTop + sliceSpan * 3 + sliceSpan * RCORE_FILM_ADV_EXIT_START;
  const exitEndY = filmTop + filmEl.offsetHeight - vh * 0.12;
  return { exitStartY, exitEndY };
}

/** 退出段：每滚 1px 上移 1px，直到滚出视口 */
export function filmAdv3RollOutOffsetPx(filmEl: HTMLElement, scrollY: number): number {
  const { exitStartY, exitEndY } = filmAdv3RollOutMetrics(filmEl);
  const { vh } = filmScrollMetrics(filmEl);
  if (scrollY <= exitStartY) return 0;
  const dragged = scrollY - exitStartY;
  const maxDrag = exitEndY - exitStartY + vh;
  return -Math.min(dragged, maxDrag);
}

export function isFilmAdv3RollOutActive(
  filmEl: HTMLElement,
  scrollY: number,
  reducedMotion: boolean,
): boolean {
  if (reducedMotion) return false;
  const slice = computeFilmScrollSlice(filmEl, reducedMotion);
  if (slice.si !== 3) return false;
  const { exitStartY, exitEndY } = filmAdv3RollOutMetrics(filmEl);
  const { vh } = filmScrollMetrics(filmEl);
  return scrollY >= exitStartY && scrollY <= exitEndY + vh * 0.5;
}

export function filmScrollMetrics(filmEl: HTMLElement): {
  vh: number;
  range: number;
  filmTop: number;
} {
  const vh = window.innerHeight;
  const range = Math.max(1, filmEl.offsetHeight - vh);
  const filmTop = filmEl.offsetTop;
  return { vh, range, filmTop };
}

/** 文档 scrollY：slice `si` 刚开始（local = 0） */
export function scrollYForFilmSliceStart(filmEl: HTMLElement, si: number): number {
  const { range, filmTop } = filmScrollMetrics(filmEl);
  return filmTop + (si / RCORE_FILM_SLICE_COUNT) * range;
}

/**
 * 沉浸页顶栏收起进度：从第一个优点 slice 起点开始，时长与文案 enter 一致。
 */
export function armMainNavProgressFromScrollY(filmEl: HTMLElement | null, scrollY: number): number {
  if (!filmEl) return 0;
  const { range, filmTop } = filmScrollMetrics(filmEl);
  const adv1Start = filmTop + range / RCORE_FILM_SLICE_COUNT;
  const navHideRange = (range / RCORE_FILM_SLICE_COUNT) * RCORE_FILM_ADV_ENTER_END;
  const linear = clamp01((scrollY - adv1Start) / navHideRange);
  return smoothstep(0, 1, linear);
}

/** Apple-style crossfade: 主顶栏 → SVG 条 → 二级咨询（与 `armMainNavProgressFromScrollY` 同速区段） */
export function armImmersiveSubnavOpacities(
  filmEl: HTMLElement | null,
  scrollY: number,
  appSectionEl: HTMLElement | null,
  mobileMenuOpen: boolean,
  reducedMotion = false,
): { brand: number; consult: number; mainNavHide: number } {
  const mainNavHide = armMainNavProgressFromScrollY(filmEl, scrollY);
  if (mobileMenuOpen || !filmEl) {
    return { brand: 0, consult: 0, mainNavHide };
  }

  const { si } = computeFilmScrollSlice(filmEl, reducedMotion);
  if (si < 1) {
    return { brand: 0, consult: 0, mainNavHide };
  }

  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  let appApproach = 0;
  if (appSectionEl) {
    const top = appSectionEl.getBoundingClientRect().top;
    appApproach = smoothstep(vh * 1.04, vh * 0.84, top);
  }

  if (reducedMotion) {
    const consultOn = mainNavHide > 0.9 && appApproach > 0.45;
    return {
      brand: consultOn ? 0 : mainNavHide,
      consult: consultOn ? 1 : 0,
      mainNavHide,
    };
  }

  const brand = mainNavHide * (1 - appApproach);
  const consult = mainNavHide * appApproach;
  return { brand, consult, mainNavHide };
}

export function cameraForFilmSlice(si: number): RcoreCameraPreset {
  if (si === 0) return RCORE_PAGE_HERO_CAMERA;
  return RCORE_FILM_ADV_CAMERAS[si - 1] ?? RCORE_FILM_ADV_CAMERAS[RCORE_FILM_ADV_CAMERAS.length - 1];
}

export function detectRcoreCoarseViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(max-width: 1024px)').matches || window.matchMedia('(pointer: coarse)').matches
  );
}

/** Advisor `AdvisorHeroGlb` onLoad — 法兰头大特写 */
export function getAdvisorFlangeCamera(coarse = detectRcoreCoarseViewport()): RcoreCameraPreset {
  return coarse
    ? { orbit: '29deg 80deg 320m', target: 'auto 118% auto', fov: '24deg' }
    : { orbit: '33deg 78deg 360m', target: '46% 158% auto', fov: '10.5deg' };
}

type OrbitParts = { az: number; polar: number; dist: number };

function parseOrbit(orbit: string): OrbitParts {
  const m = orbit.trim().match(/^([-\d.]+)deg\s+([-\d.]+)deg\s+([-\d.]+)m$/i);
  if (!m) return { az: 45, polar: 85, dist: 1900 };
  return { az: Number(m[1]), polar: Number(m[2]), dist: Number(m[3]) };
}

function formatOrbit({ az, polar, dist }: OrbitParts): string {
  return `${az.toFixed(2)}deg ${polar.toFixed(2)}deg ${dist.toFixed(2)}m`;
}

function parseTargetPercent(target: string): { x: number; y: number; z: number; autoX: boolean; autoZ: boolean } {
  const parts = target.trim().split(/\s+/);
  const read = (p: string) => {
    if (p === 'auto') return { v: 0, auto: true };
    const n = parseFloat(p);
    return { v: Number.isFinite(n) ? n : 0, auto: false };
  };
  const x = read(parts[0] ?? 'auto');
  const y = read(parts[1] ?? '0m');
  const z = read(parts[2] ?? 'auto');
  return {
    x: x.v,
    y: y.v,
    z: z.v,
    autoX: x.auto,
    autoZ: z.auto,
  };
}

function lerpTarget(a: string, b: string, t: number): string {
  const ta = parseTargetPercent(a);
  const tb = parseTargetPercent(b);
  const lx = ta.autoX && tb.autoX ? 'auto' : `${(ta.autoX ? 50 : ta.x) + ((tb.autoX ? 50 : tb.x) - (ta.autoX ? 50 : ta.x)) * t}%`;
  const ly = `${ta.y + (tb.y - ta.y) * t}m`;
  const lz = ta.autoZ && tb.autoZ ? 'auto' : `${(ta.autoZ ? 50 : ta.z) + ((tb.autoZ ? 50 : tb.z) - (ta.autoZ ? 50 : ta.z)) * t}%`;
  return `${lx} ${ly} ${lz}`;
}

function lerpFov(a: string, b: string, t: number): string {
  const na = parseFloat(a);
  const nb = parseFloat(b);
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return t < 0.5 ? a : b;
  return `${na + (nb - na) * t}deg`;
}

export function lerpRcoreCamera(from: RcoreCameraPreset, to: RcoreCameraPreset, t: number): RcoreCameraPreset {
  const u = Math.max(0, Math.min(1, t));
  const oa = parseOrbit(from.orbit);
  const ob = parseOrbit(to.orbit);
  return {
    orbit: formatOrbit({
      az: oa.az + (ob.az - oa.az) * u,
      polar: oa.polar + (ob.polar - oa.polar) * u,
      dist: oa.dist + (ob.dist - oa.dist) * u,
    }),
    target: lerpTarget(from.target, to.target, u),
    fov: lerpFov(from.fov, to.fov, u),
  };
}

export function applyRcoreCamera(el: HTMLElement | null, cam: RcoreCameraPreset, lastKeyRef?: { current: string }) {
  if (!el) return;
  const key = `${cam.orbit}|${cam.target}|${cam.fov}`;
  if (lastKeyRef && key === lastKeyRef.current) return;
  if (lastKeyRef) lastKeyRef.current = key;
  el.setAttribute('camera-orbit', cam.orbit);
  el.setAttribute('camera-target', cam.target);
  el.setAttribute('field-of-view', cam.fov);
}

export type RcoreViewerLightingPreset = 'default' | 'rLiteImmersive';

const RCORE_VIEWER_LIGHTING: Record<
  RcoreViewerLightingPreset,
  { environmentIntensity: string; exposure: string; shadowIntensity: string; shadowSoftness: string }
> = {
  default: {
    environmentIntensity: '0.82',
    exposure: '0.98',
    shadowIntensity: '0.9',
    shadowSoftness: '1.15',
  },
  /** r-lite 沉浸页黑底首屏：抬环境光与曝光，避免 FR3-C 整体偏暗 */
  rLiteImmersive: {
    environmentIntensity: '1.22',
    exposure: '1.24',
    shadowIntensity: '0.72',
    shadowSoftness: '1.15',
  },
};

export function rcoreViewerLightingAttrs(preset: RcoreViewerLightingPreset = 'default') {
  return RCORE_VIEWER_LIGHTING[preset];
}

/** 与 Advisor 首屏 / 法兰段一致的 model-viewer 光照（首屏即应用，避免滚回后才变亮） */
export function applyRcoreViewerLighting(
  el: HTMLElement | null,
  preset: RcoreViewerLightingPreset = 'default',
): void {
  if (!el) return;
  const lighting = RCORE_VIEWER_LIGHTING[preset];
  el.setAttribute('environment-intensity', lighting.environmentIntensity);
  el.setAttribute('exposure', lighting.exposure);
  el.setAttribute('shadow-intensity', lighting.shadowIntensity);
  el.setAttribute('shadow-softness', lighting.shadowSoftness);
}

export type AdvisorFlangeMaterialPreset = 'default' | 'rLiteImmersive';

const ADVISOR_FLANGE_METAL: Record<
  AdvisorFlangeMaterialPreset,
  { baseColor: [number, number, number, number]; roughness: number }
> = {
  default: { baseColor: [0.8, 0.8, 0.8, 1], roughness: 0.2 },
  /** r-lite FR3-C 黑底页：提亮不锈钢/法兰，略增 roughness 避免 pure mirror 发灰 */
  rLiteImmersive: { baseColor: [0.97, 0.98, 1, 1], roughness: 0.35 },
};

function isAdvisorFlangeMetalPart(name: string, preset: AdvisorFlangeMaterialPreset): boolean {
  const lowerName = name.toLowerCase();
  if (
    lowerName.includes('metal') ||
    lowerName.includes('steel') ||
    lowerName.includes('iron') ||
    lowerName.includes('joint') ||
    name === 'Material.001' ||
    name === 'Material.003'
  ) {
    return true;
  }
  if (preset === 'rLiteImmersive') {
    return name === 'Material.009' || name === '材质.011';
  }
  return false;
}

/** Advisor `AdvisorHeroGlb` 材质，全页 GLB 与 Advisor 视觉一致 */
export function applyAdvisorFlangeMaterial(
  model: unknown,
  preset: AdvisorFlangeMaterialPreset = 'default',
): void {
  if (!model || typeof model !== 'object' || !('materials' in model)) return;
  const metal = ADVISOR_FLANGE_METAL[preset];
  const materials = (
    model as {
      materials: Array<{
        name?: string;
        pbrMetallicRoughness: {
          setMetallicFactor: (n: number) => void;
          setRoughnessFactor: (n: number) => void;
          setBaseColorFactor: (c: number[]) => void;
        };
      }>;
    }
  ).materials;
  materials.forEach((material) => {
    const name = material.name ?? '';
    if (isAdvisorFlangeMetalPart(name, preset)) {
      material.pbrMetallicRoughness.setMetallicFactor(1.0);
      material.pbrMetallicRoughness.setRoughnessFactor(metal.roughness);
      material.pbrMetallicRoughness.setBaseColorFactor([...metal.baseColor]);
    } else {
      material.pbrMetallicRoughness.setMetallicFactor(0.0);
      material.pbrMetallicRoughness.setRoughnessFactor(0.38);
      material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
    }
  });
}

/** 法兰段：定格 Advisor 特写机位 + 环境光 */
export function applyAdvisorFlangeScene(el: HTMLElement | null, lastKeyRef?: { current: string }): void {
  if (!el) return;
  applyRcoreCamera(el, getAdvisorFlangeCamera(), lastKeyRef);
  applyRcoreViewerLighting(el);
  clearViewerMotion(el);
}

/**
 * 法兰段滚出 0→1：前半段定格 Advisor 特写，后半段与三列特征同步上移。
 * 基于整段 scroll progress，避免 strip 一进场就触发 exit。
 */
export function flangeChapterExitProgress(flangeEl: HTMLElement | null): number {
  const prog = sectionScrollProgress(flangeEl);
  const holdEnd = 0.52;
  if (prog <= holdEnd) return 0;
  return Math.max(0, Math.min(1, (prog - holdEnd) / (1 - holdEnd)));
}

export function clearViewerMotion(el: HTMLElement | null) {
  if (!el) return;
  el.removeAttribute('camera-controls');
  el.removeAttribute('auto-rotate');
  el.removeAttribute('rotation-per-second');
}

/** 蓝图段落位后：与首页 hero 一致的顺时针台架旋转 */
export function applyBlueprintSpin(el: HTMLElement | null, reducedMotion: boolean) {
  if (!el) return;
  el.removeAttribute('camera-controls');
  if (reducedMotion) {
    clearViewerMotion(el);
    return;
  }
  el.setAttribute('rotation-per-second', '-100%');
  el.setAttribute('auto-rotate', '');
}

/** 段落在视口中的滚动进度 0→1（进入→离开） */
export function sectionScrollProgress(el: HTMLElement | null): number {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const total = Math.max(1, r.height + vh);
  return Math.max(0, Math.min(1, (vh - r.top) / total));
}
