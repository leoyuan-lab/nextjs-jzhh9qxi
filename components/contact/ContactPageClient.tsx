'use client';

import Link from 'next/link';
import { SupportCardIcon } from '@/components/support/SupportCardIcon';
import { SupportPageShell } from '@/components/support/SupportPageShell';
import {
  ContactIconInquiry,
  ContactIconMail,
  ContactIconSupport,
} from '@/components/contact/ContactIcons';
import { getMessages } from '@/lib/messages';
import { openInquiry } from '@/lib/open-inquiry';
import { useSiteLang } from '@/lib/site-lang-context';

const CONTACT_EMAIL = 'info@roooll.com';

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
          <a className="contact-hero-email" href={`mailto:${CONTACT_EMAIL}`}>
            {copy.emailCta}
          </a>
        </header>

        <div className="contact-card-grid">
          <ContactCard
            icon={<ContactIconInquiry />}
            title={copy.cards.inquiry.title}
            body={copy.cards.inquiry.body}
            cta={copy.cards.inquiry.cta}
            onClick={openContactInquiry}
          />
          <ContactCard
            icon={<ContactIconMail />}
            title={copy.cards.email.title}
            body={copy.cards.email.body}
            cta={copy.cards.email.cta}
            href={`mailto:${CONTACT_EMAIL}`}
          />
          <ContactCard
            icon={<ContactIconSupport />}
            title={copy.cards.support.title}
            body={copy.cards.support.body}
            cta={copy.cards.support.cta}
            href={supportHref}
          />
        </div>

        <p className="contact-footnote">
          {copy.footnote}{' '}
          <Link href={channelHref} className="contact-footnote-link">
            {copy.footnoteLink}
          </Link>
        </p>
      </div>
    </SupportPageShell>
  );
}
