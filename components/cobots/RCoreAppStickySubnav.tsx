'use client';

import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';

type Props = {
  lang: AppLocale;
  productLineLabel: string;
};

/** Application 段起：顶栏左侧产品线名，右侧咨询（与主站顶栏毛玻璃一致） */
export function RCoreAppStickySubnav({ lang, productLineLabel }: Props) {
  const msgs = getMessages(lang);
  const page = msgs.pages.r_core;
  const copy = page.scenario_subnav;

  return (
    <nav className="nav-sub nav-sub-enter rcore-app-sticky-subnav" aria-label={copy.brand_top_aria}>
      <div className="nav-box rcore-app-sticky-subnav__box">
        <span className="rcore-app-sticky-subnav__product">{productLineLabel}</span>
        <button
          type="button"
          className="p-btn-buy"
          onClick={() => window.dispatchEvent(new Event('roooll-inquiry-open'))}
        >
          {page.inquiry}
        </button>
      </div>
    </nav>
  );
}
