// src/components/performance/AnalyticsFilters.tsx
"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "./DatePicker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AnalyticsFiltersProps {
  dateRange: { from: Date, to: Date };
  selectedEntity: string;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onApplyFilters: () => void;
  onEntityChange: (entity: string) => void;
  entityList: { id: string; name: string }[];
  isMcvp: boolean;
}

export function AnalyticsFilters({ 
  dateRange,
  selectedEntity,
  onStartDateChange,
  onEndDateChange,
  onEntityChange,
  onApplyFilters,
  entityList,
  isMcvp
}: AnalyticsFiltersProps) {

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-[#037EF3]">Filtres</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Période</label>
            <div className="grid grid-cols-2 gap-4">
              <DatePicker date={dateRange.from} onDateChange={(date) => onStartDateChange(date as Date)} />
              <DatePicker date={dateRange.to} onDateChange={(date) => onEndDateChange(date as Date)} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Office</label>
            <Select value={selectedEntity} onValueChange={onEntityChange} disabled={!isMcvp}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une entité" />
              </SelectTrigger>
              <SelectContent>
                {entityList.map(entity => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onApplyFilters} className="w-full md:w-auto">Appliquer</Button>
        </div>
      </CardContent>
    </Card>
  )
}