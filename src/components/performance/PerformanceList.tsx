// src/components/performance/PerformanceList.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProcessedPerformanceData } from "@/lib/analytics/aiesec-analytics"

interface PerformanceListProps {
  data: ProcessedPerformanceData
  department: 'ogx' | 'icx'
  programme?: 'total' | 'gv' | 'gta' | 'gte'
}

export function PerformanceList({ data, department, programme = 'total' }: PerformanceListProps) {
  const departmentData = data[department][programme]
  
  const metrics = [
    { code: 'SU', name: 'Signup', value: departmentData.SU, color: 'bg-blue-100 text-blue-800' },
    { code: 'APL', name: 'Applied', value: departmentData.APL, color: 'bg-yellow-100 text-yellow-800' },
    { code: 'ACH', name: 'Accepted by Host', value: departmentData.ACH, color: 'bg-orange-100 text-orange-800' },
    { code: 'ACC', name: 'Accepted', value: departmentData.ACC, color: 'bg-green-100 text-green-800' },
    { code: 'APD', name: 'Approved', value: departmentData.APD, color: 'bg-purple-100 text-purple-800' },
    { code: 'RE', name: 'Realized', value: departmentData.RE, color: 'bg-teal-100 text-teal-800' },
    { code: 'FIN', name: 'Finished', value: departmentData.FIN, color: 'bg-indigo-100 text-indigo-800' },
    { code: 'CO', name: 'Completed', value: departmentData.CO, color: 'bg-gray-100 text-gray-800' },
  ]

  const getProgrammeName = () => {
    switch (programme) {
      case 'gv': return 'Global Volunteer'
      case 'gta': return 'Global Talent'
      case 'gte': return 'Global Teacher'
      default: return 'Total'
    }
  }

  const getProgrammeColor = () => {
    switch (programme) {
      case 'gv': return 'text-[#F85A40]' // Bright Red pour GV
      case 'gta': return 'text-[#0CB9C1]' // Teal pour GTa
      case 'gte': return 'text-[#F48924]' // Orange pour GTe
      default: return 'text-[#037EF3]' // AIESEC Blue pour Total
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className={`text-lg font-semibold ${getProgrammeColor()}`}>
            {department.toUpperCase()} - {getProgrammeName()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.code} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <Badge className={metric.color}>
                  {metric.code}
                </Badge>
                <span className="font-medium text-gray-700">{metric.name}</span>
              </div>
              <span className={`text-xl font-bold ${getProgrammeColor()}`}>
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}