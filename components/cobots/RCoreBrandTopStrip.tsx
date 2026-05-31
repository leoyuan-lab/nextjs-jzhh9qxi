'use client';

import Link from 'next/link';
import { RooollBrandMark } from '@/components/RooollBrandMark';
import { getMessages } from '@/lib/messages';
import type { AppLocale } from '@/lib/messages';
import type { ImmersiveMessagesPageKey } from '@/lib/immersive-series-messages';

type Props = { lang: AppLocale; messagesPageKey?: ImmersiveMessagesPageKey };

export function RCoreBrandTopStrip({ lang, messagesPageKey = 'r_lite' }: Props) {
  const msgs = getMessages(lang);
  const copy = msgs.pages[messagesPageKey].scenario_subnav;
  const brandAria = msgs.nav.brandLogoAria;
  const home = `/${lang}`;

  return (
    <nav
      className="nav-sub nav-sub-enter rcore-brand-top"
      aria-label={copy.brand_top_aria}
    >
      <div className="rcore-brand-top__inner">
        <Link href={home} className="rcore-brand-top__logo-link" aria-label={brandAria}>
          <RooollBrandMark decorative width={40} className="rcore-brand-top__logo" />
        </Link>
        <p className="rcore-brand-top__tagline">{copy.tagline}</p>
      </div>
    </nav>
  );
}
