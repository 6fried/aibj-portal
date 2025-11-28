'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { ProgramReportTable } from '@/components/analytics/ProgramReportTable';
import { MonthlyData } from '@/lib/types';
import { MonthSelector } from '@/components/analytics/MonthSelector';
import { FileText, Home, Loader2, Globe, Briefcase, GraduationCap, BarChart3 } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Performance Reports</h1>
              <p className="text-sm text-muted-foreground">Monthly analytics and insights</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters Card */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>Select the months you want to analyze and generate your performance report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <MonthSelector selectedMonths={selectedMonths} onApply={handleApplyMonths} />
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={loading || selectedMonths.length === 0}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
              {selectedMonths.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedMonths.length} month{selectedMonths.length > 1 ? 's' : ''} selected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!reportData && !loading && !error && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to generate your report</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {`Select the months you want to analyze and click "Generate Report" to view your performance metrics`}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating your report...</p>
              </CardContent>
            </Card>
          )}

          {/* Report Data */}
          {reportData && (
            <Tabs defaultValue="ogx" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="ogx">Outgoing (OGX)</TabsTrigger>
                <TabsTrigger value="icx">Incoming (ICX)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ogx" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gv">
                      <Globe className="h-5 w-5" />
                      Global Volunteer (oGV)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgramReportTable data={reportData} program="gv" type="ogx" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gta">
                      <Briefcase className="h-5 w-5" />
                      Global Talent (oGTa)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgramReportTable data={reportData} program="gta" type="ogx" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gte">
                      <GraduationCap className="h-5 w-5" />
                      Global Teacher (oGTe)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgramReportTable data={reportData} program="gte" type="ogx" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="icx" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gv">
                      <Globe className="h-5 w-5" />
                      Global Volunteer (iGV)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgramReportTable data={reportData} program="gv" type="icx" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gta">
                      <Briefcase className="h-5 w-5" />
                      Global Talent (iGTa)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgramReportTable data={reportData} program="gta" type="icx" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gte">
                      <GraduationCap className="h-5 w-5" />
                      Global Teacher (iGTe)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgramReportTable data={reportData} program="gte" type="icx" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}