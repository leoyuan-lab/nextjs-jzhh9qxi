'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SupportCardIcon } from '@/components/support/SupportCardIcon';
import {
  SupportIconBespoke,
  SupportIconDeployment,
  SupportIconGlobal,
  SupportIconWarranty,
} from '@/components/support/SupportIcons';
import { SupportPageShell } from '@/components/support/SupportPageShell';
import { getMessages } from '@/lib/messages';
import { openInquiry } from '@/lib/open-inquiry';
import { useSiteLang } from '@/lib/site-lang-context';

const SERVICE_HERO_IMAGE = '/images/robots/r-core-cobot-fr5-std.webp';

export function SupportServiceClient() {
  const lang = useSiteLang();
  const messages = getMessages(lang);
  const copy = messages.pages.support.service;
  const { global: globalCard, deployment, bespoke, warranty } = copy.cards;
  const heroAlt = messages.alt.support_service_hero;
  const resourcesHref = `/${lang}/support/resources`;

  const openServiceInquiry = () =>
    openInquiry({
      source: 'support_service',
      body:
        lang === 'en'
          ? 'I need technical support for my Roooll cobot deployment.'
          : '我需要 Roooll 协作机器人的技术支持。',
    });

  return (
    <SupportPageShell>
      <header className="support-hero support-hero--center">
        <h1>{copy.heroTitle}</h1>
        <p>{copy.heroBody}</p>
      </header>

      <div className="support-service-grid">
        <article className="support-card support-card--split">
          <div className="support-card-media">
            <Image
              src={SERVICE_HERO_IMAGE}
              alt={heroAlt}
              width={640}
              height={640}
              sizes="(max-width: 767px) 100vw, 40vw"
              className="support-card-media-img"
            />
          </div>
          <div className="support-card-body">
            <SupportCardIcon size="large">
              <SupportIconGlobal />
            </SupportCardIcon>
            <h2>{globalCard.title}</h2>
            <p>{globalCard.body}</p>
          </div>
        </article>

        <div className="support-service-row">
          <article className="support-card support-card--wide">
            <SupportCardIcon size="large">
              <SupportIconBespoke />
            </SupportCardIcon>
            <h2>{bespoke.title}</h2>
            <p>{bespoke.body}</p>
          </article>

          <article className="support-card support-card--narrow support-card--muted">
            <SupportCardIcon size="large">
              <SupportIconDeployment />
            </SupportCardIcon>
            <h2>{deployment.title}</h2>
            <p>{deployment.body}</p>
          </article>
        </div>

        <article className="support-card support-card--hero">
          <SupportCardIcon size="large">
            <SupportIconWarranty />
          </SupportCardIcon>
          <h2>{warranty.title}</h2>
          <p>{warranty.body}</p>
        </article>
      </div>

      <div className="support-service-cta">
        <button type="button" className="support-service-cta-primary" onClick={openServiceInquiry}>
          {copy.ctaContact} ›
        </button>
        <Link href={resourcesHref} className="support-service-cta-secondary">
          {copy.ctaResources} ›
        </Link>
      </div>
    </SupportPageShell>
  );
}
