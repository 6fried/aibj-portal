'use client'

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters';
import { useAuth } from '@/hooks/use-auth';
import { getTodayRange } from '@/lib/utils/date-helpers';
import { entityList } from '@/lib/data/entities';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgramReportTable } from '@/components/analytics/ProgramReportTable';
import { MonthlyData } from '@/lib/types';

export default function GraphQLTestPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<MonthlyData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(getTodayRange().from);
  const [endDate, setEndDate] = useState(getTodayRange().to);
  const [selectedEntity, setSelectedEntity] = useState<string>('');

  const isMcvp = user?.role === 'mcvp';

  useEffect(() => {
    if (user?.entityId) {
      if (isMcvp) {
        setSelectedEntity('2110'); // Default to MC
      } else {
        setSelectedEntity(user.entityId);
      }
    }
  }, [user, isMcvp]);

  const handleFetchData = useCallback(async () => {
    if (!startDate || !endDate || !selectedEntity) {
      setError('Veuillez sélectionner une période et une entité.');
      return;
    }

    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await fetch('/api/graphql-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityId: selectedEntity,
          from: format(startDate, 'yyyy-MM-dd'),
          to: format(endDate, 'yyyy-MM-dd'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const data = await response.json();
      setReportData(data);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedEntity]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{`Test de l'API GraphQL pour les Rapports`}</CardTitle>
          <CardDescription>
            Utilisez les filtres ci-dessous pour construire et exécuter une requête GraphQL qui réplique les données de la page de rapports.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AnalyticsFilters 
            dateRange={{ from: startDate, to: endDate }}
            selectedEntity={selectedEntity}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onEntityChange={setSelectedEntity}
            onApplyFilters={handleFetchData}
            entityList={entityList}
            isMcvp={isMcvp}
          />
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center items-center mt-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-lg">Chargement des données...</p>
        </div>
      )}

      {error && (
        <Card className="mt-8 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {reportData && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Résultats de la requête GraphQL</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ogx" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ogx">Outgoing Exchange (OGX)</TabsTrigger>
                <TabsTrigger value="icx">Incoming Exchange (ICX)</TabsTrigger>
              </TabsList>
              <TabsContent value="ogx">
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle>oGV Performance</CardTitle></CardHeader>
                    <CardContent><ProgramReportTable data={reportData} program="gv" type="ogx" /></CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>oGTa Performance</CardTitle></CardHeader>
                    <CardContent><ProgramReportTable data={reportData} program="gta" type="ogx" /></CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>oGTe Performance</CardTitle></CardHeader>
                    <CardContent><ProgramReportTable data={reportData} program="gte" type="ogx" /></CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="icx">
                 <div className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle>iGV Performance</CardTitle></CardHeader>
                      <CardContent><ProgramReportTable data={reportData} program="gv" type="icx" /></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>iGTa Performance</CardTitle></CardHeader>
                      <CardContent><ProgramReportTable data={reportData} program="gta" type="icx" /></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>iGTe Performance</CardTitle></CardHeader>
                      <CardContent><ProgramReportTable data={reportData} program="gte" type="icx" /></CardContent>
                    </Card>
                  </div>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
