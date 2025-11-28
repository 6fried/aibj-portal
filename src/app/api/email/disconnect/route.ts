import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('gmail_refresh_token')?.value;
  const isHttps = request.nextUrl.protocol === 'https:';

  let revoked = false;
  let revokeError: string | undefined;

  if (refreshToken) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const resp = await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: refreshToken }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));
      revoked = resp.ok;
      if (!resp.ok) {
        revokeError = await resp.text().catch(() => 'revoke_failed');
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        revokeError = e.message || 'revoke_exception';
      } else {
        revokeError = 'revoke_exception';
      }
    }
  }

  const res = NextResponse.json({ ok: true, revoked, revokeError: revokeError || null });
  // Clear the refresh token cookie
  res.cookies.set('gmail_refresh_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps || process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}
