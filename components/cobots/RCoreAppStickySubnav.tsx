'use client';

import { getMessages } from '@/lib/messages';
import { openInquiry } from '@/lib/open-inquiry';
import type { AppLocale } from '@/lib/messages';
import type { ImmersiveMessagesPageKey } from '@/lib/immersive-series-messages';

type Props = {
  lang: AppLocale;
  productLineLabel: string;
  messagesPageKey?: ImmersiveMessagesPageKey;
};

/** Application 段起：顶部宽胶囊二级导航（Apple 式两侧 ~20vh 留白，与 Cookie 同款毛玻璃） */
export function RCoreAppStickySubnav({ lang, productLineLabel, messagesPageKey = 'r_lite' }: Props) {
  const msgs = getMessages(lang);
  const page = msgs.pages[messagesPageKey];
  const copy = page.scenario_subnav;

  return (
    <nav className="rcore-consult-nav-bar" aria-label={copy.brand_top_aria}>
      <div className="rcore-consult-nav-bar__glass cookie-consent__glass roooll-liquid-glass roooll-liquid-glass--dark">
        <span className="rcore-consult-nav-bar__product">{productLineLabel}</span>
        <button
          type="button"
          className="cookie-consent__btn cookie-consent__btn--primary"
          onClick={() => openInquiry({ source: 'immersive_subnav' })}
        >
          {page.inquiry}
        </button>
      </div>
    </nav>
  );
}
