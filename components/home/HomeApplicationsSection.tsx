'use client';

import { ApplicationsHubDesktopCarousel } from '@/components/applications/ApplicationsHubDesktopCarousel';
import { buildApplicationsHubCarouselCopy } from '@/lib/applications-hub-carousel-copy';
import { getMessages } from '@/lib/messages';
import { useSiteLang } from '@/lib/site-lang-context';

export function HomeApplicationsSection() {
  const lang = useSiteLang();
  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const home = getMessages(safeLang).homepage;
  const carouselCopy = buildApplicationsHubCarouselCopy(safeLang);

  return (
    <section
      id="applications"
      className="home-applications-screen"
      aria-labelledby="home-applications-title"
    >
      <h2 id="home-applications-title" className="home-applications-screen__title">
        {home.applicationsTitle}
      </h2>
      <ApplicationsHubDesktopCarousel copy={carouselCopy} />
    </section>
  );
}
