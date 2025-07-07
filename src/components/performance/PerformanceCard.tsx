"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProcessedPerformanceData } from "@/lib/analytics/aiesec-analytics"
import { Users, CheckCircle, ArrowRightCircle, Target, ThumbsUp, Award, Star } from 'lucide-react';

interface PerformanceCardProps {
  data: ProcessedPerformanceData
  department: 'ogx' | 'icx'
  programme?: 'total' | 'gv' | 'gta' | 'gte'
}

const programmeDetails = {
  total: { name: 'Total', color: 'text-[#037EF3]' },
  gv: { name: 'Global Volunteer', color: 'text-[#F85A40]' },
  gta: { name: 'Global Talent', color: 'text-[#0CB9C1]' },
  gte: { name: 'Global Teacher', color: 'text-[#F48924]' },
};

const metricIcons = {
  SU: <Users size={18} />, 
  APL: <ArrowRightCircle size={18} />,
  ACC: <CheckCircle size={18} />,
  APD: <ThumbsUp size={18} />,
  RE: <Target size={18} />,
  FIN: <Award size={18} />,
  CO: <Star size={18} />,
};

export function PerformanceCard({ data, department, programme = 'total' }: PerformanceCardProps) {
  const departmentData = data[department][programme]
  const details = programmeDetails[programme];

  const metrics = [
    { code: 'SU', name: 'Signup', value: departmentData.SU },
    { code: 'APL', name: 'Applied', value: departmentData.APL },
    { code: 'ACC', name: 'Accepted', value: departmentData.ACC },
    { code: 'APD', name: 'Approved', value: departmentData.APD },
    { code: 'RE', name: 'Realized', value: departmentData.RE },
    { code: 'FIN', name: 'Finished', value: departmentData.FIN },
    { code: 'CO', name: 'Completed', value: departmentData.CO },
  ]

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4" style={{ borderLeftColor: details.color.replace('text-[', '').replace(']', '') }}>
      <CardHeader>
        <CardTitle className={`flex items-center justify-between text-xl font-bold ${details.color}`}>
          <span>{details.name}</span>
          <span className="text-2xl font-extrabold">{departmentData.RE || 0}</span>
        </CardTitle>
        <p className="text-sm text-gray-500">Réalisations</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.code} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                {metricIcons[metric.code as keyof typeof metricIcons]}
                <span>{metric.name}</span>
              </div>
              <span className="font-bold text-gray-800">{metric.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
