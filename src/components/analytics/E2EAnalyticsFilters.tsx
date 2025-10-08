'use client';

import * as React from 'react';
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import { Button } from '@/components/ui/button';
import { Office } from '@/lib/office-utils';
import { E2EAnalyticsFilters as E2EFiltersType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statuses = ['applied', 'an_signed', 'approved', 'realized'];

interface E2EAnalyticsFiltersProps {
  offices: Office[];
  onFiltersChange: (filters: E2EFiltersType) => void;
}

export function E2EAnalyticsFilters({ offices, onFiltersChange }: E2EAnalyticsFiltersProps) {
  const [sendingEntity, setSendingEntity] = React.useState<number | null>(null);
  const [hostingEntity, setHostingEntity] = React.useState<number | null>(null);
  const [status, setStatus] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [error, setError] = React.useState<string>('');

  const officeOptions = React.useMemo(() => {
    return offices.map(office => ({
      value: office.id.toString(),
      label: `${office.name} (${office.type})`
    }));
  }, [offices]);

  const handleSearch = () => {
    setError('');
        if (sendingEntity === null || hostingEntity === null || !status || !startDate || !endDate) {
      setError('Please fill all the filters.');
      return;
    }

    const sendingOffice = offices.find((o) => o.id === sendingEntity);
    const hostingOffice = offices.find((o) => o.id === hostingEntity);

    if (sendingOffice && hostingOffice && sendingOffice.type !== hostingOffice.type) {
      setError('Sending and hosting entities must both be MCs or LCs.');
      return;
    }

    onFiltersChange({ sendingEntity, hostingEntity, status, date: { from: startDate, to: endDate } });
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Combobox
          options={officeOptions}
          value={sendingEntity?.toString()}
          onChange={(value) => setSendingEntity(value ? Number(value) : null)}
          placeholder="Select sending entity"
          searchPlaceholder="Search entity..."
          emptyPlaceholder="No entity found."
        />

        <Combobox
          options={officeOptions}
          value={hostingEntity?.toString()}
          onChange={(value) => setHostingEntity(value ? Number(value) : null)}
          placeholder="Select hosting entity"
          searchPlaceholder="Search entity..."
          emptyPlaceholder="No entity found."
        />

        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DatePicker date={startDate} onDateChange={setStartDate} placeholder="Start Date" />
        <DatePicker date={endDate} onDateChange={setEndDate} placeholder="End Date" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
}
