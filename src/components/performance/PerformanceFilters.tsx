// src/components/performance/PerformanceFilters.tsx
"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PerformanceFiltersProps {
  selectedYear: number
  selectedEntity: string
  onYearChange: (year: number) => void
  onEntityChange: (entity: string) => void
  userRole?: string
  userLC?: string
}

export function PerformanceFilters({ 
  selectedYear, 
  selectedEntity,
  onYearChange, 
  onEntityChange,
  userRole,
  userLC 
}: PerformanceFiltersProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  
  // Entités du Bénin - tu peux ajuster selon tes LC
  const entities = [
    { id: 'aiesec_benin', name: 'AIESEC in Benin', level: 'mc' },
    { id: 'lc_cotonou', name: 'LC Cotonou', level: 'lc' },
    { id: 'lc_parakou', name: 'LC Parakou', level: 'lc' },
    { id: 'lc_abomey_calavi', name: 'LC Abomey-Calavi', level: 'lc' },
    // Ajoute d'autres LC selon tes besoins
  ]

  // Filtrer les entités selon le rôle
  const availableEntities = entities.filter(entity => {
    if (userRole?.includes('MCP') || userRole?.includes('MCVP')) {
      return true // Accès à toutes les entités
    }
    if (userRole?.includes('LCP') || userRole?.includes('LCVP')) {
      return entity.level === 'lc' && entity.name.includes(userLC || '')
    }
    return entity.level === 'lc' // Par défaut, accès LC seulement
  })

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-[#037EF3]">Filtres</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Année</label>
            <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'année" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Entité</label>
            <Select value={selectedEntity} onValueChange={onEntityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'entité" />
              </SelectTrigger>
              <SelectContent>
                {availableEntities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}