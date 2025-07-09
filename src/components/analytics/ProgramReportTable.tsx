'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MonthlyData } from '@/lib/types';

import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProgramReportTableProps {
  data: MonthlyData[];
  program: 'gv' | 'gta' | 'gte';
  type: 'ogx' | 'icx';
}

const STATUS_MAP = {
  ogx: [
    { key: 'applied', label: 'Applicants' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'approved', label: 'Approvals' },
    { key: 'realized', label: 'Realised' },
    { key: 'finished', label: 'Finished' },
    { key: 'completed', label: 'Complete' },
  ],
  icx: [
    { key: 'open', label: 'Opens' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'approved', label: 'Approvals' },
    { key: 'realized', label: 'Realised' },
    { key: 'finished', label: 'Finished' },
    { key: 'completed', label: 'Complete' },
  ],
};

export function ProgramReportTable({ data, program, type }: ProgramReportTableProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const months = data.map(d => d.month);
  const statuses = STATUS_MAP[type];

  const getPivotedData = (statusKey: string) => {
    return data.map(monthlyEntry => {
      const dataSet = type === 'ogx' ? monthlyEntry.ogx : monthlyEntry.icx;
      const metricKey = `${statusKey}_${program}`;
      return dataSet?.data?.[metricKey]?.paging?.total_items || 0;
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border mt-2">
      <Table className="min-w-full text-sm">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[150px] font-semibold">Status</TableHead>
            {months.map(monthStr => {
              const monthDate = parse(monthStr, 'yyyy-MM', new Date());
              const monthName = format(monthDate, 'MMMM yyyy', { locale: fr });
              return (
                <TableHead key={monthStr} className="text-right font-semibold capitalize">{monthName}</TableHead>
              )
            })}
            <TableHead className="text-right font-bold text-primary bg-slate-100 dark:bg-slate-800">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statuses.map((status, rowIndex) => {
            const monthlyValues = getPivotedData(status.key);
            const rowTotal = monthlyValues.reduce((sum, val) => sum + val, 0);

            return (
              <TableRow key={status.key} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-muted/50'}>
                <TableCell className="font-medium">{status.label}</TableCell>
                {monthlyValues.map((value, index) => (
                  <TableCell key={`${status.key}-${months[index]}`} className="text-right tabular-nums">
                    {value}
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold text-primary bg-slate-100 dark:bg-slate-800 tabular-nums">{rowTotal}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
