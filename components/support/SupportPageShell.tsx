'use client';

import { LoadingBrandLogo } from '@/components/LoadingBrandLogo';
import { RooollBrandMark } from '@/components/RooollBrandMark';
import { SupportServiceAtmosphere } from '@/components/support/SupportServiceAtmosphere';
import { getMessages } from '@/lib/messages';
import { useSiteLang } from '@/lib/site-lang-context';

type Props = {
  children: React.ReactNode;
  /** Channel partner sub-space — dark gold header band. */
  variant?: 'default' | 'channel';
  /** Service page: darkened sunrise frame as full-bleed background. */
  atmosphere?: 'service';
  /** Override default support-page logo alt (e.g. contact route). */
  logoAlt?: string;
  /** When false, omit the top brand logo slot (e.g. contact page). */
  showLogo?: boolean;
};

/** Shared first-screen shell: brand logo + content below (Apple Support–style). */
export function SupportPageShell({
  children,
  variant = 'default',
  atmosphere,
  logoAlt,
  showLogo = true,
}: Props) {
  const lang = useSiteLang();
  const messages = getMessages(lang);
  const logoAltText = logoAlt ?? messages.pages.support.logoAlt;
  const atmosphereAlt = messages.alt.support_service_atmosphere;
  const isChannel = variant === 'channel';
  const isServiceAtmosphere = atmosphere === 'service';

  return (
    <div
      className={`support-page-root${isChannel ? ' support-page-root--channel' : ''}${isServiceAtmosphere ? ' support-page-root--service-atmosphere' : ''}${showLogo ? '' : ' support-page-root--no-logo'}`}
    >
      {isServiceAtmosphere ? <SupportServiceAtmosphere alt={atmosphereAlt} /> : null}
      {isChannel ? <div className="support-channel-band" aria-hidden /> : null}
      {showLogo ? (
        <div
          className={`support-page-logo-slot${isChannel ? ' support-page-logo-slot--channel' : ''}`}
          aria-hidden={false}
        >
          {isServiceAtmosphere ? (
            <div className="support-page-logo loading-brand-plain-root support-page-logo--mark">
              <div className="loading-brand-plain-frame">
                <RooollBrandMark
                  fillContainer
                  color="#f5f5f7"
                  title={logoAltText}
                  className="support-page-logo-mark"
                />
              </div>
            </div>
          ) : (
            <LoadingBrandLogo logoAlt={logoAltText} className="support-page-logo" />
          )}
        </div>
      ) : null}
      <div className="support-page-body">{children}</div>
    </div>
  );
}
