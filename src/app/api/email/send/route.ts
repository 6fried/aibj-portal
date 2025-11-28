import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

// Minimal validation types (avoid importing server-incompatible modules)
type Recipient = { email: string; firstName?: string; lastName?: string; committee?: string };

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function base64UrlEncode(str: string) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function applyPlaceholders(html: string, r: Recipient) {
  return html
    .replace(/\{\{\s*firstName\s*\}\}/g, r.firstName || '')
    .replace(/\{\{\s*lastName\s*\}\}/g, r.lastName || '')
    .replace(/\{\{\s*committee\s*\}\}/g, r.committee || '');
}

function buildMime({
  to,
  bcc,
  subject,
  html,
  fromName,
  replyTo,
}: {
  to?: string;
  bcc?: string[];
  subject: string;
  html: string;
  fromName?: string;
  replyTo?: string;
}) {
  const headers: string[] = [];
  if (to) headers.push(`To: ${to}`);
  if (bcc && bcc.length) headers.push(`Bcc: ${bcc.join(', ')}`);
  headers.push(`Subject: ${subject}`);
  if (fromName) headers.push(`From: ${fromName}`);
  if (replyTo) headers.push(`Reply-To: ${replyTo}`);
  headers.push('MIME-Version: 1.0');
  headers.push('Content-Type: text/html; charset="UTF-8"');
  const raw = headers.join('\r\n') + `\r\n\r\n${html}`;
  return base64UrlEncode(raw);
}

export async function POST(request: NextRequest) {
  try {
    // Require Gmail connection (demo via httpOnly cookie). In production store per-user securely.
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('gmail_refresh_token')?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: 'Gmail account not connected' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, html, recipients, mode, replyTo, fromName, testOnly } = body || {};

    if (!subject || !html) {
      return NextResponse.json({ error: 'Missing subject or html' }, { status: 400 });
    }
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
    }
    if (mode !== 'individual' && mode !== 'bcc') {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    // OAuth2 client using refresh token
    const clientId = process.env.GOOGLE_CLIENT_ID as string | undefined;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string | undefined;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI as string | undefined;
    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'Missing Google OAuth env vars' }, { status: 500 });
    }

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const jobId = `job_${Date.now()}`;
    const summary = { queued: 0, sent: 0, failed: 0 };

    // Helper send with minimal retry on rate limits
    const sendRaw = async (raw: string): Promise<string> => {
      let attempt = 0;
      // retry up to 3 times on 429/403 rate limit
      while (true) {
        try {
          const resp = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
          return resp.data.id as string;
        } catch (e: unknown) {
          const err = e as { code?: number; response?: { status?: number } };
          const status = err.code || err.response?.status;
          if ((status === 429 || status === 403) && attempt < 3) {
            const delay = 500 * Math.pow(2, attempt); // 0.5s, 1s, 2s
            await sleep(delay);
            attempt++;
            continue;
          }
          throw e;
        }
      }
    };

    if (mode === 'individual') {
      const list = testOnly ? recipients.slice(0, 1) : recipients;
      for (const r of list) {
        const bodyHtml = applyPlaceholders(html, r);
        const raw = buildMime({ to: r.email, subject, html: bodyHtml, fromName, replyTo });
        summary.queued += 1;
        try {
          const id = await sendRaw(raw);
          console.log(`[email][${jobId}] sent individual to=${r.email} id=${id}`);
          summary.sent += 1;
        } catch {
          summary.failed += 1;
        }
        // tiny spacing to avoid burst
        await sleep(50);
      }
    } else {
      // BCC mode: chunk recipients, no personalization
      const chunkSize = 80; // safe default
      const list = testOnly ? recipients.slice(0, 1) : recipients;
      for (let i = 0; i < list.length; i += chunkSize) {
        const chunk = list.slice(i, i + chunkSize);
        const bcc = chunk.map((r: Recipient) => r.email);
        const raw = buildMime({
          to: 'Undisclosed recipients <noreply@aiesec.local>',
          bcc,
          subject,
          html,
          fromName,
          replyTo,
        });
        summary.queued += chunk.length;
        try {
          const id = await sendRaw(raw);
          console.log(`[email][${jobId}] sent bcc count=${chunk.length} id=${id}`);
          summary.sent += chunk.length;
        } catch {
          summary.failed += chunk.length;
        }
        await sleep(150);
      }
    }

    return NextResponse.json({ jobId, accepted: recipients.length, mode, testOnly: !!testOnly, ...summary });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
