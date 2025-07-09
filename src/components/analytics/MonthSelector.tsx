'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addYears, subYears, setMonth, getYear } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MonthSelectorProps {
  selectedMonths: string[]; // format "yyyy-MM"
  onApply: (months: string[]) => void;
}

export function MonthSelector({ selectedMonths: initialSelectedMonths, onApply }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState<string[]>(initialSelectedMonths);

  const currentYear = getYear(viewDate);

  const handleMonthClick = (monthIndex: number) => {
    const monthStr = format(setMonth(viewDate, monthIndex), 'yyyy-MM');
    setSelected(prev => 
      prev.includes(monthStr)
        ? prev.filter(m => m !== monthStr)
        : [...prev, monthStr].sort()
    );
  };

  const handleApplyClick = () => {
    onApply(selected);
    setIsOpen(false);
  };

  const getLcTermMonths = (year: number) => {
    const months = [];
    // Feb of current year to Jan of next year
    for (let i = 1; i < 13; i++) { // Feb (1) to Dec (11) + Jan (0)
      const d = new Date(year, i, 1);
      if (i === 12) d.setFullYear(year + 1); // Jan of next year
      months.push(format(d, 'yyyy-MM'));
    }
    return months;
  }

  const getMcTermMonths = (startYear: number) => {
    const months = [];
    // Aug of startYear to Jul of endYear
    for (let i = 7; i < 19; i++) { // Aug (7) to Jul (6) of next year
        const d = new Date(startYear, i, 1);
        months.push(format(d, 'yyyy-MM'));
    }
    return months;
  }

  const handleLcTermClick = () => {
    const termMonths = getLcTermMonths(currentYear);
    setSelected(termMonths);
  }

  const handleMcTermClick = () => {
    // MC term starts in the previous year if current month is before August
    const termStartYear = viewDate.getMonth() < 7 ? currentYear - 1 : currentYear;
    const termMonths = getMcTermMonths(termStartYear);
    setSelected(termMonths);
  }

  const months = Array.from({ length: 12 }, (_, i) => setMonth(new Date(currentYear, 0, 1), i));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[320px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected.length > 0 ? `${selected.length} mois sélectionné(s)` : "Sélectionner les mois"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={() => setViewDate(prev => subYears(prev, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-bold text-lg">{currentYear}</div>
          <Button variant="outline" size="icon" onClick={() => setViewDate(prev => addYears(prev, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {months.map((month, index) => {
            const monthStr = format(month, 'yyyy-MM');
            const isSelected = selected.includes(monthStr);
            return (
              <Button
                key={monthStr}
                variant={isSelected ? 'default' : 'outline'}
                className="h-12"
                onClick={() => handleMonthClick(index)}
              >
                {format(month, 'MMM', { locale: fr })}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Raccourcis de Mandat ({currentYear})</h4>
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleMcTermClick}>Mandat MC</Button>
                <Button variant="secondary" size="sm" onClick={handleLcTermClick}>Mandat LC</Button>
            </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">{selected.length} mois</span>
            <Button onClick={handleApplyClick}>Appliquer</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
