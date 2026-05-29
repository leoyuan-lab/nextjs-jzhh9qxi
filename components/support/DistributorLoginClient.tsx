'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { SupportPageShell } from '@/components/support/SupportPageShell';
import { getMessages } from '@/lib/messages';
import { useSiteLang } from '@/lib/site-lang-context';

export function DistributorLoginClient() {
  const lang = useSiteLang();
  const copy = getMessages(lang).pages.support.distributors.login;
  const distributorsHref = `/${lang}/support/distributors`;
  const [showError, setShowError] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowError(true);
  };

  return (
    <SupportPageShell variant="channel">
      <div className="distributor-login-page">
        <div className="distributor-login-backdrop" aria-hidden />

        <div className="distributor-login-glass">
          <h1 className="distributor-login-title">{copy.heroTitle}</h1>

          <form className="distributor-login-form" onSubmit={handleSubmit} noValidate>
            <label className="distributor-login-field">
              <span>{copy.emailLabel}</span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                placeholder={copy.emailPlaceholder}
                aria-invalid={showError ? true : undefined}
              />
            </label>
            <label className="distributor-login-field">
              <span>{copy.passwordLabel}</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder={copy.passwordPlaceholder}
                aria-invalid={showError ? true : undefined}
              />
            </label>

            {showError ? (
              <p className="distributor-login-error" role="alert">
                {copy.errorInvalid}
              </p>
            ) : null}

            <button type="submit" className="distributor-login-submit">
              {copy.submit}
            </button>
          </form>

          <p className="distributor-login-note">{copy.note}</p>

          <Link href={distributorsHref} className="distributor-login-back">
            {copy.back} ›
          </Link>
        </div>
      </div>
    </SupportPageShell>
  );
}
