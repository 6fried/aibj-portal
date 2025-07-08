"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { User, Target, CircleCheck, ThumbsUp, Eye, FileCheck, Star } from 'lucide-react';

const metricIcons: { [key: string]: React.ReactNode } = {
  signup: <User size={18} />,
  applied: <Target size={18} />,
  accepted: <CircleCheck size={18} />,
  approved: <ThumbsUp size={18} />,
  realized: <Eye size={18} />,
  finished: <FileCheck size={18} />,
  completed: <Star size={18} />,
};

interface PerformanceFunnelCardProps {
  title: string;
  data: any;
  metrics: { [key: string]: string };
  programKey: 'total' | 'gv' | 'gta' | 'gte';
  color: string;
}

export function PerformanceFunnelCard({ title, data, metrics, programKey, color }: PerformanceFunnelCardProps) {
  if (!data) {
    return null;
  }

  const realizedMetric = data?.[`realized_${programKey}`]?.paging?.total_items ?? 0;

  return (
    <Card className={cn("border-t-4", color)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm text-gray-500">Réalisations</p>
          </div>
          <p className={cn("text-2xl font-bold", color.replace('border-', 'text-'))}>{realizedMetric}</p>
        </div>
        
        <ul className="space-y-1">
          {Object.entries(metrics).map(([metricKey, metricLabel]) => (
            <li key={metricKey} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                {metricIcons[metricKey]}
                <span>{metricLabel}</span>
              </div>
              <span className="font-semibold text-gray-800">
                {data?.[`${metricKey}_${programKey}`]?.paging?.total_items ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
