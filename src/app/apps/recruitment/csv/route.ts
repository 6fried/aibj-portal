import { NextRequest, NextResponse } from 'next/server';
import { fetchRecruitmentData } from '@/lib/analytics/graphql-fetcher';
import { cookies } from 'next/headers';
import { MemberLead } from '@/lib/types';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('aiesec_access_token')?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') || new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0];
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
  const homeCommitteeId = parseInt(searchParams.get('home_committee') || '175', 10);
  const searchTerm = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '1000', 10);

  try {
    const data = await fetchRecruitmentData(from, to, homeCommitteeId, searchTerm, page, perPage, accessToken);
    const leads = data?.data?.memberLeads?.data || [];
    const rows = leads.map((lead: MemberLead) => {
      const [prenom, ...rest] = lead.lead_name.split(' ');
      const nom = rest.join(' ');
      let phone = lead.phone;
      if (lead.country_code === '229' && phone && phone.length === 8 && !phone.startsWith('01')) {
        phone = '01' + phone;
      }
      return [nom, prenom, lead.email, phone];
    });
    const csvContent = [
      ['Nom', 'Prénom', 'Email', 'Téléphone'],
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
