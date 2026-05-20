'use client';

import Script from 'next/script';

/** Consent Mode v2 defaults + gtag stub; GA / LinkedIn scripts load after cookie accept (see `lib/analytics.ts`). */
export function GoogleAnalytics() {
  return (
    <Script id="roooll-ga-consent-stub" strategy="beforeInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          wait_for_update: 500
        });
      `}
    </Script>
  );
}
