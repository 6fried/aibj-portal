import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';
import { fetchPerformanceFunnel } from '@/lib/analytics/graphql-fetcher';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('aiesec_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entityId')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!entityId || !from || !to) {
      return NextResponse.json({ error: 'Missing required parameters: entityId, from, to' }, { status: 400 })
    }

    const data = await fetchPerformanceFunnel(entityId, from, to, accessToken);

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('Error in performance route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
