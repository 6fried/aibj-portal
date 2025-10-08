'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { subDays, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { PeopleData, SubOffice } from '@/lib/types';
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from '@/components/ui/dialog';
import LeadsTable from '@/components/leads/LeadsTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeadsClientProps {
  offices: SubOffice[];
}

export function LeadsClient({ offices: initialOffices }: LeadsClientProps) {
  const [data, setData] = useState<PeopleData | null>(null);
  const [subOffices] = useState<SubOffice[]>(initialOffices);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedOffice, setSelectedOffice] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvCount, setCsvCount] = useState(1000);

  const fetchData = useCallback(async () => {
    if (!selectedOffice) return;
    setLoading(true);
    setError(null);

    const from = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const to = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    const params = new URLSearchParams({
      start_date: from,
      end_date: to,
      home_committee: selectedOffice,
      page: currentPage.toString(),
    });

    try {
      const response = await fetch(`/api/leads?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leads data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedOffice, currentPage]);

    useEffect(() => {
    if (initialOffices.length > 0 && !selectedOffice) {
      setSelectedOffice(String(initialOffices[0].id));
    }
  }, [initialOffices, selectedOffice]);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Only fetch data on page change if a search has already been performed
    if (data && startDate && endDate && selectedOffice) {
      fetchData();
    }
    // We intentionally depend only on currentPage to avoid re-fetching on data/fetchData identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    setStartDate(subDays(new Date(), 15));
    setEndDate(new Date());
  }, []);

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>Gestion des Leads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <DatePicker date={startDate} onDateChange={setStartDate} placeholder="Start Date" />
            <span>-</span>
            <DatePicker date={endDate} onDateChange={setEndDate} placeholder="End Date" />
          </div>
          <Select value={selectedOffice} onValueChange={setSelectedOffice}>
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
          <Button onClick={fetchData}>Rechercher</Button>
          <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
            <DialogTrigger asChild>
              <Button>Télécharger CSV</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>Télécharger les données</DialogHeader>
              <div className="flex flex-col gap-2">
                <label htmlFor="csv-count">Combien de résultats voulez-vous télécharger ?</label>
                <input
                  id="csv-count"
                  type="number"
                  min={1}
                  max={10000}
                  value={csvCount}
                  onChange={e => setCsvCount(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                />
                <Button
                  className="mt-2"
                  onClick={() => {
                    const params = new URLSearchParams({
                      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : '',
                      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : '',
                      home_committee: selectedOffice || '',
                      page: '1',
                      per_page: csvCount.toString(),
                    });
                    window.open(`/apps/leads/csv?${params.toString()}`, '_blank');
                    setCsvDialogOpen(false);
                  }}
                >
                  Télécharger
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {data && !loading && !error && data.data && data.data.people && (
          <div className="text-sm text-muted-foreground">
            <strong>{data.data.people.paging.total_items}</strong> leads found.
          </div>
        )}

        <div>
          {loading && <p>Chargement des données...</p>}
          {error && <p className="text-red-500">Erreur: {error}</p>}
          {data && !loading && !error && data.data && data.data.people && (
            <>
              <LeadsTable data={data.data.people.data} />
              <div className="flex justify-end items-center gap-4 mt-4">
                <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</Button>
                <span>Page {currentPage} of {data.data.people.paging.total_pages}</span>
                <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === data.data.people.paging.total_pages}>Next</Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
