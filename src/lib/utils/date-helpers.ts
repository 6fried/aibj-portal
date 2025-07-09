import { 
  startOfDay, endOfDay, subDays, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, subMonths,
  setMonth, setDate, addYears
} from 'date-fns';

export interface DateRange {
  from: Date;
  to: Date;
}

// --- Périodes de base ---

export const getTodayRange = (): DateRange => ({
  from: startOfDay(new Date()),
  to: endOfDay(new Date()),
});

export const getYesterdayRange = (): DateRange => {
  const yesterday = subDays(new Date(), 1);
  return {
    from: startOfDay(yesterday),
    to: endOfDay(yesterday),
  };
};

export const getThisWeekRange = (): DateRange => ({
  from: startOfWeek(new Date(), { weekStartsOn: 1 }), // Lundi
  to: endOfWeek(new Date(), { weekStartsOn: 1 }),
});

export const getLastWeekRange = (): DateRange => {
  const lastWeek = subDays(new Date(), 7);
  return {
    from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
    to: endOfWeek(lastWeek, { weekStartsOn: 1 }),
  };
};

export const getThisMonthRange = (): DateRange => ({
  from: startOfMonth(new Date()),
  to: endOfMonth(new Date()),
});

export const getLastMonthRange = (): DateRange => {
  const lastMonth = subMonths(new Date(), 1);
  return {
    from: startOfMonth(lastMonth),
    to: endOfMonth(lastMonth),
  };
};

// --- Périodes AIESEC ---

// Un semestre AIESEC va de Février à Juillet (S1) ou d'Août à Janvier (S2)
export const getThisSemesterRange = (): DateRange => {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0 = Janvier, 1 = Février, etc.

  let from, to;
  if (currentMonth >= 1 && currentMonth <= 6) { // Février à Juillet (S1)
    from = setDate(setMonth(now, 1), 1); // 1er Février
    to = endOfMonth(setDate(setMonth(now, 6), 31)); // 31 Juillet
  } else { // Août à Janvier (S2)
    from = setDate(setMonth(now, 7), 1); // 1er Août
    to = endOfMonth(setDate(setMonth(addYears(now, 1), 0), 31)); // 31 Janvier de l'année suivante
  }
  return { from: startOfDay(from), to: endOfDay(to) };
};

export const getLastSemesterRange = (): DateRange => {
  const sixMonthsAgo = subMonths(new Date(), 6);
  const lastSemesterMonth = sixMonthsAgo.getMonth();

  let from, to;
  if (lastSemesterMonth >= 1 && lastSemesterMonth <= 6) { // Février à Juillet
    from = setDate(setMonth(sixMonthsAgo, 1), 1);
    to = endOfMonth(setDate(setMonth(sixMonthsAgo, 6), 31));
  } else {
    from = setDate(setMonth(sixMonthsAgo, 7), 1);
    to = endOfMonth(setDate(setMonth(addYears(sixMonthsAgo, 1), 0), 31));
  }
  return { from: startOfDay(from), to: endOfDay(to) };
};

// Mandat MC: 1er Février -> 31 Janvier
export const getMCTermRange = (current: boolean = true): DateRange => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let termStartYear = currentYear;
  if (currentMonth < 1) { // Si on est en Janvier, on est encore dans le mandat de l'année N-1
    termStartYear = currentYear - 1;
  }

  if (!current) {
    termStartYear -= 1;
  }

  const from = setDate(setMonth(new Date(termStartYear, 0), 1), 1); // 1er Février
  const to = endOfMonth(setDate(setMonth(new Date(termStartYear + 1, 0), 0), 31)); // 31 Janvier N+1

  return { from: startOfDay(from), to: endOfDay(to) };
};

// Mandat LC: 1er Juillet -> 30 Juin
export const getLCTermRange = (current: boolean = true): DateRange => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let termStartYear = currentYear;
  if (currentMonth < 6) { // Si on est avant Juillet, on est dans le mandat qui a commencé l'année N-1
    termStartYear = currentYear - 1;
  }

  if (!current) {
    termStartYear -= 1;
  }

  const from = setDate(setMonth(new Date(termStartYear, 0), 6), 1); // 1er Juillet
  const to = endOfMonth(setDate(setMonth(new Date(termStartYear + 1, 0), 5), 30)); // 30 Juin N+1

  return { from: startOfDay(from), to: endOfDay(to) };
};
