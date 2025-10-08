'use client';

import * as React from 'react';
import { E2EAnalyticsFilters } from '@/components/analytics/E2EAnalyticsFilters';
import { E2EAnalyticsFilters as E2EFiltersType } from '@/lib/types';
import { Office } from '@/lib/office-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface E2EAnalyticsClientProps {
  offices: Office[];
}

export function E2EAnalyticsClient({ offices }: E2EAnalyticsClientProps) {
  const [filters, setFilters] = React.useState<E2EFiltersType | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ applications: number; applicants: number } | null>(null);

  const handleSearch = async (newFilters: E2EFiltersType) => {
    setLoading(true);
    setFilters(newFilters);
    setResult(null);
    console.log('Lancement de la recherche avec les filtres :', newFilters);

    const sendingOffice = offices.find(o => o.id === newFilters.sendingEntity);
    const hostingOffice = offices.find(o => o.id === newFilters.hostingEntity);

    try {
      const response = await fetch('/api/e2e-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newFilters,
          sendingEntityType: sendingOffice?.type,
          hostingEntityType: hostingOffice?.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const data = await response.json();
      setResult(data);

    } catch (err: unknown) {
      // You can add more specific error handling here if needed
      console.error(err);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="flex flex-col gap-6">
      <E2EAnalyticsFilters offices={offices} onFiltersChange={handleSearch} />

      {loading && (
        <div className="flex items-center justify-center p-8">
          <p>Loading...</p>
        </div>
      )}

      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
            <CardDescription>
              Showing results for the selected filters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                <thead className="bg-gray-50 dark:bg-zinc-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Entity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Applications</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Applicants</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-zinc-900 dark:divide-zinc-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {filters?.sendingEntity && offices.find(o => o.id === filters.sendingEntity)?.name} to {filters?.hostingEntity && offices.find(o => o.id === filters.hostingEntity)?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{result.applications}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{result.applicants}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
