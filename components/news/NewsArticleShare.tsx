'use client';

import { useCallback, useState } from 'react';

import { ROOOLl_INQUIRY_EMAIL } from '@/lib/site-contact';

export type NewsArticleShareProps = {
  url: string;
  title: string;
  linkAria: string;
  emailAria: string;
  copiedLabel: string;
};

function ShareLinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        d="M9.5 3.5h4a2 2 0 0 1 2 2v4.5M8.5 9.5 14 4M8 5.5H4.5a2 2 0 0 0-2 2V13a2 2 0 0 0 2 2H10a2 2 0 0 0 2-2v-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareEmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
      <rect
        x="2.25"
        y="4.25"
        width="13.5"
        height="9.5"
        rx="1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <path
        d="m2.75 5.25 6.25 4.25 6.25-4.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NewsArticleShare({
  url,
  title,
  linkAria,
  emailAria,
  copiedLabel,
}: NewsArticleShareProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('', url);
    }
  }, [url]);

  const mailHref = `mailto:${ROOOLl_INQUIRY_EMAIL}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  return (
    <div className="newsroom-article-share">
      <button type="button" className="newsroom-article-share__btn" aria-label={linkAria} onClick={copyLink}>
        <ShareLinkIcon />
      </button>
      <a className="newsroom-article-share__btn" href={mailHref} aria-label={emailAria}>
        <ShareEmailIcon />
      </a>
      <span className="newsroom-article-share__status" aria-live="polite">
        {copied ? copiedLabel : ''}
      </span>
    </div>
  );
}
