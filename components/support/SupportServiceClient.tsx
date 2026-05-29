'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SupportCardIcon } from '@/components/support/SupportCardIcon';
import {
  SupportIconBespoke,
  SupportIconDeployment,
  SupportIconGlobal,
  SupportIconLifetime,
  SupportIconManual,
  SupportIconPreventive,
  SupportIconSoftware,
  SupportIconSpareParts,
  SupportIconWarranty,
} from '@/components/support/SupportIcons';
import { SupportPageShell } from '@/components/support/SupportPageShell';
import { getMessages } from '@/lib/messages';
import { openInquiry } from '@/lib/open-inquiry';
import { useSiteLang } from '@/lib/site-lang-context';

const SERVICE_HERO_IMAGE = '/images/robots/r-core-cobot-fr5-std-hd.webp';

type ServiceCardProps = {
  className?: string;
  icon: ReactNode;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  banner?: boolean;
};

function ServiceCard({ className, icon, title, body, href, cta, banner }: ServiceCardProps) {
  const content = banner ? (
    <>
      <SupportCardIcon size="large">{icon}</SupportCardIcon>
      <div className="support-card-banner-copy">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      {cta ? <span className="support-card-cta">{cta} ›</span> : null}
    </>
  ) : (
    <>
      <SupportCardIcon size="large">{icon}</SupportCardIcon>
      <h2>{title}</h2>
      <p>{body}</p>
      {cta ? <span className="support-card-cta">{cta} ›</span> : null}
    </>
  );

  const cardClass = [
    'support-card',
    'support-card--tile',
    banner ? 'support-card--banner' : '',
    href ? 'support-card--link' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return <article className={cardClass}>{content}</article>;
}

export function SupportServiceClient() {
  const lang = useSiteLang();
  const messages = getMessages(lang);
  const copy = messages.pages.support.service;
  const { cards } = copy;
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
      <div className="support-service-page">
        <header className="support-hero support-hero--center support-hero--service">
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroBody}</p>
        </header>

        <div className="support-service-bento">
          <article className="support-card support-card--split support-bento-global">
            <div className="support-card-body">
              <SupportCardIcon size="large">
                <SupportIconGlobal />
              </SupportCardIcon>
              <h2>{cards.global.title}</h2>
              <p>{cards.global.body}</p>
            </div>
            <div className="support-card-media">
              <Image
                src={SERVICE_HERO_IMAGE}
                alt={heroAlt}
                width={640}
                height={640}
                sizes="(max-width: 767px) 100vw, 28vw"
                className="support-card-media-img"
              />
            </div>
          </article>

          <ServiceCard
            className="support-bento-bespoke"
            icon={<SupportIconBespoke />}
            title={cards.bespoke.title}
            body={cards.bespoke.body}
          />
          <ServiceCard
            className="support-bento-deployment"
            icon={<SupportIconDeployment />}
            title={cards.deployment.title}
            body={cards.deployment.body}
          />
          <ServiceCard
            className="support-bento-warranty"
            icon={<SupportIconWarranty />}
            title={cards.warranty.title}
            body={cards.warranty.body}
          />
          <ServiceCard
            className="support-bento-preventive"
            icon={<SupportIconPreventive />}
            title={cards.preventive.title}
            body={cards.preventive.body}
          />
          <ServiceCard
            className="support-bento-lifetime"
            icon={<SupportIconLifetime />}
            title={cards.lifetime.title}
            body={cards.lifetime.body}
          />
          <ServiceCard
            className="support-bento-software"
            icon={<SupportIconSoftware />}
            title={cards.software.title}
            body={cards.software.body}
          />
          <ServiceCard
            className="support-bento-spare"
            icon={<SupportIconSpareParts />}
            title={cards.spareParts.title}
            body={cards.spareParts.body}
          />
          <ServiceCard
            className="support-bento-resources"
            banner
            icon={<SupportIconManual />}
            title={cards.resources.title}
            body={cards.resources.body}
            href={resourcesHref}
          />
        </div>

        <div className="support-service-cta">
          <button type="button" className="support-service-cta-primary" onClick={openServiceInquiry}>
            {copy.ctaContact} ›
          </button>
          <Link href={resourcesHref} className="support-service-cta-secondary">
            {copy.ctaResources} ›
          </Link>
        </div>
      </div>
    </SupportPageShell>
  );
}
