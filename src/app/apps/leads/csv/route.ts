import { NextRequest, NextResponse } from 'next/server';
import { fetchPeopleData } from '@/lib/analytics/graphql-fetcher';
import { cookies } from 'next/headers';
import { Person } from '@/lib/types';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('aiesec_access_token')?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('start_date') || new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0];
  const to = searchParams.get('end_date') || new Date().toISOString().split('T')[0];
  const homeCommitteeId = parseInt(searchParams.get('home_committee') || '175', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '1000', 10);

  try {
    const data = await fetchPeopleData(from, to, homeCommitteeId, page, perPage, accessToken);
    const leads = data?.data?.people?.data || [];
    const rows = leads.map((lead: Person) => {
      return [
        lead.id,
        lead.full_name,
        lead.email,
        lead.dob,
        lead.created_at,
        '', // Contacted By - Not available in the data
        lead.contacted_at,
        lead.home_lc.name
      ];
    });
    const csvContent = [
      ['ID', 'Name', 'Email', 'Date of Birth', 'Signed Up On', 'Contacted By', 'First contacted', 'Home LC'],
      ...rows
    ].map((e: (string | null)[]) => e.map(x => `"${x || 'N/A'}"`).join(',')).join('\n');
    // Add BOM for Excel/accents
    return new NextResponse('\uFEFF' + csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="leads.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate CSV', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
