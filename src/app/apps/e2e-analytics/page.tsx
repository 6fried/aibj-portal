import 'server-only'; // Ensures this component only runs on the server

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Office } from '@/lib/office-utils';
import { E2EAnalyticsClient } from './_components/E2EAnalyticsClient';

interface CsvRow {
  id: string;
  name: string;
  type: string;
  parent_id: string;
}

async function getOffices(): Promise<Office[]> {
  return new Promise((resolve, reject) => {
    const csvFilePath = path.join(process.cwd(), 'List of Office IDs.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');

    Papa.parse<CsvRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      complete: (results) => {
        const offices = results.data.map((row) => ({
          id: Number(row.id),
          name: row.name,
          type: row.type as 'MC' | 'LC',
          parent_id: row.parent_id ? Number(row.parent_id) : null,
        }));
        resolve(offices.filter(o => o.id && o.name)); // Filter out any empty rows
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

// This is a Server Component
export default async function E2EAnalyticsPage() {
  const offices = await getOffices();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-gray-50/50 dark:bg-zinc-900/50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">E2E Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Sélectionnez les filtres pour lancer une recherche.
        </p>
      </div>

      <E2EAnalyticsClient offices={offices} />
    </main>
  );
}
