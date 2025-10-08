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
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-gray-50/50 dark:bg-zinc-900/50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground mt-2">
          Sélectionnez les filtres pour lancer une recherche.
        </p>
      </div>

      <LeadsClient offices={offices} />
    </main>
  );
}
