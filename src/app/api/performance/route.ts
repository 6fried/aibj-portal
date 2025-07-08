// src/app/api/performance/route.ts
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
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const entityId = searchParams.get('entityId')

    if (!from || !to || !entityId) {
      return NextResponse.json({ error: 'Missing required filters: from, to, entityId' }, { status: 400 })
    }

    const data = await fetchPerformanceFunnel(from, to, entityId, accessToken);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error in performance route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data', details: error.message },
      { status: 500 }
    );
  }
}