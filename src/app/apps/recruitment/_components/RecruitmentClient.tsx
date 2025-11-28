'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { subDays, format } from 'date-fns';
// import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { MemberLeadsData, SubOffice } from '@/lib/types';
import RecruitmentTable from '@/components/recruitment/RecruitmentTable';
import { Loader2, Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppHeader } from '@/components/layout/AppHeaderContext';

export default function RecruitmentClient() {
  const { setHeader, clearHeader } = useAppHeader();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<MemberLeadsData | null>(null);
  const [subOffices, setSubOffices] = useState<SubOffice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const v = searchParams.get('from');
    return v ? new Date(v) : undefined;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const v = searchParams.get('to');
    return v ? new Date(v) : undefined;
  });
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [selectedOffice, setSelectedOffice] = useState<string | undefined>(() => searchParams.get('home_committee') || undefined);
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get('page')) || 1);

  const fetchData = useCallback(async () => {
    if (!selectedOffice) return;
    setLoading(true);
    setError(null);

        const from = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const to = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    const params = new URLSearchParams({
      from,
      to,
      q: searchTerm,
      home_committee: selectedOffice,
      page: currentPage.toString(),
    });

    try {
      const response = await fetch(`/api/recruitment?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recruitment data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, searchTerm, selectedOffice, currentPage]);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await fetch('/api/recruitment?type=suboffices&committeeId=459'); // AIESEC in Cote d'Ivoire
        if (!response.ok) {
          throw new Error('Failed to fetch sub-offices');
        }
        const result = await response.json();
        const offices = result.data.committee.suboffices;
        setSubOffices(offices);
        if (offices.length > 0 && !selectedOffice) {
          setSelectedOffice(String(offices[0].id));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchOffices();
  }, [selectedOffice]);

    useEffect(() => {
    if (!startDate) setStartDate(subDays(new Date(), 15));
    if (!endDate) setEndDate(new Date());
  }, [endDate, startDate]);

  // Only fetch on page change, not on filter change
  useEffect(() => {
    if (startDate && endDate && currentPage !== 1) {
      fetchData();
    }
  }, [fetchData, startDate, endDate, currentPage]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set('from', format(startDate, 'yyyy-MM-dd'));
    if (endDate) params.set('to', format(endDate, 'yyyy-MM-dd'));
    if (searchTerm) params.set('q', searchTerm);
    if (selectedOffice) params.set('home_committee', selectedOffice);
    if (currentPage > 1) params.set('page', currentPage.toString());
    const url = `/apps/recruitment?${params.toString()}`;
    router.replace(url, { scroll: false });
  }, [startDate, endDate, searchTerm, selectedOffice, currentPage, router]);

  // Set global header (mount-only)
  useEffect(() => {
    setHeader({
      title: 'Recruitment Management',
      subtitle: 'Track and manage member leads',
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
              <CardDescription>Filter recruitment leads by date range, local committee, and search term</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={e => { e.preventDefault(); setCurrentPage(1); fetchData(); }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <DatePicker date={startDate} onDateChange={setStartDate} placeholder="Start Date" />
                    <span className="text-muted-foreground">-</span>
                    <DatePicker date={endDate} onDateChange={setEndDate} placeholder="End Date" />
                  </div>
                  
                  <Select value={selectedOffice} onValueChange={v => setSelectedOffice(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select local committee" />
                    </SelectTrigger>
                    <SelectContent>
                      {subOffices.map((office) => (
                        <SelectItem key={office.id} value={String(office.id)}>
                          {office.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Search by name, email..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="lg:col-span-1"
                  />
                  
                  <Button type="submit" className="gap-2">
                    <Search className="h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </form>
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
                <p className="text-muted-foreground">Preparing recruitment view...</p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && (!data || !data.data || !data.data.memberLeads) && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No data available</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {`Select your filters and click "Apply Filters" to view recruitment leads`}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {data && !loading && !error && data.data && data.data.memberLeads && (
            <>
              {/* Stats Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Leads Found</p>
                      <p className="text-2xl font-bold text-foreground">
                        {data.data.memberLeads.paging.total_items}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Table Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Recruitment Leads</CardTitle>
                  <CardDescription>
                    Page {currentPage} of {data.data.memberLeads.paging.total_pages}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecruitmentTable data={data.data.memberLeads.data} />
                  
                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Showing page {currentPage} of {data.data.memberLeads.paging.total_pages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentPage(p => p - 1)} 
                        disabled={currentPage === 1}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => p + 1)} 
                        disabled={currentPage === data.data.memberLeads.paging.total_pages}
                        className="gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </>
  );
}
