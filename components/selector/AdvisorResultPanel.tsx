'use client';

import { useMemo, useState } from 'react';

import {
  buildLineup,
  lineItemForAdvisorFamily,
  lineupCardVariantShortNameForItem,
  SelectorLineupCard,
  SELECTOR_LINEUP_I18N,
  VariantDetailPortal,
} from '@/components/selector/SelectorLineupUi';
import type { AdvisorComputedResult, AdvisorPickLine } from '@/lib/advisor-engine';

import { openInquiry } from '@/lib/open-inquiry';

function openInquiryWithBody(body: string) {
  openInquiry({ body, source: 'advisor_result' });
}

export type AdvisorResultPanelProps = {
  safeLang: 'zh' | 'en';
  result: AdvisorComputedResult;
  picks: AdvisorPickLine[];
  resultIntro: string;
  inquiryDraft: string;
  openDrawerLabel: string;
  resetLabel: string;
  onReset: () => void;
};

export default function AdvisorResultPanel({
  safeLang,
  result,
  picks,
  resultIntro,
  inquiryDraft,
  openDrawerLabel,
  resetLabel,
  onReset,
}: AdvisorResultPanelProps) {
  const [advisorDetailId, setAdvisorDetailId] = useState<string | null>(null);
  const lineup = useMemo(() => buildLineup(), []);
  const lineupCardT = SELECTOR_LINEUP_I18N[safeLang];

  const primaryItem = useMemo(
    () => lineItemForAdvisorFamily(result.familyId),
    [result.familyId],
  );

  const upgradeItem = useMemo(
    () => lineItemForAdvisorFamily(result.upgradeFamilyId),
    [result.upgradeFamilyId],
  );

  if (picks.length < 5) return null;

  return (
    <div className="space-y-10">
      <p className="max-w-[46rem] text-[1.0625rem] leading-relaxed text-[#6e6e73] md:text-[1.1875rem]">{resultIntro}</p>

      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        {[primaryItem, upgradeItem].map((item, idx) => {
          if (!item) return null;
          return (
            <div key={`${item.id}-${idx}`} className="flex min-w-0">
              <SelectorLineupCard
                item={item}
                lang={safeLang}
                t={lineupCardT}
                index={idx}
                embedded
                disableImagePostProcess
                onOpenDetail={() => setAdvisorDetailId(item.id)}
                onOpenInquiry={() => {
                  const short = lineupCardVariantShortNameForItem(item, safeLang);
                  const modelLabel = `${item.family.displayName}${short ? ` · ${short}` : ''}`;
                  const body =
                    safeLang === 'zh'
                      ? `我想咨询以下机型：\n- ${modelLabel}\n\n请联系我并提供方案与报价。`
                      : `I'm interested in this model:\n- ${modelLabel}\n\nPlease contact me with recommendation and quotation.`;
                  openInquiryWithBody(body);
                }}
              />
            </div>
          );
        })}
      </div>

      <VariantDetailPortal
        lineup={lineup}
        detailId={advisorDetailId}
        onClose={() => setAdvisorDetailId(null)}
        lang={safeLang}
      />

      <div className="rounded-[1.25rem] border border-[#e8e8ed] bg-[#fbfbfd] p-6 shadow-inner md:p-8">
        <p className="whitespace-pre-wrap text-[1.05rem] leading-relaxed text-[#1d1d1f] md:text-[1.125rem]">
          {safeLang === 'zh' ? result.geoNarrativeZh : result.geoNarrativeEn}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-[#0071e3] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,113,227,0.35)] transition hover:bg-[#0077ed]"
          onClick={() => openInquiryWithBody(inquiryDraft)}
        >
          {openDrawerLabel}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-[#0071e3] hover:underline"
          onClick={onReset}
        >
          {resetLabel}
        </button>
      </div>
    </div>
  );
}
