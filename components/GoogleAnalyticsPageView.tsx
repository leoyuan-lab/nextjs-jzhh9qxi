'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { CONSENT_UPDATED_EVENT, readStoredConsent } from '@/lib/consent';
import { trackPageView } from '@/lib/analytics';

/** Sends GA4 page_view on App Router client navigations when analytics consent is granted. */
export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (!pathname) return;

    const send = () => {
      if (readStoredConsent()?.choice !== 'all') return;
      if (isFirst.current) {
        isFirst.current = false;
        return;
      }
      trackPageView(pathname);
    };

    send();
    window.addEventListener(CONSENT_UPDATED_EVENT, send);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, send);
  }, [pathname]);

  return null;
}
