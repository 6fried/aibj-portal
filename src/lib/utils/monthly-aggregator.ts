import { startOfMonth, endOfMonth, addMonths, isBefore } from 'date-fns';

export interface MonthlyInterval {
  from: Date;
  to: Date;
}

export function splitDateRangeIntoMonths(startDate: Date, endDate: Date): MonthlyInterval[] {
  const intervals: MonthlyInterval[] = [];
  let currentDate = startDate;

  while (isBefore(currentDate, endDate) || currentDate.getMonth() === endDate.getMonth()) {
    const from = startOfMonth(currentDate);
    const to = endOfMonth(currentDate);

    intervals.push({ 
      from: from,
      to: isBefore(to, endDate) ? to : endDate 
    });

    currentDate = addMonths(currentDate, 1);
  }

  return intervals;
}
