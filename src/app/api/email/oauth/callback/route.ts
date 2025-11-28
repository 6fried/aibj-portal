import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'Missing Google OAuth env vars' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '/apps/leads';
  const origin = request.nextUrl.origin; // Preserve current scheme (http/https)
  const isHttps = request.nextUrl.protocol === 'https:';

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  try {
    // Add a timeout to avoid hanging and leading to empty responses
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!tokenRes.ok) {
      // Redirect back with error info in query to keep UX responsive
      const url = new URL(state, origin);
      url.searchParams.set('oauth_error', 'token_exchange_failed');
      return NextResponse.redirect(url.toString());
    }

    const tokenJson = await tokenRes.json();
    const refreshToken = tokenJson.refresh_token as string | undefined;

    if (!refreshToken) {
      const url = new URL(state, origin);
      url.searchParams.set('oauth_error', 'no_refresh_token');
      return NextResponse.redirect(url.toString());
    }

    // Store refresh token in httpOnly cookie (demo). In production, prefer encrypted DB storage per user.
    const successUrl = new URL(state, origin).toString();
    const res = NextResponse.redirect(successUrl);
    res.cookies.set('gmail_refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps || process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (e: unknown) {
    if(e instanceof Error) {
      console.error(e.message);
    }
    const url = new URL(state, origin);
    url.searchParams.set('oauth_error', 'callback_exception');
    return NextResponse.redirect(url.toString());
  }
}
