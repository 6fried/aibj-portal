import 'server-only';
import { cookies } from 'next/headers';
import { LeadsClient } from './_components/LeadsClient';
import { fetchSubOffices } from '@/lib/analytics/graphql-fetcher';
import { SubOffice } from '@/lib/types';

export default async function LeadsPage() {
  // For now, we'll pass an empty array for offices, this can be updated later if needed
    let offices: SubOffice[] = [];
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('aiesec_access_token')?.value;

  if (accessToken) {
    try {
      const officeData = await fetchSubOffices(459, accessToken); // AIESEC in Cote d'Ivoire
      if (officeData && officeData.data && officeData.data.committee) {
        offices = officeData.data.committee.suboffices;
      }
    } catch (error) {
      console.error('Failed to fetch offices on the server:', error);
      // Fallback to client-side fetching if server-side fails
      offices = [];
    }
  } 

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LeadsClient offices={offices} />
    </div>
  );
}
