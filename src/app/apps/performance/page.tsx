"use client"

import { PerformanceFilters } from "@/components/performance/PerformanceFilters"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { PerformanceFunnelCard } from "@/components/performance/PerformanceFunnelCard";
import { DebugQueryCard } from '@/components/analytics/DebugQueryCard'
import { useEffect, useState, useCallback } from "react"
import { entityList } from '@/lib/data/entities'
import { PerformanceCardSkeleton } from "@/components/performance/PerformanceCardSkeleton"
import { Loader2, LayoutDashboard } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PerformancePage() {
  const { user } = useAuth()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedEntity, setSelectedEntity] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cache, setCache] = useState<Record<string, any>>({})

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

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!selectedEntity) {
      // Ne rien faire si aucune entité n'est sélectionnée
      // L'état de chargement initial s'en chargera
      return;
    }

    const fromDate = `${selectedYear}-01-01`;
    const toDate = `${selectedYear}-12-31`;
    const cacheKey = `${selectedEntity}-${selectedYear}`;

    if (cache[cacheKey] && !forceRefresh) {
      setData(cache[cacheKey]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/performance?entityId=${selectedEntity}&from=${fromDate}&to=${toDate}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `Erreur de chargement (${response.status})`);
      }
      const result = await response.json();
      setCache((prev) => ({ ...prev, [cacheKey]: result }));
      setData(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || "Une erreur inattendue est survenue.")
      } else {
        setError("Une erreur inattendue est survenue.")
      }
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [selectedEntity, selectedYear, cache, user?.role])

  useEffect(() => {
    if (selectedEntity) {
      fetchData()
    }
  }, [selectedEntity, selectedYear, fetchData])

  const ogxMetrics = {
    signup: 'Signup',
    applied: 'Applied',
    accepted: 'Accepted',
    approved: 'Approved',
    realized: 'Realized',
    finished: 'Finished',
    completed: 'Completed',
  };

  const icxMetrics = {
    open: 'Open',
    applied: 'Applied',
    accepted: 'Accepted',
    approved: 'Approved',
    realized: 'Realized',
    finished: 'Finished',
    completed: 'Completed',
  };

  const programCards = [
    { title: "Total", programKey: "total", color: "border-blue-500" },
    { title: "Global Volunteer", programKey: "gv", color: "border-red-500" },
    { title: "Global Talent", programKey: "gta", color: "border-cyan-500" },
    { title: "Global Teacher", programKey: "gte", color: "border-orange-500" },
  ] as const;

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <main className="flex flex-1 flex-col space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Performance</h2>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <Button variant="outline">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {user && user.role === "mcvp" && (
          <PerformanceFilters 
            selectedYear={selectedYear}
            selectedEntity={selectedEntity}
            onYearChange={(year) => {
              setData(null);
              setSelectedYear(year);
            }}
            onEntityChange={(entity) => {
              setData(null);
              setSelectedEntity(entity);
            }}
            entityList={entityList}
          />
        )}

        <div className="flex flex-1 flex-col">
          {loading ? (
            <PerformanceCardSkeleton />
          ) : error ? (
            <Alert variant="destructive" className="max-w-lg flex flex-col items-center text-center p-6">
              <AlertTitle className="mb-2">Erreur de chargement</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-4">
                <Button onClick={() => fetchData(true)}>Réessayer</Button>
              </div>
            </Alert>
          ) : data ? (
            <Tabs defaultValue="ogx" className="w-full max-w-6xl">
              <TabsList className="grid w-full grid-cols-2 bg-gray-200/80 rounded-lg">
                <TabsTrigger value="ogx">OGX</TabsTrigger>
                <TabsTrigger value="icx">ICX</TabsTrigger>
              </TabsList>
              
              {data && data.ogx && data.icx && (
                <>
                  <TabsContent value="ogx" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {programCards.map(card => (
                        <PerformanceFunnelCard 
                          key={card.programKey}
                          title={card.title} 
                          data={data.ogx.data} 
                          metrics={ogxMetrics} 
                          programKey={card.programKey}
                          color={card.color}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="icx" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {programCards.map(card => (
                        <PerformanceFunnelCard 
                          key={card.programKey}
                          title={card.title} 
                          data={data.icx.data} 
                          metrics={icxMetrics} 
                          programKey={card.programKey}
                          color={card.color}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </>
              )}
            </Tabs>
          ) : (
            <div className="text-center text-gray-500">
              <p>Aucune donnée à afficher pour les filtres sélectionnés.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}