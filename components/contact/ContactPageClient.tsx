'use client';

import Link from 'next/link';
import { SupportCardIcon } from '@/components/support/SupportCardIcon';
import { SupportGoldCardLink } from '@/components/support/SupportGoldCard';
import { SupportIconDistributor } from '@/components/support/SupportIcons';
import { SupportPageShell } from '@/components/support/SupportPageShell';
import {
  ContactIconInquiry,
  ContactIconMail,
  ContactIconSupport,
} from '@/components/contact/ContactIcons';
import { getMessages } from '@/lib/messages';
import { openInquiry } from '@/lib/open-inquiry';
import {
  ROOOLl_CONTACT_PHONE_DISPLAY,
  ROOOLl_CONTACT_PHONE_TEL,
  ROOOLl_INQUIRY_EMAIL,
} from '@/lib/site-contact';
import { useSiteLang } from '@/lib/site-lang-context';

type ContactCardProps = {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  href?: string;
  onClick?: () => void;
};

function ContactCard({ icon, title, body, cta, href, onClick }: ContactCardProps) {
  const content = (
    <>
      <SupportCardIcon size="large">{icon}</SupportCardIcon>
      <h2>{title}</h2>
      <p>{body}</p>
      <span className="support-card-cta">{cta} ›</span>
    </>
  );

  const className = 'support-card support-card--tile support-card--link contact-card';

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}

export function ContactPageClient() {
  const lang = useSiteLang();
  const messages = getMessages(lang);
  const copy = messages.pages.contact;
  const supportHref = `/${lang}/support/service`;
  const channelHref = `/${lang}/support/distributors`;

  const openContactInquiry = () =>
    openInquiry({
      source: 'contact_page',
      body:
        lang === 'en'
          ? 'I would like to discuss a Roooll cobot project.\n\nApplication / industry:\nPayload & reach needed:\nTimeline:'
          : '我想咨询 Roooll 协作机器人项目。\n\n应用 / 行业：\n负载与臂展需求：\n项目时间：',
    });

  return (
    <SupportPageShell showLogo={false}>
      <div className="contact-page">
        <header className="support-hero support-hero--center support-hero--contact">
          <h1 className="roooll-page-hero-title">{copy.heroTitle}</h1>
          <p>{copy.heroBody}</p>
          <div className="contact-hero-direct">
            <a className="contact-hero-email" href={`mailto:${ROOOLl_INQUIRY_EMAIL}`}>
              {copy.emailCta}
            </a>
            <a className="contact-hero-phone" href={`tel:${ROOOLl_CONTACT_PHONE_TEL}`}>
              {ROOOLl_CONTACT_PHONE_DISPLAY}
            </a>
            <p className="contact-hero-address">{copy.address}</p>
          </div>
        </header>

        <button
          type="button"
          className="support-card support-card--tile support-card--link contact-inquiry-card"
          onClick={openContactInquiry}
        >
          <SupportCardIcon size="large">
            <ContactIconInquiry />
          </SupportCardIcon>
          <h2>{copy.cards.inquiry.title}</h2>
          <p>{copy.cards.inquiry.body}</p>
          <span className="support-card-cta">{copy.cards.inquiry.cta} ›</span>
        </button>

        <div className="contact-card-grid contact-card-grid--duo">
          <ContactCard
            icon={<ContactIconMail />}
            title={copy.cards.email.title}
            body={copy.cards.email.body}
            cta={copy.cards.email.cta}
            href={`mailto:${ROOOLl_INQUIRY_EMAIL}`}
          />
          <ContactCard
            icon={<ContactIconSupport />}
            title={copy.cards.support.title}
            body={copy.cards.support.body}
            cta={copy.cards.support.cta}
            href={supportHref}
          />
        </div>

        <div className="support-card-stack contact-channel-stack">
          <SupportGoldCardLink
            href={channelHref}
            className="support-card--link"
            badge={copy.channelCard.badge}
            aria-label={messages.alt.support_distributor}
          >
            <div className="support-card-header">
              <SupportCardIcon size="large">
                <SupportIconDistributor />
              </SupportCardIcon>
              <div className="support-card-copy">
                <h2>{copy.channelCard.title}</h2>
                <p>{copy.channelCard.body}</p>
                <span className="support-card-cta">{copy.channelCard.cta} ›</span>
              </div>
            </div>
          </SupportGoldCardLink>
        </div>
      </div>
    </SupportPageShell>
  );
}
