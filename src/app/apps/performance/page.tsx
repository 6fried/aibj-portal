// src/app/dashboard/performance/page.tsx
"use client"

import { useState, useEffect, useCallback } from 'react'
import { PerformanceList } from '@/components/performance/PerformanceList'
import { PerformanceFilters } from '@/components/performance/PerformanceFilters'
import { ProcessedPerformanceData } from '@/lib/analytics/aiesec-analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Cache simple en mémoire
const dataCache = new Map<string, ProcessedPerformanceData>()

export default function PerformancePage() {
  const [data, setData] = useState<ProcessedPerformanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedEntity, setSelectedEntity] = useState('aiesec_benin')

  const getCacheKey = (entity: string, year: number) => `${entity}-${year}`

  const fetchData = useCallback(async () => {
    const cacheKey = getCacheKey(selectedEntity, selectedYear)
    
    // Vérifier le cache en premier
    if (dataCache.has(cacheKey)) {
      console.log('Données trouvées dans le cache')
      setData(dataCache.get(cacheKey)!)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log(`Fetching data for ${selectedEntity}, year ${selectedYear}`)
      const response = await fetch(
        `/api/performance?entityId=${selectedEntity}&year=${selectedYear}`
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Erreur lors du chargement des données')
      }
      
      const result = await response.json()
      
      // Mettre en cache les données
      dataCache.set(cacheKey, result)
      setData(result)
    } catch (err) {
      console.error('Error fetching performance data:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [selectedEntity, selectedYear])

  const handleRefresh = () => {
    // Vider le cache pour cette combinaison entity/year
    const cacheKey = getCacheKey(selectedEntity, selectedYear)
    dataCache.delete(cacheKey)
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#037EF3]" />
        <span className="ml-2 text-lg">Chargement des données...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button 
                onClick={fetchData}
                className="bg-[#037EF3] text-white hover:bg-blue-600"
              >
                Réessayer
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Recharger la page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#037EF3] mb-2">
            Performance Analytics
          </h1>
          <p className="text-gray-600">
            Suivi des performances d'échanges entrants et sortants
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      <PerformanceFilters
        selectedYear={selectedYear}
        selectedEntity={selectedEntity}
        onYearChange={setSelectedYear}
        onEntityChange={setSelectedEntity}
      />

      {data && (
      <Tabs defaultValue="ogx" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ogx" className="data-[state=active]:bg-[#037EF3] data-[state=active]:text-white">
              📤 Outgoing Exchange (OGX)
          </TabsTrigger>
          <TabsTrigger value="icx" className="data-[state=active]:bg-[#037EF3] data-[state=active]:text-white">
              📥 Incoming Exchange (ICX)
          </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ogx" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceList data={data} department="ogx" programme="total" />
              <div className="space-y-6">
              <PerformanceList data={data} department="ogx" programme="gv" />
              <PerformanceList data={data} department="ogx" programme="gta" />
              <PerformanceList data={data} department="ogx" programme="gte" />
              </div>
          </div>
          </TabsContent>
          
          <TabsContent value="icx" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceList data={data} department="icx" programme="total" />
              <div className="space-y-6">
              <PerformanceList data={data} department="icx" programme="gv" />
              <PerformanceList data={data} department="icx" programme="gta" />
              <PerformanceList data={data} department="icx" programme="gte" />
              </div>
          </div>
          </TabsContent>
      </Tabs>
      )}
    </div>
  )
}