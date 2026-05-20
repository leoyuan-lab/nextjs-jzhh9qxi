'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/** Sends GA4 page_view on App Router client navigations (locale-prefixed paths). */
export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== 'function' || !pathname) return;
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    window.gtag('config', GA_ID, {
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}
