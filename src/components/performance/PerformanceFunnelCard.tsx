"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, CheckCircle, ThumbsUp, Goal, Trophy, Star } from 'lucide-react';

const programDetails: { [key: string]: { title: string; color: string; } } = {
  total: { title: 'Total', color: 'text-blue-500' },
  gv: { title: 'Global Volunteer', color: 'text-red-500' },
  gta: { title: 'Global Talent', color: 'text-teal-500' },
  gte: { title: 'Global Teacher', color: 'text-orange-500' },
};

const metricIcons: { [key: string]: React.ElementType } = {
  signups: Users,
  applied: Target,
  accepted: CheckCircle,
  approved: ThumbsUp,
  realized: Goal,
  finished: Trophy,
  completed: Star,
};

interface PerformanceFunnelCardProps {
  data: any;
  metrics: { [key: string]: string };
  programKey: 'total' | 'gv' | 'gta' | 'gte';
}

export function PerformanceFunnelCard({ data, metrics, programKey }: PerformanceFunnelCardProps) {
  if (!data) {
    return null;
  }

  const details = programDetails[programKey];
  const realizedValue = data?.[`realized_${programKey}`]?.paging?.total_items ?? 0;

  return (
    <Card className="overflow-hidden rounded-lg shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`text-lg font-bold ${details.color}`}>{details.title}</h3>
            <p className="text-sm text-gray-500">Réalisations</p>
          </div>
          <div className={`text-3xl font-bold ${details.color}`}>
            {realizedValue}
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {Object.entries(metrics).map(([metricKey, metricLabel]) => {
            const Icon = metricIcons[metricKey] || Star;
            const value = data?.[`${metricKey}_${programKey}`]?.paging?.total_items ?? 0;
            return (
              <li key={metricKey} className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{metricLabel}</span>
                </div>
                <span className="font-semibold text-gray-800">{value}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
