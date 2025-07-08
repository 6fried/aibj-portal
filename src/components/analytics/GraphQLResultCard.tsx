'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GraphQLResultCardProps {
  title: string;
  data: { [key: string]: any };
  metrics: { [key: string]: string };
}

export function GraphQLResultCard({ title, data, metrics }: GraphQLResultCardProps) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(metrics).map(([key, name]) => (
              <TableRow key={key}>
                <TableCell>{name}</TableCell>
                <TableCell className="text-right">{data[key]?.paging?.total_items ?? 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
