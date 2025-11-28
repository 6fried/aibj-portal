'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { subDays, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { PeopleData, SubOffice } from '@/lib/types';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LeadsTable from '@/components/leads/LeadsTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, Download, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import type { Person } from '@/lib/types';
import type { Recipient } from '@/modules/email/types';
import { useAppHeader } from '@/components/layout/AppHeaderContext';

interface LeadsClientProps {
  offices: SubOffice[];
}

export function LeadsClient({ offices: initialOffices }: LeadsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setHeader, clearHeader } = useAppHeader();
  const [data, setData] = useState<PeopleData | null>(null);
  const [subOffices] = useState<SubOffice[]>(initialOffices);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const v = searchParams.get('start_date');
    return v ? new Date(v) : undefined;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const v = searchParams.get('end_date');
    return v ? new Date(v) : undefined;
  });
  const [selectedOffice, setSelectedOffice] = useState<string | undefined>(() => searchParams.get('home_committee') || undefined);
  const [currentPage, setCurrentPage] = useState<number>(() => Number(searchParams.get('page')) || 1);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvCount, setCsvCount] = useState(1000);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'id',
    'name',
    'email',
    'phone',
    'dob',
    'created_at',
    'contacted_by',
    'first_contacted',
    'home_lc',
  ]);
  const [selectedLeads, setSelectedLeads] = useState<Person[]>([]);

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
    if (!startDate) setStartDate(subDays(new Date(), 15));
    if (!endDate) setEndDate(new Date());
  }, [startDate, endDate]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', format(startDate, 'yyyy-MM-dd'));
    if (endDate) params.set('end_date', format(endDate, 'yyyy-MM-dd'));
    if (selectedOffice) params.set('home_committee', selectedOffice);
    if (currentPage > 1) params.set('page', String(currentPage));
    const url = `/apps/leads?${params.toString()}`;
    router.replace(url, { scroll: false });
  }, [startDate, endDate, selectedOffice, currentPage, router]);

  // Set global header
  useEffect(() => {
    setHeader({
      title: 'Gestion des Leads',
      subtitle: 'Filtrer, exporter et gérer les leads',
    });
    return () => clearHeader();
    // Intentionally no deps to avoid re-runs when context functions change identity
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
              <CardTitle>Filtres de recherche</CardTitle>
              <CardDescription>Sélectionnez une période et un comité local puis lancez la recherche</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <DatePicker date={startDate} onDateChange={setStartDate} placeholder="Start Date" />
                  <span className="text-muted-foreground">-</span>
                  <DatePicker date={endDate} onDateChange={setEndDate} placeholder="End Date" />
                </div>
                
                <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                  <SelectTrigger className="w-[220px]">
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

                <Button onClick={() => { setCurrentPage(1); fetchData(); }} className="gap-2">Rechercher</Button>

                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={selectedLeads.length === 0}
                  onClick={() => {
                    const recipients: Recipient[] = selectedLeads.map((lead) => {
                      const [firstName, ...rest] = (lead.full_name || '').split(' ');
                      return {
                        email: lead.email,
                        firstName: firstName || undefined,
                        lastName: rest.join(' ') || undefined,
                        committee: lead.home_lc?.name || undefined,
                      };
                    });
                    try {
                      localStorage.setItem('compose_recipients', JSON.stringify(recipients));
                    } catch {}
                    window.location.href = '/apps/email/templates';
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Compose Email ({selectedLeads.length})
                </Button>

                <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Télécharger CSV
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Télécharger les données</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
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
                      </div>

                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium">Colonnes à inclure</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { key: 'id', label: 'ID' },
                            { key: 'name', label: 'Nom' },
                            { key: 'email', label: 'Email' },
                            { key: 'phone', label: 'Téléphone' },
                            { key: 'dob', label: 'Date de naissance' },
                            { key: 'created_at', label: `Date d'inscription` },
                            { key: 'contacted_by', label: 'Contacté par' },
                            { key: 'first_contacted', label: 'Première prise de contact' },
                            { key: 'home_lc', label: 'LC d\'origine' },
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedColumns.includes(key)}
                                onChange={(e) => {
                                  setSelectedColumns((prev) => {
                                    if (e.target.checked) {
                                      return [...prev, key];
                                    }
                                    if (prev.length === 1) {
                                      return prev; // always keep at least one column
                                    }
                                    return prev.filter((c) => c !== key);
                                  });
                                }}
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

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

                          if (selectedColumns.length > 0) {
                            params.set('columns', selectedColumns.join(','));
                          }

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
            </CardContent>
          </Card>

          {/* Compose flow moved to dedicated page /apps/email/compose */}

          {/* Error State */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-xl">⚠</span>
                  </div>
                  <div>
                    <p className="font-semibold">Erreur</p>
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
                <p className="text-muted-foreground">{`Préparation de l'affichage...`}</p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && (!data || !data.data || !data.data.people) && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{`Aucun résultat pour l'instant`}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {`Sélectionnez vos filtres et cliquez sur "Rechercher" pour voir les leads`}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {data && !loading && !error && data.data && data.data.people && (
            <>
              {/* Stats Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre total de leads</p>
                      <p className="text-2xl font-bold text-foreground">
                        {data.data.people.paging.total_items}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Table Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Leads</CardTitle>
                  <CardDescription>
                    Page {currentPage} sur {data.data.people.paging.total_pages}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeadsTable
                    data={data.data.people.data}
                    onSelectionChange={setSelectedLeads}
                  />
                  
                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} sur {data.data.people.paging.total_pages}
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
                        Précédent
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => p + 1)} 
                        disabled={currentPage === data.data.people.paging.total_pages}
                        className="gap-2"
                      >
                        Suivant
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
