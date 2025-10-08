'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { subDays, format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { MemberLeadsData, SubOffice } from '@/lib/types';
import RecruitmentTable from '@/components/recruitment/RecruitmentTable';

export default function RecruitmentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<MemberLeadsData | null>(null);
  const [subOffices, setSubOffices] = useState<SubOffice[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>Gestion des Recrutements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-col md:flex-row md:flex-wrap items-center gap-4"
          onSubmit={e => { e.preventDefault(); setCurrentPage(1); fetchData(); }}
        >
                    <div className="flex items-center gap-2">
            <DatePicker date={startDate} onDateChange={setStartDate} placeholder="Start Date" />
            <span>-</span>
            <DatePicker date={endDate} onDateChange={setEndDate} placeholder="End Date" />
          </div>
          <Input
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); } }
            className="max-w-sm"
          />
          <Select value={selectedOffice} onValueChange={v => setSelectedOffice(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Comité local" />
            </SelectTrigger>
            <SelectContent>
                            {subOffices.map((office) => (
                <SelectItem key={office.id} value={String(office.id)}>
                  {office.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Appliquer les filtres</Button>
        </form>

        {data && !loading && !error && data.data && data.data.memberLeads && (
          <div className="text-sm text-muted-foreground">
            <strong>{data.data.memberLeads.paging.total_items}</strong> leads found.
          </div>
        )}


        <div>
          {loading && <p>Chargement des données...</p>}
          {error && <p className="text-red-500">Erreur: {error}</p>}
          {data && !loading && !error && data.data && data.data.memberLeads && (
            <>
              <RecruitmentTable data={data.data.memberLeads.data} />
              <div className="flex justify-end items-center gap-4 mt-4">
                <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</Button>
                <span>Page {currentPage} of {data.data.memberLeads.paging.total_pages}</span>
                <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === data.data.memberLeads.paging.total_pages}>Next</Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
