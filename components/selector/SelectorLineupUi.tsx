'use client';

import Image from 'next/image';
import type { MouseEvent, RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  robotVariantImageAlt,
  robotVariantImageUrl,
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
    close: '关闭',
    dof: '自由度',
    noise: '噪声',
    mounting: '安装方式',
    hero2Title: '对比全系 r 家族',
    hero2Subtitle: '在三个下拉框中各选一款不同的 r 系列变体。',
    hero2ChooseModel: '选择机型',
    hero2Inquiry: '咨询',
  },
  en: {
    title: 'Explore the lineup',
    subtitle: 'Swipe sideways to browse every r‑Series cobot variant.',
    payload: 'Payload',
    reach: 'Reach',
    repeatability: 'Repeatability',
    weight: 'Weight',
    detailTitle: 'Specifications',
    close: 'Close',
    dof: 'DOF',
    noise: 'Noise',
    mounting: 'Mounting',
    hero2Title: 'Compare all r family',
    hero2Subtitle: 'Pick a different r‑Series variant in each menu below.',
    hero2ChooseModel: 'Choose models',
    hero2Inquiry: 'Inquiry',
  },
} as const;

export type SelectorLineupCopy = (typeof SELECTOR_LINEUP_I18N)['zh'];

/** 中/英文案对象联合（用于卡片 `t`，避免 `as const` 与 Pick 的 readonly 冲突） */
export type SelectorLineupAnyLang = (typeof SELECTOR_LINEUP_I18N)[keyof typeof SELECTOR_LINEUP_I18N];

function SpecRow({
  label,
  value,
  detail,
  multilineValue,
}: {
  label: string;
  value: string;
  detail?: boolean;
  multilineValue?: boolean;
}) {
  return (
    <div className="border-b border-black/[0.06] pb-3.5 last:border-0">
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
            <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3.5 text-[0.8125rem]">
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
            <div className="mt-auto flex justify-end pt-1">
              <button
                type="button"
                aria-label={
                  lang === 'zh'
                    ? `查看 ${item.family.displayName}${variantShort ? ` ${variantShort}` : ''} 完整规格`
                    : `View full specifications for ${item.family.displayName}${variantShort ? ` ${variantShort}` : ''}`
                }
                onClick={onOpenDetail}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d2d2d7] bg-white text-[1.35rem] font-light leading-none text-[#1d1d1f] shadow-sm transition-colors hover:bg-[#f5f5f7] active:scale-95"
              >
                +
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

  if (!detailItem) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100100] flex flex-col sm:flex-row sm:items-center sm:justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="variant-detail-title"
    >
      <button type="button" className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" aria-label={t.close} onClick={onClose} />
      <div className="relative z-[1] flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none bg-[#fbfbfd] shadow-none sm:max-h-[min(92dvh,900px)] sm:max-w-[780px] sm:flex-none sm:rounded-[1.35rem] sm:shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-black/[0.06] px-5 py-4 sm:px-8 sm:py-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73] sm:text-xs">{t.detailTitle}</p>
            <h2 id="variant-detail-title" className="mt-1 text-[1.25rem] font-semibold tracking-tight text-[#1d1d1f] sm:text-[1.6rem]">
              {detailItem.family.displayName}
              {detailVariantShort ? (
                <>
                  <span className="font-normal text-[#86868b]"> · </span>
                  {detailVariantShort}
                </>
              ) : null}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d2d2d7] bg-white text-[1.25rem] font-light leading-none text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] sm:h-10 sm:w-10 sm:text-[1.35rem]"
            aria-label={t.close}
          >
            ×
          </button>
        </header>
        <div
          ref={detailScrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-8 sm:py-6"
        >
          <p className="mb-6 whitespace-pre-line text-[0.9375rem] leading-relaxed text-[#424245] sm:text-[1.125rem] sm:leading-relaxed">
            {selectorSummarizeBody(lang === 'zh' ? detailItem.description.zh : detailItem.description.en)}
          </p>
          <dl className="space-y-4 text-[0.875rem] sm:space-y-5 sm:text-[1.0625rem]">
            <SpecRow label={specLabels.payload[lang]} value={detailItem.payload} detail />
            <SpecRow label={specLabels.reach[lang]} value={detailItem.reach} detail />
            <SpecRow label={specLabels.repeatability[lang]} value={detailItem.repeatability} detail />
            <SpecRow label={specLabels.weight[lang]} value={detailItem.weight} detail />
            <SpecRow label={t.dof} value={detailItem.dof} detail />
            <SpecRow label={specLabels.ip[lang]} value={detailItem.ipRating} detail />
            <SpecRow
              label={specLabels.power[lang]}
              value={`${detailItem.avgPower} / ${detailItem.peakPower}`}
              detail
            />
            <SpecRow label={specLabels.tcpSpeed[lang]} value={detailItem.tcpSpeed} detail />
            <SpecRow label={specLabels.voltage[lang]} value={detailItem.voltage} detail />
            <SpecRow label={t.noise} value={detailItem.noise} detail />
            <SpecRow label={t.mounting} value={ml(detailItem.mounting, lang)} detail />
            <SpecRow
              label={specLabels.environment[lang]}
              value={`${detailItem.temperature}；${detailItem.humidity}`}
              detail
            />
            <SpecRow label={specLabels.footprint[lang]} value={detailItem.footprint} detail />
            <SpecRow label={specLabels.io[lang]} value={detailItem.ioPorts} detail />
            <SpecRow label={lang === 'zh' ? '工具电源' : 'Tool power'} value={detailItem.toolPower} detail />
            {detailItem.materials && (
              <SpecRow label={specLabels.materials[lang]} value={ml(detailItem.materials, lang)} detail />
            )}
            {detailItem.powerTestNote && (
              <SpecRow
                label={lang === 'zh' ? '功率测试说明' : 'Power test note'}
                value={stripIndustrialModelCodes(ml(detailItem.powerTestNote, lang))}
                detail
              />
            )}
          </dl>
          <div className="mt-8 border-t border-black/[0.06] pt-5 sm:mt-10">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73] sm:text-xs">
              {specLabels.axes[lang]}
            </p>
            <dl className="space-y-3 text-[0.8125rem] sm:space-y-3.5 sm:text-[0.9375rem]">
              {AXIS_ORDER.map((key) => {
                const ax = detailItem.axes[key];
                return (
                  <div key={key} className="flex flex-col gap-0.5 border-b border-black/[0.04] pb-3 last:border-0">
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
        </div>
      </div>
    </div>,
    document.body,
  );
}
