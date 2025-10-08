import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { contactMemberLead } from '@/lib/analytics/graphql-fetcher';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('aiesec_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id } = body;
    console.log('[DEBUG] contactMemberLead called with id:', id);
    const result = await contactMemberLead(id, accessToken);
    console.log('[DEBUG] contactMemberLead result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[DEBUG] Error in contactMemberLead API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to contact member lead', details: errorMessage }, { status: 500 });
  }
}
