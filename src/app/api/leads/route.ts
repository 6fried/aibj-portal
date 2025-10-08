import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { fetchPeopleData } from '@/lib/analytics/graphql-fetcher';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('aiesec_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start_date') || new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0];
  const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];
  const homeCommitteeId = parseInt(searchParams.get('home_committee') || '175', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '25', 10);

  try {
    const data = await fetchPeopleData(startDate, endDate, homeCommitteeId, page, perPage, accessToken);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in leads API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch data', details: errorMessage }, { status: 500 });
  }
}
