'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { ProgramReportTable } from '@/components/analytics/ProgramReportTable';
import { MonthlyData } from '@/lib/types';
import { MonthSelector } from '@/components/analytics/MonthSelector';
import { FileText, LayoutDashboard, Loader2, Globe, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<MonthlyData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  const handleGenerateReport = async () => {
    if (!selectedMonths.length) {
      setError('Veuillez sélectionner au moins un mois.');
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
          officeId: user?.entityId,
          selectedMonths: selectedMonths
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Une erreur est survenue lors de la génération du rapport.');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMonths = (months: string[]) => {
    setSelectedMonths(months);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Rapports Mensuels</h2>
        <Link href="/dashboard" passHref>
          <Button variant="outline">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>

      <div className='p-4 border rounded-lg my-4 bg-card flex items-center gap-4 flex-wrap'>
        <MonthSelector selectedMonths={selectedMonths} onApply={handleApplyMonths} />
        <Button onClick={handleGenerateReport} disabled={loading || selectedMonths.length === 0}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />} 
          Générer le rapport
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!reportData && !loading && !error && (
        <Alert>
          <LayoutDashboard className="h-4 w-4" />
          <AlertTitle>Prêt à générer votre rapport</AlertTitle>
          <AlertDescription>
            { `Veuillez sélectionner les mois que vous souhaitez analyser et cliquez sur "Générer le rapport" pour commencer.`}
          </AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className='ml-4 text-muted-foreground'>Génération du rapport en cours...</p>
        </div>
      )}

      {reportData && (
        <Tabs defaultValue="ogx" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ogx">Outgoing Exchange (OGX)</TabsTrigger>
            <TabsTrigger value="icx">Incoming Exchange (ICX)</TabsTrigger>
          </TabsList>
          <TabsContent value="ogx">
            <div className="space-y-6 pt-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center text-blue-600"><Globe className="mr-2 h-5 w-5" /> oGV Performance</h3>
                <ProgramReportTable data={reportData} program="gv" type="ogx" />
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center text-orange-600"><Briefcase className="mr-2 h-5 w-5" /> oGTa Performance</h3>
                <ProgramReportTable data={reportData} program="gta" type="ogx" />
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center text-teal-600"><GraduationCap className="mr-2 h-5 w-5" /> oGTe Performance</h3>
                <ProgramReportTable data={reportData} program="gte" type="ogx" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="icx">
            <div className="space-y-6 pt-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center text-blue-600"><Globe className="mr-2 h-5 w-5" /> iGV Performance</h3>
                <ProgramReportTable data={reportData} program="gv" type="icx" />
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center text-orange-600"><Briefcase className="mr-2 h-5 w-5" /> iGTa Performance</h3>
                <ProgramReportTable data={reportData} program="gta" type="icx" />
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center text-teal-600"><GraduationCap className="mr-2 h-5 w-5" /> iGTe Performance</h3>
                <ProgramReportTable data={reportData} program="gte" type="icx" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}