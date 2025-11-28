import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const hasRefresh = !!cookieStore.get('gmail_refresh_token')?.value;
  return NextResponse.json({ connected: hasRefresh });
}
