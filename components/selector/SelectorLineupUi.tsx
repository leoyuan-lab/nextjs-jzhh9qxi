'use client';

import Image from 'next/image';
import type { CSSProperties, HTMLAttributes, MouseEvent, RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  robotVariantBlueprintAlt,
  robotVariantBlueprintDescription,
  robotVariantImageAlt,
  robotVariantImageUrl,
  robotVariantBlueprintSvgUrl,
  rSeriesData,
  specLabels,
  type RobotFamily,
  type RobotVariant,
} from '@/data/products';

export type LineItem = RobotVariant & {
  family: RobotFamily;
};

export const AXIS_ORDER: (keyof RobotVariant['axes'])[] = [
  'base',
  'shoulder',
  'elbow',
  'wrist1',
  'wrist2',
  'wrist3',
];

export function buildLineup(): LineItem[] {
  return rSeriesData.flatMap((family) => family.variants.map((v) => ({ ...v, family })));
}

/** 全系页默认代表变体：优先 `*-std`，否则取首条 */
export function lineItemForAdvisorFamily(familyId: string): LineItem | undefined {
  const family = rSeriesData.find((f) => f.id === familyId);
  if (!family?.variants?.length) return undefined;
  const variant =
    family.variants.find((v) => /-std$/i.test(v.id)) ??
    family.variants.find((v) => /^standard$/i.test(v.name)) ??
    family.variants[0];
  return { ...variant, family };
}

export function ml(v: { zh: string; en: string }, lang: 'zh' | 'en') {
  return lang === 'zh' ? v.zh : v.en;
}

/**
 * 详情区域纵向滚动时，用 Vibration API 做「刻度式」短震（类似系统里 Industry 滚轮选择器），
 * 快慢随滑动速度变化。仅触摸类设备 + 支持 Vibration API 的浏览器；尊重 prefers-reduced-motion。
 * （iOS Safari 一般不开放网页振动，与系统里原生 <select> 滚轮触感不同，属平台限制。）
 */
function useScrollNotchHaptics(scrollRef: RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const el = scrollRef.current;
    if (!el) return;

    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMq.matches) return;
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;

    const touchLike =
      window.matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints ?? 0) > 0;
    if (!touchLike) return;

    let lastY = el.scrollTop;
    let lastTs = performance.now();
    let accPx = 0;
    let lastPulseAt = 0;
    let velEma = 0;

    const stopVibrate = () => {
      try {
        navigator.vibrate(0);
      } catch {
        /* ignore */
      }
    };

    const onScroll = () => {
      if (reducedMq.matches) return;
      const y = el.scrollTop;
      const ts = performance.now();
      const dy = y - lastY;
      const dt = Math.max(ts - lastTs, 5);
      const inst = Math.abs(dy) / dt;
      velEma = velEma * 0.55 + inst * 0.45;
      lastY = y;
      lastTs = ts;

      const ady = Math.abs(dy);
      if (ady < 0.35) return;
      accPx += ady;

      const v = Math.min(velEma, 5);
      const pxPerNotch = Math.max(12, 52 - v * 8.5);
      const minGapMs = Math.max(22, 88 - v * 14);
      const durationMs = Math.round(Math.min(18, Math.max(4, 5 + v * 2.2)));

      if (accPx >= pxPerNotch && ts - lastPulseAt >= minGapMs) {
        accPx = 0;
        lastPulseAt = ts;
        try {
          navigator.vibrate(durationMs);
        } catch {
          /* ignore */
        }
      }
    };

    const onReduced = () => {
      stopVibrate();
    };
    reducedMq.addEventListener('change', onReduced);

    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      reducedMq.removeEventListener('change', onReduced);
      el.removeEventListener('scroll', onScroll);
      stopVibrate();
    };
  }, [active, scrollRef]);
}

/** 页面上不展示原 FR 型号字样（仅影响本页展示，不改数据源） */
export function stripIndustrialModelCodes(text: string): string {
  const s = text
    .replace(/fr\d{1,2}(?:-[a-z0-9]+)+/gi, '')
    .replace(/FR\d{1,2}(?:-[A-Z0-9]+)*/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([，。；、])/g, '$1')
    .trim();
  return s;
}

/** 变体展示名：FR16 → 16，FR20 → 20；其它名称去掉独立的 FR+数字 片段 */
function displayVariantLabel(name: string): string {
  return name.replace(/\bFR(\d+)\b/gi, '$1');
}

/** 小卡片 / 详情标题：去掉 Standard 及全角/半角括号内说明 */
export function lineupCardVariantShortName(name: string): string {
  let s = name
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim();
  s = s.replace(/\bstandard\b/gi, '').replace(/\s+/g, ' ').trim();
  return displayVariantLabel(s).trim();
}

/** 灰色总结文案：分号处换行展示 */
export function selectorSummarizeBody(text: string): string {
  return stripIndustrialModelCodes(text)
    .split(/[；;]\s*/)
    .map((x) => x.trim())
    .filter(Boolean)
    .join('\n');
}

export const SELECTOR_LINEUP_I18N = {
  zh: {
    title: '探索全系机型',
    subtitle: '左右滑动，浏览全部 r 系列协作臂变体。',
    payload: '负载',
    reach: '工作半径',
    repeatability: '重复定位精度',
    weight: '机器自重',
    detailTitle: '规格详情',
    drawingTitle: '技术图纸',
    /** 手机详情弹层顶部分段（短文案） */
    detailTabSpecs: '详情',
    detailTabDrawing: '图纸',
    close: '关闭',
    openDrawing: '图纸',
    openFullscreenDrawing: '查看大图',
    dof: '自由度',
    noise: '噪声',
    mounting: '安装方式',
    hero2Title: '对比全系 r 家族',
    hero2Subtitle: '在三个下拉框中各选一款不同的 r 系列变体。',
    hero2ChooseModel: '选择机型',
    hero2Inquiry: '咨询',
    /** `{family}` = product line display name, e.g. r-Lite */
    specsGridAria: '{family} 系列技术规格',
    detailJointAxesAria: '{family} 各关节轴规格参数',
  },
  en: {
    title: 'Explore the lineup',
    subtitle: 'Swipe sideways to browse every r‑Series cobot variant.',
    payload: 'Payload',
    reach: 'Reach',
    repeatability: 'Repeatability',
    weight: 'Weight',
    detailTitle: 'Specifications',
    drawingTitle: 'Technical drawing',
    detailTabSpecs: 'Specs',
    detailTabDrawing: 'Drawing',
    close: 'Close',
    openDrawing: 'Drawing',
    openFullscreenDrawing: 'Open full drawing',
    dof: 'DOF',
    noise: 'Noise',
    mounting: 'Mounting',
    hero2Title: 'Compare all r family',
    hero2Subtitle: 'Pick a different r‑Series variant in each menu below.',
    hero2ChooseModel: 'Choose models',
    hero2Inquiry: 'Inquiry',
    specsGridAria: '{family} series technical specifications',
    detailJointAxesAria: '{family} joint axes specifications',
  },
} as const;

export type SelectorLineupCopy = (typeof SELECTOR_LINEUP_I18N)['zh'];

/** 中/英文案对象联合（用于卡片 `t`，避免 `as const` 与 Pick 的 readonly 冲突） */
export type SelectorLineupAnyLang = (typeof SELECTOR_LINEUP_I18N)[keyof typeof SELECTOR_LINEUP_I18N];

/** 苹果风圆形按钮内图标：黑底上用 currentColor（白） */
function AppleCirclePlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="11" y="5" width="2" height="14" rx="1" fill="currentColor" />
      <rect x="5" y="11" width="14" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function AppleCircleCloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M8.5 8.5l7 7M15.5 8.5l-7 7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpecRow({
  label,
  value,
  detail,
  multilineValue,
  detailLineIndex,
}: {
  label: string;
  value: string;
  detail?: boolean;
  multilineValue?: boolean;
  /** 设序时有依次淡入；卡片摘要栅格不传 */
  detailLineIndex?: number;
}) {
  const lineStyle: CSSProperties | undefined =
    detailLineIndex !== undefined ? { ['--detail-line-i' as string]: detailLineIndex } : undefined;
  return (
    <div
      className={`border-b border-black/[0.06] pb-3.5 last:border-0${detailLineIndex !== undefined ? ' selector-detail-line' : ''}`}
      style={lineStyle}
    >
      <dt
        className={`mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#86868b]${detail ? ' sm:text-xs' : ''}`}
      >
        {label}
      </dt>
      <dd
        className={`font-medium leading-snug text-[#1d1d1f] text-[0.9375rem]${detail ? ' sm:text-[1.125rem] sm:leading-snug' : ''}${multilineValue ? ' whitespace-pre-line' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}

type BlueprintSlot = 'modal-mobile' | 'modal-desktop';

function AnimatedBlueprintSvg({
  familyId,
  variantId,
  lang,
  active,
  slot,
  desktopTight,
}: {
  familyId: string;
  variantId: string;
  lang: 'zh' | 'en';
  active: boolean;
  /** 手机详情内嵌图纸：保持原先裁切与内边距，勿改。 */
  slot: BlueprintSlot;
  /** 仅桌面右栏 + lineup 末 4 款：略缩图纸并顶对齐，减轻顶缘被「吃掉」。 */
  desktopTight?: boolean;
}) {
  const ariaLabelBp = robotVariantBlueprintAlt(variantId, lang);
  const ariaDescriptionBp = robotVariantBlueprintDescription(variantId, lang);
  const src = robotVariantBlueprintSvgUrl[variantId];
  const animatedDemo = familyId === 'r-lite';
  const isDesktop = slot === 'modal-desktop';
  const tight = Boolean(isDesktop && desktopTight);
  const relaxedOverflow = tight;
  const figureOverflow = relaxedOverflow ? 'overflow-visible' : 'overflow-hidden';
  const tightClass = tight ? 'selector-blueprint-desktop-tight' : '';
  const revealPad = isDesktop
    ? tight
      ? 'px-3 pb-4 pt-[6vh]'
      : 'px-3 pb-4 pt-0'
    : 'px-2 py-2 sm:px-3 sm:py-4';
  const innerOverflow = relaxedOverflow ? 'overflow-visible' : 'overflow-hidden';
  const desktopBlueprintTopAlign = isDesktop && tight;

  return (
    <figure
      className={`selector-blueprint-fit robot-tech-slot relative z-0 flex h-full min-h-0 w-full flex-1 flex-col bg-white ${figureOverflow} ${tightClass}`.trim()}
    >
      {src ? (
        <div className={`robot-tech-reveal relative box-border flex min-h-0 w-full flex-1 flex-col ${revealPad} sm:min-h-0`}>
          <div
            className={`flex min-h-0 min-w-0 flex-1 flex-col items-center ${desktopBlueprintTopAlign ? 'justify-start' : 'justify-center'} ${innerOverflow}`}
          >
            <object
              data={src}
              type="image/svg+xml"
              aria-label={ariaLabelBp}
              title={ariaLabelBp}
              {...({
                'aria-description': ariaDescriptionBp,
              } as HTMLAttributes<HTMLObjectElement>)}
              className={`robot-tech-object robot-tech-ink relative z-0 box-border ${active ? 'opacity-100' : 'opacity-40'} ${
                animatedDemo ? 'robot-tech-img--animated' : ''
              }`}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-[#86868b]">
          {familyId}
        </div>
      )}
    </figure>
  );
}

export function SelectorLineupCard({
  item,
  lang,
  t,
  index,
  onOpenDetail,
  embedded = false,
}: {
  item: LineItem;
  lang: 'zh' | 'en';
  t: SelectorLineupAnyLang;
  index: number;
  onOpenDetail: () => void;
  embedded?: boolean;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const tiltEnabled = !embedded;

  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = shellRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const maxDeg = 5.5;
    setTilt({ rx: py * -maxDeg, ry: px * maxDeg * 1.4 });
  }, []);

  const onLeave = useCallback(() => setTilt({ rx: 0, ry: 0 }), []);

  const variantShort = lineupCardVariantShortName(item.name);
  const staggerMs = index * 180;

  return (
    <article
      className={`selector-card-surface relative flex flex-col overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white ${
        embedded
          ? 'w-full max-w-[min(100%,428px)] shrink snap-none mx-auto'
          : 'w-[min(92vw,408px)] shrink-0 snap-start md:w-[428px]'
      }`}
      style={{ ['--stagger' as string]: `${staggerMs}ms` }}
    >
      <div className="selector-card-scale-pulse flex min-h-0 flex-1 flex-col">
        <div
          ref={shellRef}
          className="selector-card-tilt flex min-h-0 flex-1 flex-col will-change-transform"
          style={{
            transform: tiltEnabled ? `perspective(960px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` : 'none',
            transition: tiltEnabled ? 'transform 0.18s ease-out' : undefined,
          }}
          onMouseMove={tiltEnabled ? onMove : undefined}
          onMouseLeave={tiltEnabled ? onLeave : undefined}
        >
          <div
            className="selector-card-visual relative flex max-h-[320px] min-h-[260px] items-center justify-center md:min-h-[300px]"
            style={{
              backgroundColor: '#f5f5f7',
              backgroundImage:
                'linear-gradient(45deg, #e8e8ed 25%, transparent 25%), linear-gradient(-45deg, #e8e8ed 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e8ed 75%), linear-gradient(-45deg, transparent 75%, #e8e8ed 75%)',
              backgroundSize: '12px 12px',
              backgroundPosition: '0 0, 6px 6px, 6px -6px, -6px 0',
            }}
          >
            <div className="flex h-full w-full items-center justify-center px-8 pb-4 pt-10">
              <Image
                src={robotVariantImageUrl[item.id]}
                alt={robotVariantImageAlt(item.id, lang)}
                loading="lazy"
                width={340}
                height={380}
                className="h-auto max-h-[260px] w-auto max-w-full object-contain md:max-h-[280px]"
                sizes={embedded ? '(max-width:768px) 100vw, 428px' : '(max-width:768px) 92vw, 428px'}
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col px-8 pb-8 pt-6 text-left">
            <h2 className="mb-3 text-[1.5625rem] font-semibold leading-tight tracking-[-0.02em] text-[#1d1d1f]">
              {item.family.displayName}
              {variantShort ? (
                <>
                  <span className="font-normal text-[#86868b]"> · </span>
                  <span className="text-[1.1875rem] font-medium text-[#1d1d1f]">{variantShort}</span>
                </>
              ) : null}
            </h2>
            <p className="mb-5 line-clamp-3 whitespace-pre-line text-[0.9375rem] leading-relaxed text-[#424245]">
              {selectorSummarizeBody(lang === 'zh' ? item.description.zh : item.description.en)}
            </p>
            <dl
              className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3.5 text-[0.8125rem]"
              aria-label={t.specsGridAria.replace('{family}', item.family.displayName)}
            >
              <div>
                <dt className="mb-0.5 font-medium text-[#86868b]">{t.payload}</dt>
                <dd className="font-semibold text-[#1d1d1f]">{item.payload}</dd>
              </div>
              <div>
                <dt className="mb-0.5 font-medium text-[#86868b]">{t.reach}</dt>
                <dd className="font-semibold text-[#1d1d1f]">{item.reach}</dd>
              </div>
              <div>
                <dt className="mb-0.5 font-medium text-[#86868b]">{t.repeatability}</dt>
                <dd className="font-semibold text-[#1d1d1f]">{item.repeatability}</dd>
              </div>
              <div>
                <dt className="mb-0.5 font-medium text-[#86868b]">{t.weight}</dt>
                <dd className="font-semibold text-[#1d1d1f]">{item.weight}</dd>
              </div>
            </dl>
            <div className="mt-auto flex justify-end gap-2 pt-1">
              <button
                type="button"
                aria-label={
                  lang === 'zh'
                    ? `查看 ${item.family.displayName}${variantShort ? ` ${variantShort}` : ''} 完整规格`
                    : `View full specifications for ${item.family.displayName}${variantShort ? ` ${variantShort}` : ''}`
                }
                onClick={onOpenDetail}
                className="selector-tap-clean flex h-10 w-10 items-center justify-center rounded-full bg-[#000] text-white shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
              >
                <AppleCirclePlusIcon className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function VariantDetailPortal({
  lineup,
  detailId,
  onClose,
  lang,
}: {
  lineup: LineItem[];
  detailId: string | null;
  onClose: () => void;
  lang: 'zh' | 'en';
}) {
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const t = SELECTOR_LINEUP_I18N[lang];
  const [mode, setMode] = useState<'specs' | 'blueprint'>('specs');

  const detailItem = useMemo(
    () => (detailId ? (lineup.find((x) => x.id === detailId) ?? null) : null),
    [detailId, lineup],
  );

  const detailVariantShort = useMemo(
    () => (detailItem ? lineupCardVariantShortName(detailItem.name) : ''),
    [detailItem],
  );

  useScrollNotchHaptics(detailScrollRef, detailItem !== null);

  useEffect(() => {
    if (!detailId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detailId]);

  useEffect(() => {
    if (!detailId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailId, onClose]);

  useEffect(() => {
    if (!detailId) return;
    setMode('specs');
  }, [detailId]);

  if (!detailItem) return null;

  const detailBlueprintIndex = lineup.findIndex((x) => x.id === detailItem.id);
  const detailBlueprintDesktopTight =
    detailBlueprintIndex >= 0 && lineup.length >= 4 && detailBlueprintIndex >= lineup.length - 4;

  const detailDialogLabel = `${t.detailTitle}: ${detailItem.family.displayName}${detailVariantShort ? ` · ${detailVariantShort}` : ''}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[100100] flex flex-col sm:flex-row sm:items-center sm:justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={detailDialogLabel}
    >
      <button
        type="button"
        className="selector-tap-clean absolute inset-0 bg-black/45 backdrop-blur-xl backdrop-saturate-150 sm:bg-black/50 sm:backdrop-blur-2xl"
        aria-label={t.close}
        onClick={onClose}
      />
      <div className="relative z-[1] flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none bg-white shadow-none sm:max-h-[min(82dvh,calc(900px-10vh))] sm:max-w-[min(100%,calc(1180px-10vw))] sm:flex-none sm:overflow-hidden sm:rounded-[1.35rem] sm:shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        {/* 手机：整宽顶栏 + 底栏关闭；桌面顶栏拆到下方网格左格，右列整幅给图纸 + 角上关闭 */}
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-black/[0.06] px-5 py-4 sm:hidden">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73]">{t.detailTitle}</p>
            <div className="mt-1 flex min-w-0 flex-nowrap items-center gap-2">
              <h2
                id="variant-detail-title"
                className="min-w-0 flex-1 truncate text-[1.25rem] font-semibold tracking-tight text-[#1d1d1f]"
              >
                {detailItem.family.displayName}
                {detailVariantShort ? (
                  <>
                    <span className="font-normal text-[#86868b]"> · </span>
                    {detailVariantShort}
                  </>
                ) : null}
              </h2>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMode('specs')}
                  className={`selector-tap-clean rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                    mode === 'specs'
                      ? 'border-[#0071e3] bg-[#0071e3] text-white'
                      : 'border-[#0071e3] bg-transparent text-[#0071e3]'
                  }`}
                >
                  {t.detailTabSpecs}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('blueprint')}
                  className={`selector-tap-clean rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                    mode === 'blueprint'
                      ? 'border-[#0071e3] bg-[#0071e3] text-white'
                      : 'border-[#0071e3] bg-transparent text-[#0071e3]'
                  }`}
                >
                  {t.detailTabDrawing}
                </button>
              </div>
            </div>
          </div>
        </header>
        {/* 桌面 5:5；右列 aside 跨两行，图纸占满右半幅（含原顶栏高度），关闭键叠在右上 */}
        <div className="flex min-h-0 flex-1 flex-col sm:grid sm:min-h-0 sm:min-w-0 sm:grid-cols-2 sm:grid-rows-[auto_1fr] sm:overflow-hidden">
          <div className="hidden shrink-0 border-b border-black/[0.06] px-8 py-6 sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73] sm:text-xs">{t.detailTitle}</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight text-[#1d1d1f]">
              {detailItem.family.displayName}
              {detailVariantShort ? (
                <>
                  <span className="font-normal text-[#86868b]"> · </span>
                  {detailVariantShort}
                </>
              ) : null}
            </h2>
          </div>
          <aside className="relative isolate hidden min-h-0 min-w-0 flex-col overflow-hidden border-l border-black/[0.06] bg-white sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:flex sm:min-h-0 sm:flex-col sm:rounded-br-[1.35rem] sm:rounded-tr-[1.35rem] sm:pt-0">
            <button
              type="button"
              onClick={onClose}
              className="selector-tap-clean absolute right-5 top-5 z-[10050] flex h-10 w-10 items-center justify-center rounded-full bg-[#000] text-white shadow-[0_4px_14px_rgba(0,0,0,0.35)] sm:right-6 sm:top-6"
              aria-label={t.close}
            >
              <AppleCircleCloseIcon className="h-5 w-5" />
            </button>
            <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden sm:min-h-0 sm:rounded-br-[1.35rem] sm:rounded-tr-[1.35rem]">
              <AnimatedBlueprintSvg
                familyId={detailItem.family.id}
                variantId={detailItem.id}
                lang={lang}
                active
                slot="modal-desktop"
                desktopTight={detailBlueprintDesktopTight}
              />
            </div>
          </aside>
          <div
            ref={detailScrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-24 sm:col-start-1 sm:row-start-2 sm:min-h-0 sm:px-8 sm:py-6 sm:pb-28"
          >
            {mode === 'blueprint' ? (
              <div className="mb-0 h-[min(80dvh,calc(100dvh-11.5rem-env(safe-area-inset-bottom)))] overflow-hidden bg-transparent sm:hidden">
                <AnimatedBlueprintSvg
                  familyId={detailItem.family.id}
                  variantId={detailItem.id}
                  lang={lang}
                  active
                  slot="modal-mobile"
                />
              </div>
            ) : null}
            <div className={mode === 'blueprint' ? 'hidden sm:block' : 'block'} key={`${detailId}-${mode}-detail`}>
              {(() => {
                let li = 0;
                return (
                  <>
                    <p
                      className="selector-detail-line mb-6 whitespace-pre-line text-[0.9375rem] leading-relaxed text-[#424245] sm:text-[1.125rem] sm:leading-relaxed"
                      style={{ ['--detail-line-i' as string]: li++ } as CSSProperties}
                    >
                      {selectorSummarizeBody(lang === 'zh' ? detailItem.description.zh : detailItem.description.en)}
                    </p>
                    <dl
                      className="space-y-4 text-[0.875rem] sm:space-y-5 sm:text-[1.0625rem]"
                      aria-label={t.specsGridAria.replace('{family}', detailItem.family.displayName)}
                    >
                      <SpecRow
                        label={specLabels.payload[lang]}
                        value={detailItem.payload}
                        detail
                        detailLineIndex={li++}
                      />
                      <SpecRow label={specLabels.reach[lang]} value={detailItem.reach} detail detailLineIndex={li++} />
                      <SpecRow
                        label={specLabels.repeatability[lang]}
                        value={detailItem.repeatability}
                        detail
                        detailLineIndex={li++}
                      />
                      <SpecRow label={specLabels.weight[lang]} value={detailItem.weight} detail detailLineIndex={li++} />
                      <SpecRow label={t.dof} value={detailItem.dof} detail detailLineIndex={li++} />
                      <SpecRow label={specLabels.ip[lang]} value={detailItem.ipRating} detail detailLineIndex={li++} />
                      <SpecRow
                        label={specLabels.power[lang]}
                        value={`${detailItem.avgPower} / ${detailItem.peakPower}`}
                        detail
                        detailLineIndex={li++}
                      />
                      <SpecRow label={specLabels.tcpSpeed[lang]} value={detailItem.tcpSpeed} detail detailLineIndex={li++} />
                      <SpecRow label={specLabels.voltage[lang]} value={detailItem.voltage} detail detailLineIndex={li++} />
                      <SpecRow label={t.noise} value={detailItem.noise} detail detailLineIndex={li++} />
                      <SpecRow label={t.mounting} value={ml(detailItem.mounting, lang)} detail detailLineIndex={li++} />
                      <SpecRow
                        label={specLabels.environment[lang]}
                        value={`${detailItem.temperature}；${detailItem.humidity}`}
                        detail
                        detailLineIndex={li++}
                      />
                      <SpecRow label={specLabels.footprint[lang]} value={detailItem.footprint} detail detailLineIndex={li++} />
                      <SpecRow label={specLabels.io[lang]} value={detailItem.ioPorts} detail detailLineIndex={li++} />
                      <SpecRow
                        label={lang === 'zh' ? '工具电源' : 'Tool power'}
                        value={detailItem.toolPower}
                        detail
                        detailLineIndex={li++}
                      />
                      {detailItem.materials && (
                        <SpecRow
                          label={specLabels.materials[lang]}
                          value={ml(detailItem.materials, lang)}
                          detail
                          detailLineIndex={li++}
                        />
                      )}
                      {detailItem.powerTestNote && (
                        <SpecRow
                          label={lang === 'zh' ? '功率测试说明' : 'Power test note'}
                          value={stripIndustrialModelCodes(ml(detailItem.powerTestNote, lang))}
                          detail
                          detailLineIndex={li++}
                        />
                      )}
                    </dl>
                    <div className="mt-8 border-t border-black/[0.06] pt-5 sm:mt-10">
                      <p
                        className="selector-detail-line mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73] sm:text-xs"
                        style={{ ['--detail-line-i' as string]: li++ } as CSSProperties}
                      >
                        {specLabels.axes[lang]}
                      </p>
                      <dl
                        className="space-y-3 text-[0.8125rem] sm:space-y-3.5 sm:text-[0.9375rem]"
                        aria-label={t.detailJointAxesAria.replace('{family}', detailItem.family.displayName)}
                      >
                        {AXIS_ORDER.map((key) => {
                          const ax = detailItem.axes[key];
                          const idx = li++;
                          return (
                            <div
                              key={key}
                              className="selector-detail-line flex flex-col gap-0.5 border-b border-black/[0.04] pb-3 last:border-0"
                              style={{ ['--detail-line-i' as string]: idx } as CSSProperties}
                            >
                              <dt className="font-semibold text-[#1d1d1f] sm:text-[1rem]">{specLabels.axisLabels[key][lang]}</dt>
                              <dd className="text-[#424245] sm:text-[0.9375rem]">
                                <span className="text-[#6e6e73]">{lang === 'zh' ? '范围' : 'Range'}: </span>
                                {ax.range}
                              </dd>
                              <dd className="text-[#424245] sm:text-[0.9375rem]">
                                <span className="text-[#6e6e73]">{lang === 'zh' ? '最大角速度' : 'Max speed'}: </span>
                                {ax.speed}
                              </dd>
                            </div>
                          );
                        })}
                      </dl>
                    </div>
                    <div className="h-8 sm:h-10" aria-hidden />
                  </>
                );
              })()}
            </div>
          </div>
        </div>
        <div className="shrink-0 border-t border-black/[0.06] bg-white px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:hidden">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="selector-tap-clean flex h-10 w-10 items-center justify-center rounded-full bg-[#000] text-white shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
              aria-label={t.close}
            >
              <AppleCircleCloseIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
