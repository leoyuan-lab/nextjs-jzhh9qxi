import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { checkRateLimit, clientIpFromRequest } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type DownloadPayload = {
  email?: string;
  locale?: string;
  pagePath?: string;
  /** Honeypot — must be empty */
  company?: string;
};

function trimField(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DOWNLOAD_LIMIT = 6;
const DOWNLOAD_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = checkRateLimit(`download:${ip}`, DOWNLOAD_LIMIT, DOWNLOAD_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } },
    );
  }

  let payload: DownloadPayload;
  try {
    payload = (await request.json()) as DownloadPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (trimField(payload.company, 200)) {
    return NextResponse.json({ ok: true });
  }

  const email = trimField(payload.email, 200);
  const locale = trimField(payload.locale, 8) || 'zh';
  const pagePath = trimField(payload.pagePath, 300) || '/';

  if (!email) {
    return NextResponse.json({ error: 'missing_email' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.INQUIRY_TO_EMAIL ?? 'info@roooll.com';

  if (!apiKey || !from) {
    console.error('[download-request] Missing RESEND_API_KEY or RESEND_FROM_EMAIL');
    return NextResponse.json({ error: 'server_config' }, { status: 503 });
  }

  const subject =
    locale === 'en'
      ? `Roooll manual download request — ${email}`
      : `Roooll 手册下载申请 — ${email}`;

  const html = `
    <h2>${locale === 'en' ? 'Manual download request' : '手册下载申请'}</h2>
    <p><strong>${locale === 'en' ? 'Email' : '邮箱'}:</strong> ${escapeHtml(email)}</p>
    <p><strong>${locale === 'en' ? 'Page' : '页面'}:</strong> ${escapeHtml(pagePath)}</p>
    <p><strong>${locale === 'en' ? 'Language' : '语言'}:</strong> ${escapeHtml(locale)}</p>
    <hr />
    <p>${locale === 'en' ? 'Send the secure download link to this address.' : '请向该邮箱发送安全下载链接。'}</p>
  `.trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject,
      html,
    });

    if (error) {
      console.error('[download-request] Resend error:', error);
      return NextResponse.json({ error: 'send_failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[download-request] Unexpected error:', err);
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
}
