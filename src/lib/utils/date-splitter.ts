import { startOfMonth, endOfMonth, eachMonthOfInterval, format } from 'date-fns';

export function splitDateRangeByMonth(startDate: Date, endDate: Date): { from: string, to: string }[] {
  const interval = { start: startDate, end: endDate };
  const months = eachMonthOfInterval(interval);

  return months.map(monthDate => {
    const firstDay = startOfMonth(monthDate);
    const lastDay = endOfMonth(monthDate);

    // Ensure the interval does not go beyond the original start and end dates
    const from = firstDay < startDate ? startDate : firstDay;
    const to = lastDay > endDate ? endDate : lastDay;

    return {
      from: format(from, 'yyyy-MM-dd'),
      to: format(to, 'yyyy-MM-dd'),
    };
  });
}
