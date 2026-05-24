'use client';

import { LoadingBrandLogo } from '@/components/LoadingBrandLogo';
import { getMessages } from '@/lib/messages';
import { useSiteLang } from '@/lib/site-lang-context';

type Props = {
  children: React.ReactNode;
  /** Channel partner sub-space — dark gold header band. */
  variant?: 'default' | 'channel';
  /** Override default support-page logo alt (e.g. contact route). */
  logoAlt?: string;
  /** When false, omit the top brand logo slot (e.g. contact page). */
  showLogo?: boolean;
};

/** Shared first-screen shell: brand logo + content below (Apple Support–style). */
export function SupportPageShell({
  children,
  variant = 'default',
  logoAlt,
  showLogo = true,
}: Props) {
  const lang = useSiteLang();
  const logoAltText = logoAlt ?? getMessages(lang).pages.support.logoAlt;
  const isChannel = variant === 'channel';

  return (
    <div
      className={`support-page-root${isChannel ? ' support-page-root--channel' : ''}${showLogo ? '' : ' support-page-root--no-logo'}`}
    >
      {isChannel ? <div className="support-channel-band" aria-hidden /> : null}
      {showLogo ? (
        <div
          className={`support-page-logo-slot${isChannel ? ' support-page-logo-slot--channel' : ''}`}
          aria-hidden={false}
        >
          <LoadingBrandLogo logoAlt={logoAltText} className="support-page-logo" />
        </div>
      ) : null}
      <div className="support-page-body">{children}</div>
    </div>
  );
}
