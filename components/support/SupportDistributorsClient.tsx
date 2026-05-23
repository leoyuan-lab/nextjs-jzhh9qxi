'use client';

import { SupportCardIcon } from '@/components/support/SupportCardIcon';
import { SupportGoldCard } from '@/components/support/SupportGoldCard';
import {
  SupportIconBespoke,
  SupportIconChannel,
  SupportIconDeployment,
  SupportIconPartner,
} from '@/components/support/SupportIcons';
import { SupportPageShell } from '@/components/support/SupportPageShell';
import { getMessages } from '@/lib/messages';
import { openInquiry } from '@/lib/open-inquiry';
import { useSiteLang } from '@/lib/site-lang-context';

const PERK_ICONS = {
  pricing: <SupportIconChannel />,
  launch: <SupportIconDeployment />,
  training: <SupportIconBespoke />,
} as const;

export function SupportDistributorsClient() {
  const lang = useSiteLang();
  const copy = getMessages(lang).pages.support.distributors;
  const perkOrder = ['pricing', 'launch', 'training'] as const;

  const openChannelInquiry = () =>
    openInquiry({
      source: 'support_distributors',
      body:
        lang === 'en'
          ? 'I am interested in Roooll distributor / channel partnership.'
          : '我希望了解 Roooll 经销商 / 渠道合作。',
    });

  return (
    <SupportPageShell>
      <header className="support-hero support-hero--center">
        <h1>{copy.heroTitle}</h1>
        <p>{copy.heroBody}</p>
      </header>

      <ul className="support-channel-perks">
        {perkOrder.map((key) => {
          const perk = copy.perks[key];
          return (
            <li key={key} className="support-channel-perk">
              <SupportCardIcon>{PERK_ICONS[key]}</SupportCardIcon>
              <h2>{perk.title}</h2>
              <p>{perk.body}</p>
            </li>
          );
        })}
      </ul>

      <div className="support-card-stack">
        <SupportGoldCard badge={copy.badge}>
          <SupportCardIcon size="large">
            <SupportIconChannel />
          </SupportCardIcon>
          <h2>{copy.cards.access.title}</h2>
          <p>{copy.cards.access.body}</p>
          <button
            type="button"
            className="support-card-cta support-card-cta--button"
            onClick={openChannelInquiry}
          >
            {copy.cards.access.cta} ›
          </button>
        </SupportGoldCard>

        <SupportGoldCard badge={copy.badge}>
          <SupportCardIcon size="large">
            <SupportIconPartner />
          </SupportCardIcon>
          <h2>{copy.cards.become.title}</h2>
          <p>{copy.cards.become.body}</p>
          <button
            type="button"
            className="support-card-cta support-card-cta--button"
            onClick={openChannelInquiry}
          >
            {copy.cards.become.cta} ›
          </button>
        </SupportGoldCard>
      </div>
    </SupportPageShell>
  );
}
