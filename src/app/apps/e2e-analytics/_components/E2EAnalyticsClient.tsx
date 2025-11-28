'use client';

import * as React from 'react';
import { E2EAnalyticsFilters } from '@/components/analytics/E2EAnalyticsFilters';
import { E2EAnalyticsFilters as E2EFiltersType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, GitCompareArrows, ArrowRight, Users, FileText } from 'lucide-react';
import { useAppHeader } from '@/components/layout/AppHeaderContext';

interface Committee {
  id: number;
  name: string;
  tag: string;
}

export function E2EAnalyticsClient() {
  const { setHeader, clearHeader } = useAppHeader();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ applications: number; applicants: number } | null>(null);
  const [sendingCommittee, setSendingCommittee] = React.useState<Committee | null>(null);
  const [hostingCommittee, setHostingCommittee] = React.useState<Committee | null>(null);

  const handleSearch = async (newFilters: E2EFiltersType, sending: Committee, hosting: Committee) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setSendingCommittee(sending);
    setHostingCommittee(hosting);

    try {
      const response = await fetch('/api/e2e-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newFilters,
          sendingEntityType: sending.tag,
          hostingEntityType: hosting.tag,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const data = await response.json();
      setResult(data);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Set global header (mount-only)
  React.useEffect(() => {
    setHeader({
      title: 'E2E Analytics',
      subtitle: 'End-to-end exchange flow analysis',
    });
    return () => clearHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters Card */}
          <Card>
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
              <CardDescription>Select sending and hosting entities to analyze exchange flows</CardDescription>
            </CardHeader>
            <CardContent>
              <E2EAnalyticsFilters onFiltersChange={handleSearch} />
            </CardContent>
          </Card>

          {/* Error State */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-xl">⚠</span>
                  </div>
                  <div>
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analyzing exchange data...</p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!result && !loading && !error && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <GitCompareArrows className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to analyze</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {`Select your filters above and click "Search" to view exchange flow analytics`}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result !== null && !loading && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Summary Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Total Applications
                  </CardTitle>
                  <CardDescription>Number of applications submitted</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">{result.applications}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Unique Applicants
                  </CardTitle>
                  <CardDescription>Number of unique individuals</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">{result.applicants}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Exchange Flow Details */}
          {result !== null && !loading && sendingCommittee && hostingCommittee && (
            <Card>
              <CardHeader>
                <CardTitle>Exchange Flow Details</CardTitle>
                <CardDescription>Analysis for the selected entities and period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4 py-6">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <p className="font-semibold text-foreground">{sendingCommittee.name}</p>
                    <p className="text-xs text-muted-foreground">{sendingCommittee.tag}</p>
                  </div>
                  
                  <ArrowRight className="h-8 w-8 text-primary" />
                  
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <p className="font-semibold text-foreground">{hostingCommittee.name}</p>
                    <p className="text-xs text-muted-foreground">{hostingCommittee.tag}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Applications</p>
                      <p className="text-2xl font-bold text-primary">{result.applications}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Applicants</p>
                      <p className="text-2xl font-bold text-primary">{result.applicants}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
