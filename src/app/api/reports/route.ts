import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';
import { fetchStatusProgression } from '@/lib/analytics/graphql-fetcher';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('aiesec_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const entityId = searchParams.get('entityId')

    if (!from || !to || !entityId) {
      return NextResponse.json({ error: 'Missing required filters: from, to, entityId' }, { status: 400 })
    }

    const data = await fetchStatusProgression(entityId, from, to, accessToken);

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('Error in reports route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

