import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

type InquiryPayload = {
  name?: string;
  email?: string;
  industry?: string;
  body?: string;
  locale?: string;
  source?: string;
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

export async function POST(request: Request) {
  let payload: InquiryPayload;
  try {
    payload = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (trimField(payload.company, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = trimField(payload.name, 120);
  const email = trimField(payload.email, 200);
  const industry = trimField(payload.industry, 120);
  const body = trimField(payload.body, 8000);
  const locale = trimField(payload.locale, 8) || 'zh';
  const source = trimField(payload.source, 120) || 'unknown';
  const pagePath = trimField(payload.pagePath, 300) || '/';

  if (!name || !email || !industry || !body) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.INQUIRY_TO_EMAIL ?? 'info@roooll.com';

  if (!apiKey || !from) {
    console.error('[inquiry] Missing RESEND_API_KEY or RESEND_FROM_EMAIL');
    return NextResponse.json({ error: 'server_config' }, { status: 503 });
  }

  const subject =
    locale === 'en'
      ? `Roooll inquiry — ${name} (${industry})`
      : `Roooll 询价 — ${name}（${industry}）`;

  const html = `
    <h2>${locale === 'en' ? 'New website inquiry' : '网站新询价'}</h2>
    <p><strong>${locale === 'en' ? 'Name' : '姓名'}:</strong> ${escapeHtml(name)}</p>
    <p><strong>${locale === 'en' ? 'Email' : '邮箱'}:</strong> ${escapeHtml(email)}</p>
    <p><strong>${locale === 'en' ? 'Industry' : '行业'}:</strong> ${escapeHtml(industry)}</p>
    <p><strong>${locale === 'en' ? 'Page' : '页面'}:</strong> ${escapeHtml(pagePath)}</p>
    <p><strong>${locale === 'en' ? 'Source' : '来源'}:</strong> ${escapeHtml(source)}</p>
    <p><strong>${locale === 'en' ? 'Language' : '语言'}:</strong> ${escapeHtml(locale)}</p>
    <hr />
    <p style="white-space:pre-wrap">${escapeHtml(body)}</p>
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
      console.error('[inquiry] Resend error:', error);
      return NextResponse.json({ error: 'send_failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[inquiry] Unexpected error:', err);
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
}
