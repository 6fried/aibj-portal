'use client'

import { useState, useEffect } from 'react'
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

interface SemesterPeriod {
  id: string
  label: string
  startDate: string
  endDate: string
}

export default function ReportsPage() {
  const { user, getAccessToken } = useAuth()
  const [ogxData, setOgxData] = useState<StatusProgressionData[]>([])
  const [icxData, setIcxData] = useState<StatusProgressionData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<string>('')

  // Générer les semestres disponibles
  const currentYear = new Date().getFullYear()
  const availableSemesters: SemesterPeriod[] = []
  
  for (let year = currentYear - 2; year <= currentYear + 1; year++) {
    availableSemesters.push(
      ...AiesecAnalyticsService.getSemesterPeriods(year)
    )
  }

  const generateReport = async () => {
    if (!selectedSemester || !user?.entityId) {
      alert('Veuillez sélectionner un semestre')
      return
    }

    setLoading(true)
    setOgxData([])
    setIcxData([])
    
    try {
      const token = await getAccessToken()
      const service = new AiesecAnalyticsService(token)
      
      const semester = availableSemesters.find(s => s.id === selectedSemester)
      if (!semester) throw new Error('Semestre non trouvé')
      
      const { ogx, icx } = await service.getStatusProgressionData(
        semester.startDate,
        semester.endDate,
        parseInt(user.entityId)
      )
      
      setOgxData(ogx)
      setIcxData(icx)
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
          Reports & Analytics
        </h1>
        <p className="text-aiesec-dark/70">
          Rapports détaillés et analyses de progression
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
          <CardTitle>Progression des statuts par mois</CardTitle>
          <CardDescription>
            Générer un tableau de progression APL/ACC/APD/RE/FIN/CO par mois pour un semestre donné
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-aiesec-dark mb-2 block">
                Semestre
              </label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un semestre" />
                </SelectTrigger>
                <SelectContent>
                  {availableSemesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateReport} 
                disabled={loading || !selectedSemester}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {ogxData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>OGX Progression</CardTitle>
              <CardDescription>Progression des statuts pour les programmes sortants (Outgoing Exchange)</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusProgressionTable data={ogxData} />
            </CardContent>
          </Card>
        )}
        {icxData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>ICX Progression</CardTitle>
              <CardDescription>Progression des statuts pour les programmes entrants (Incoming Exchange)</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusProgressionTable data={icxData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}