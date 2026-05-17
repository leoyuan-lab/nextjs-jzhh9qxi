'use client';

import Link from 'next/link';
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
    <nav className="nav-sub nav-sub-enter rcore-brand-top" aria-label={copy.brand_top_aria}>
      <div className="rcore-brand-top__inner">
        <Link href={home} className="rcore-brand-top__logo-link" aria-label={brandAria}>
          <svg className="rcore-brand-top__logo" width={40} height={40} viewBox="0 0 128 128" role="img" aria-hidden>
            <circle cx="64" cy="66" r="34" fill="currentColor" />
            <path
              d="M18 67C18 58 37 51 63 51C89 51 110 58 110 67C110 76 89 83 63 83C37 83 18 76 18 67Z"
              stroke="currentColor"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M32 74C52 80 82 78 98 71"
              stroke="var(--logo-cutout)"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </svg>
        </Link>
        <p className="rcore-brand-top__tagline">{copy.tagline}</p>
      </div>
    </nav>
  );
}
