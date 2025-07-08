'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth';
import { getMandatePeriods } from '@/lib/dates';

import { StatusProgressionTable } from '@/components/reports/status-progression-table'
import { RefreshCw, FileText, LayoutDashboard, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface StatusProgressionData {
  month: string
  apl: number
  acc: number
  apd: number
  re: number
  fin: number
  co: number
}

interface Semester {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
}

interface Mandate {
  id: string;
  label: string;
  semesters: Semester[];
}

const entityList = [
  { id: "2422", name: "." },
  { id: "175", name: "Abomey-Calavi" },
  { id: "6701", name: "AIESEC in Benin " },
  { id: "3445", name: "Cotonou" },
  { id: "458", name: "ENEAM" },
  { id: "2110", name: "MC Benin" },
  { id: "2482", name: "MC Benin 2" },
  { id: "2039", name: "Porto-Novo" },
  { id: "2055", name: "UATM Gasa Formation" },
]

export default function ReportsPage() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState<Record<string, StatusProgressionData[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMandate, setSelectedMandate] = useState<string>('')
  const [selectedEntity, setSelectedEntity] = useState<string>('')
  const [currentMandate, setCurrentMandate] = useState<Mandate | null>(null)

  const isMcvp = user?.role === 'mcvp'

  useEffect(() => {
    if (user?.entityId) {
      if (isMcvp) {
        setSelectedEntity('2110') // Default to MC
      } else {
        setSelectedEntity(user.entityId)
      }
    }
  }, [user, isMcvp])

  const currentYear = new Date().getFullYear();
  const availableMandates: Mandate[] = [];
  for (let year = 2019; year <= currentYear; year++) {
    availableMandates.push(getMandatePeriods(year));
  }

  const generateReport = async () => {
    if (!selectedMandate || !selectedEntity) {
      setError('Veuillez sélectionner un mandat et une entité.')
      return
    }

    setLoading(true)
    setError(null)
    setReportData({})

    const mandate = availableMandates.find(m => m.id === selectedMandate)
    if (!mandate) {
      setError('Mandat sélectionné non valide.')
      setLoading(false)
      return
    }
    setCurrentMandate(mandate)

    try {
      const fetchSemesterData = async (semester: Semester) => {
        const response = await fetch('/api/reports/progression', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityId: selectedEntity,
            startDate: semester.startDate,
            endDate: semester.endDate,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || `Failed to fetch data for ${semester.label}`);
        }
        return response.json();
      };

      const [s1Data, s2Data] = await Promise.all([
        fetchSemesterData(mandate.semesters[0]),
        fetchSemesterData(mandate.semesters[1]),
      ]);
      setReportData({
        s1Ogx: s1Data.ogx,
        s1Icx: s1Data.icx,
        s2Ogx: s2Data.ogx,
        s2Icx: s2Data.icx,
      })
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || 'Une erreur est survenue lors de la génération du rapport.')
      } else {
        setError('Une erreur est survenue lors de la génération du rapport.')
      }
    } finally {
      setLoading(false)
    }
  }

  const hasData = Object.values(reportData).some(d => d.length > 0)

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      <div className="flex flex-1 flex-col space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Rapports de Performance</h1>
          <Link href="/dashboard" passHref>
            <Button variant="outline">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration du Rapport</CardTitle>
            <CardDescription>Sélectionnez un mandat pour analyser la progression des statuts.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex flex-1 flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Mandat LC</label>
                <Select value={selectedMandate} onValueChange={setSelectedMandate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un mandat" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMandates.map(mandate => (
                      <SelectItem key={mandate.id} value={mandate.id}>{mandate.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isMcvp && (
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Entité</label>
                  <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une entité" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityList.map(entity => (
                        <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button onClick={generateReport} disabled={loading || !selectedMandate || !selectedEntity} className="w-full self-end md:w-auto">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} 
              <span className="ml-2">{loading ? 'Génération...' : 'Générer le Rapport'}</span>
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border bg-white p-6 shadow-sm">
          {loading ? (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          ) : error ? (
             <Alert variant="destructive" className="max-w-lg">
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          ) : hasData && currentMandate ? (
            <Tabs defaultValue="s1" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="s1">{currentMandate.semesters[0].label}</TabsTrigger>
                <TabsTrigger value="s2">{currentMandate.semesters[1].label}</TabsTrigger>
              </TabsList>
              <TabsContent value="s1" className="mt-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <ReportCard title="Outgoing Exchange (OGX)" data={reportData.s1Ogx} />
                  <ReportCard title="Incoming Exchange (ICX)" data={reportData.s1Icx} />
                </div>
              </TabsContent>
              <TabsContent value="s2" className="mt-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <ReportCard title="Outgoing Exchange (OGX)" data={reportData.s2Ogx} />
                  <ReportCard title="Incoming Exchange (ICX)" data={reportData.s2Icx} />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Prêt à analyser</h3>
              <p className="mt-1 text-sm text-gray-500">Sélectionnez un mandat et générez un rapport.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function ReportCard({ title, data }: { title: string, data: StatusProgressionData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <StatusProgressionTable data={data} />
      </CardContent>
    </Card>
  )
}