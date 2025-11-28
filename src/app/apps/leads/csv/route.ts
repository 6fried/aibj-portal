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
  const columnsParam = searchParams.get('columns');

  try {
    const data = await fetchPeopleData(from, to, homeCommitteeId, page, perPage, accessToken);
    const leads = data?.data?.people?.data || [];
    const defaultColumns = ['id', 'name', 'email', 'phone', 'dob', 'created_at', 'contacted_by', 'first_contacted', 'home_lc'] as const;

    type ColumnKey = (typeof defaultColumns)[number];

    const selectedColumns: ColumnKey[] = columnsParam
      ? columnsParam
          .split(',')
          .map((c) => c.trim())
          .filter((c): c is ColumnKey => (defaultColumns as readonly string[]).includes(c))
      : [...defaultColumns];

    const columnDefinitions: Record<ColumnKey, { header: string; getValue: (lead: Person) => string | null }> = {
      id: {
        header: 'ID',
        getValue: (lead) => lead.id,
      },
      name: {
        header: 'Name',
        getValue: (lead) => lead.full_name,
      },
      email: {
        header: 'Email',
        getValue: (lead) => lead.email,
      },
      phone: {
        header: 'Phone',
        getValue: (lead) => lead.contact_detail?.phone || null,
      },
      dob: {
        header: 'Date of Birth',
        getValue: (lead) => lead.dob,
      },
      created_at: {
        header: 'Signed Up On',
        getValue: (lead) => lead.created_at,
      },
      contacted_by: {
        header: 'Contacted By',
        getValue: () => '', // Not available in the data
      },
      first_contacted: {
        header: 'First contacted',
        getValue: (lead) => lead.contacted_at,
      },
      home_lc: {
        header: 'Home LC',
        getValue: (lead) => lead.home_lc.name,
      },
    };

    const headerRow = selectedColumns.map((key) => columnDefinitions[key].header);
    const rows = leads.map((lead: Person) =>
      selectedColumns.map((key) => columnDefinitions[key].getValue(lead)),
    );

    const csvContent = [
      headerRow,
      ...rows,
    ]
      .map((e: (string | null)[]) => e.map((x) => `"${x || 'N/A'}"`).join(','))
      .join('\n');
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
