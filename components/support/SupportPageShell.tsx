'use client';

import { LoadingBrandLogo } from '@/components/LoadingBrandLogo';
import { getMessages } from '@/lib/messages';
import { useSiteLang } from '@/lib/site-lang-context';

type Props = {
  children: React.ReactNode;
  /** Channel partner sub-space — dark gold header band. */
  variant?: 'default' | 'channel';
};

/** Shared first-screen shell: brand logo + content below (Apple Support–style). */
export function SupportPageShell({ children, variant = 'default' }: Props) {
  const lang = useSiteLang();
  const logoAlt = getMessages(lang).pages.support.logoAlt;
  const isChannel = variant === 'channel';

  return (
    <div
      className={`support-page-root${isChannel ? ' support-page-root--channel' : ''}`}
    >
      {isChannel ? <div className="support-channel-band" aria-hidden /> : null}
      <div
        className={`support-page-logo-slot${isChannel ? ' support-page-logo-slot--channel' : ''}`}
        aria-hidden={false}
      >
        <LoadingBrandLogo logoAlt={logoAlt} className="support-page-logo" />
      </div>
      <div className="support-page-body">{children}</div>
    </div>
  );
}
