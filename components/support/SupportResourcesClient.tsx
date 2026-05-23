'use client';

import Image from 'next/image';
import { useState } from 'react';
import { SupportGoldCardLink } from '@/components/support/SupportGoldCard';
import { SupportCardIcon } from '@/components/support/SupportCardIcon';
import { SupportIconDistributor, SupportIconManual } from '@/components/support/SupportIcons';
import { SupportPageShell } from '@/components/support/SupportPageShell';
import { getMessages } from '@/lib/messages';
import { useSiteLang } from '@/lib/site-lang-context';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function SupportResourcesClient() {
  const lang = useSiteLang();
  const messages = getMessages(lang);
  const copy = messages.pages.support.resources;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorKey, setErrorKey] = useState<'errorInvalid' | 'errorRate' | 'errorGeneric'>(
    'errorGeneric',
  );

  const distributorHref = `/${lang}/support/distributors`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setErrorKey('errorInvalid');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/download-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          locale: lang,
          pagePath: `/${lang}/support/resources`,
          company: '',
        }),
      });

      if (res.status === 429) {
        setErrorKey('errorRate');
        setStatus('error');
        return;
      }
      if (!res.ok) {
        setErrorKey('errorGeneric');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorKey('errorGeneric');
      setStatus('error');
    }
  };

  return (
    <SupportPageShell>
      <header className="support-hero">
        <h1>{copy.heroTitle}</h1>
      </header>

      <div className="support-card-stack">
        <article className="support-card support-card--action">
          <div className="support-card-header">
            <SupportCardIcon size="large">
              <SupportIconManual />
            </SupportCardIcon>
            <div className="support-card-copy">
              <h2>{copy.manualCard.title}</h2>
              <p>{copy.manualCard.body}</p>
            </div>
          </div>
          <form className="support-download-form" onSubmit={handleSubmit} noValidate>
            <label className="support-download-label" htmlFor="support-manual-email">
              {copy.manualCard.emailLabel}
            </label>
            <div className="support-download-row">
              <input
                id="support-manual-email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                placeholder={copy.manualCard.emailPlaceholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error' || status === 'success') setStatus('idle');
                }}
                disabled={status === 'submitting' || status === 'success'}
                required
              />
              <button
                type="submit"
                disabled={status === 'submitting' || status === 'success'}
              >
                {status === 'submitting' ? copy.manualCard.submitting : copy.manualCard.submit}
              </button>
            </div>
            {status === 'success' ? (
              <p className="support-form-feedback support-form-feedback--success" role="status">
                {copy.manualCard.success}
              </p>
            ) : null}
            {status === 'error' ? (
              <p className="support-form-feedback support-form-feedback--error" role="alert">
                {copy.manualCard[errorKey]}
              </p>
            ) : null}
          </form>
        </article>

        <SupportGoldCardLink
          href={distributorHref}
          className="support-card--link"
          badge={copy.distributorCard.badge}
          aria-label={messages.alt.support_distributor}
        >
          <div className="support-card-header">
            <SupportCardIcon size="large">
              <SupportIconDistributor />
            </SupportCardIcon>
            <div className="support-card-copy">
              <h2>{copy.distributorCard.title}</h2>
              <p>{copy.distributorCard.body}</p>
              <span className="support-card-cta">{copy.distributorCard.cta} ›</span>
            </div>
          </div>
        </SupportGoldCardLink>
      </div>
    </SupportPageShell>
  );
}
