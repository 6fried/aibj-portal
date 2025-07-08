// API Route pour le test GraphQL
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers';
import { fetchPerformanceFunnel } from '@/lib/analytics/graphql-fetcher';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('aiesec_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { from, to, entityId } = await request.json();

    if (!from || !to || !entityId) {
      return NextResponse.json({ error: 'Missing required filters: from, to, entityId' }, { status: 400 });
    }

    const data = await fetchPerformanceFunnel(from, to, entityId, accessToken);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error in graphql-test route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}
