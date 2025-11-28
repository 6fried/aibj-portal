'use client';

import * as React from 'react';
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from '@/components/ui/button';
import { E2EAnalyticsFilters as E2EFiltersType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const statuses = ['applied', 'an_signed', 'approved', 'realized'];

interface Committee {
  id: number;
  name: string;
  tag: string;
}

interface E2EAnalyticsFiltersProps {
  onFiltersChange: (filters: E2EFiltersType, sending: Committee, hosting: Committee) => void;
}

export function E2EAnalyticsFilters({ onFiltersChange }: E2EAnalyticsFiltersProps) {
  const [sendingEntity, setSendingEntity] = React.useState<number | null>(null);
  const [hostingEntity, setHostingEntity] = React.useState<number | null>(null);
  const [status, setStatus] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [error, setError] = React.useState<string>('');
  
  const [sendingOpen, setSendingOpen] = React.useState(false);
  const [hostingOpen, setHostingOpen] = React.useState(false);
  const [sendingSearch, setSendingSearch] = React.useState('');
  const [hostingSearch, setHostingSearch] = React.useState('');
  const [sendingResults, setSendingResults] = React.useState<Committee[]>([]);
  const [hostingResults, setHostingResults] = React.useState<Committee[]>([]);
  const [sendingLoading, setSendingLoading] = React.useState(false);
  const [hostingLoading, setHostingLoading] = React.useState(false);

  const searchCommittees = React.useCallback(async (query: string, setSetter: (results: Committee[]) => void, setLoader: (loading: boolean) => void) => {
    if (!query || query.length < 2) {
      setSetter([]);
      return;
    }

    setLoader(true);
    try {
      const response = await fetch(`/api/committees?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSetter(data);
      }
    } catch (error) {
      console.error('Error searching committees:', error);
    } finally {
      setLoader(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchCommittees(sendingSearch, setSendingResults, setSendingLoading);
    }, 300);
    return () => clearTimeout(timer);
  }, [sendingSearch, searchCommittees]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchCommittees(hostingSearch, setHostingResults, setHostingLoading);
    }, 300);
    return () => clearTimeout(timer);
  }, [hostingSearch, searchCommittees]);

  const handleSearch = () => {
    setError('');
    if (sendingEntity === null || hostingEntity === null || !status || !startDate || !endDate) {
      setError('Please fill all the filters.');
      return;
    }

    const sendingCommittee = sendingResults.find((c) => c.id === sendingEntity);
    const hostingCommittee = hostingResults.find((c) => c.id === hostingEntity);

    if (!sendingCommittee || !hostingCommittee) {
      setError('Please select valid entities.');
      return;
    }

    if (sendingCommittee.tag !== hostingCommittee.tag) {
      setError('Sending and hosting entities must have the same type (MC, LC, or AI).');
      return;
    }

    onFiltersChange(
      { sendingEntity, hostingEntity, status, date: { from: startDate, to: endDate } },
      sendingCommittee,
      hostingCommittee
    );
  };

  const selectedSending = sendingResults.find(c => c.id === sendingEntity);
  const selectedHosting = hostingResults.find(c => c.id === hostingEntity);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Sending Entity */}
        <Popover open={sendingOpen} onOpenChange={setSendingOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={sendingOpen}
              className="justify-between"
            >
              {selectedSending ? selectedSending.name : "Select sending entity"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command shouldFilter={false}>
              <CommandInput 
                placeholder="Search entity..." 
                value={sendingSearch}
                onValueChange={setSendingSearch}
              />
              <CommandList>
                {sendingLoading && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                {!sendingLoading && sendingResults.length === 0 && sendingSearch.length >= 2 && (
                  <CommandEmpty>No entity found.</CommandEmpty>
                )}
                {!sendingLoading && sendingSearch.length < 2 && (
                  <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
                )}
                {!sendingLoading && sendingResults.length > 0 && (
                  <CommandGroup>
                    {sendingResults.map((committee) => (
                      <CommandItem
                        key={committee.id}
                        value={committee.name}
                        onSelect={() => {
                          setSendingEntity(committee.id);
                          setSendingOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            sendingEntity === committee.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {committee.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Hosting Entity */}
        <Popover open={hostingOpen} onOpenChange={setHostingOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={hostingOpen}
              className="justify-between"
            >
              {selectedHosting ? selectedHosting.name : "Select hosting entity"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command shouldFilter={false}>
              <CommandInput 
                placeholder="Search entity..." 
                value={hostingSearch}
                onValueChange={setHostingSearch}
              />
              <CommandList>
                {hostingLoading && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                {!hostingLoading && hostingResults.length === 0 && hostingSearch.length >= 2 && (
                  <CommandEmpty>No entity found.</CommandEmpty>
                )}
                {!hostingLoading && hostingSearch.length < 2 && (
                  <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
                )}
                {!hostingLoading && hostingResults.length > 0 && (
                  <CommandGroup>
                    {hostingResults.map((committee) => (
                      <CommandItem
                        key={committee.id}
                        value={committee.name}
                        onSelect={() => {
                          setHostingEntity(committee.id);
                          setHostingOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            hostingEntity === committee.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {committee.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Status */}
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

        {/* Date Range */}
        <DatePicker date={startDate} onDateChange={setStartDate} placeholder="Start Date" />
        <DatePicker date={endDate} onDateChange={setEndDate} placeholder="End Date" />
      </div>
      
      {error && <p className="text-sm text-destructive">{error}</p>}
      
      <Button onClick={handleSearch} className="w-full md:w-auto">
        Search
      </Button>
    </div>
  );
}
