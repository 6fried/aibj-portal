import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.send');

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Missing Google OAuth env vars' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state') || '';

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` +
    `&include_granted_scopes=true` +
    `&prompt=consent` +
    (state ? `&state=${encodeURIComponent(state)}` : '');

  return NextResponse.redirect(url);
}
