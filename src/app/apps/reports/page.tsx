'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { AiesecAnalyticsService } from '@/lib/analytics/aiesec-analytics'
import { StatusProgressionTable } from '@/components/reports/status-progression-table'
import { RefreshCw, FileText } from 'lucide-react'

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

export default function ReportsPage() {
  const { user } = useAuth()
  const [s1OgxData, setS1OgxData] = useState<StatusProgressionData[]>([])
  const [s1IcxData, setS1IcxData] = useState<StatusProgressionData[]>([])
  const [s2OgxData, setS2OgxData] = useState<StatusProgressionData[]>([])
  const [s2IcxData, setS2IcxData] = useState<StatusProgressionData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMandate, setSelectedMandate] = useState<string>('')
  const [currentMandate, setCurrentMandate] = useState<Mandate | null>(null)

  const currentYear = new Date().getFullYear()
  const availableMandates: Mandate[] = []
  for (let year = 2019; year <= currentYear; year++) {
    availableMandates.push(AiesecAnalyticsService.getMandatePeriods(year))
  }

  const generateReport = async () => {
    if (!selectedMandate || !user?.entityId) {
      alert('Veuillez sélectionner un mandat')
      return
    }

    setLoading(true)
    setS1OgxData([]); setS1IcxData([]); setS2OgxData([]); setS2IcxData([]);

    const mandate = availableMandates.find(m => m.id === selectedMandate)
    if (!mandate) return
    setCurrentMandate(mandate)

    try {
      const analyticsService = new AiesecAnalyticsService()

      const [s1Data, s2Data] = await Promise.all([
        analyticsService.getStatusProgressionData(mandate.semesters[0].startDate, mandate.semesters[0].endDate, parseInt(user.entityId)),
        analyticsService.getStatusProgressionData(mandate.semesters[1].startDate, mandate.semesters[1].endDate, parseInt(user.entityId))
      ])
      
      setS1OgxData(s1Data.ogx)
      setS1IcxData(s1Data.icx)
      setS2OgxData(s2Data.ogx)
      setS2IcxData(s2Data.icx)

    } catch (error) {
      console.error('Error generating report:', error)
      alert('Erreur lors de la génération du rapport')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-aiesec-dark mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8 text-aiesec-blue" />
          Rapports de Performance par Mandat
        </h1>
        <p className="text-aiesec-dark/70">
          Analyses de progression pour un mandat LC complet (Février - Janvier)
        </p>
        {user && (
          <p className="text-sm text-aiesec-dark/60 mt-1">
            Office : {user.entityName}
          </p>
        )}
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Sélection du Mandat</CardTitle>
          <CardDescription>
            {"Générez les rapports de performance OGX et ICX pour les deux semestres d'un mandat."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-aiesec-dark mb-2 block">
                Mandat LC
              </label>
              <Select value={selectedMandate} onValueChange={setSelectedMandate}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un mandat" />
                </SelectTrigger>
                <SelectContent>
                  {availableMandates.map((mandate) => (
                    <SelectItem key={mandate.id} value={mandate.id}>
                      {mandate.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateReport} 
                disabled={loading || !selectedMandate}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  'Générer le rapport'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableaux des résultats */}
      {currentMandate && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Semestre 1 */}
          {s1OgxData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>OGX - {currentMandate.semesters[0].label}</CardTitle>
                <CardDescription>Programmes sortants (Outgoing Exchange)</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusProgressionTable data={s1OgxData} />
              </CardContent>
            </Card>
          )}
          {s1IcxData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>ICX - {currentMandate.semesters[0].label}</CardTitle>
                <CardDescription>Programmes entrants (Incoming Exchange)</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusProgressionTable data={s1IcxData} />
              </CardContent>
            </Card>
          )}

          {/* Semestre 2 */}
          {s2OgxData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>OGX - {currentMandate.semesters[1].label}</CardTitle>
                <CardDescription>Programmes sortants (Outgoing Exchange)</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusProgressionTable data={s2OgxData} />
              </CardContent>
            </Card>
          )}
          {s2IcxData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>ICX - {currentMandate.semesters[1].label}</CardTitle>
                <CardDescription>Programmes entrants (Incoming Exchange)</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusProgressionTable data={s2IcxData} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}