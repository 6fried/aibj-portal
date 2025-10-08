import { NextRequest, NextResponse } from 'next/server';
import { fetchRecruitmentData, fetchSubOffices } from '@/lib/analytics/graphql-fetcher';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('aiesec_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  try {
    if (type === 'suboffices') {
      const committeeId = parseInt(searchParams.get('committeeId') || '459', 10);
      const data = await fetchSubOffices(committeeId, accessToken);
      return NextResponse.json(data);
    } else {
      const from = searchParams.get('from') || new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0];
      const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
      const homeCommitteeId = parseInt(searchParams.get('home_committee') || '175', 10);
            const searchTerm = searchParams.get('q') || '';
      const page = parseInt(searchParams.get('page') || '1', 10);
      const perPage = parseInt(searchParams.get('per_page') || '25', 10);
      const data = await fetchRecruitmentData(from, to, homeCommitteeId, searchTerm, page, perPage, accessToken);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error in recruitment API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch data', details: errorMessage }, { status: 500 });
  }
}
