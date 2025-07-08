import { fetchReportProgression } from '@/lib/analytics/graphql-fetcher';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('aiesec_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { entityId, startDate, endDate } = await req.json();

    if (!entityId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const data = await fetchReportProgression(entityId, startDate, endDate, accessToken);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in reports progression API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch report data', details: errorMessage }, { status: 500 });
  }
}
