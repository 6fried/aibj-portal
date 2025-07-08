interface Semester {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
}

interface Mandate {
  id: string;
  label: string;
  semesters: Semester[];
}

export function getMandatePeriods(year: number): Mandate {
  const nextYear = year + 1;
  const mandateLabel = `Mandate ${year}/${nextYear}`;

  return {
    id: mandateLabel,
    label: mandateLabel,
    semesters: [
      {
        id: `s1-${year}`,
        label: `Semestre 1 (${year})`,
        startDate: `${year}-02-01`,
        endDate: `${year}-07-31`,
      },
      {
        id: `s2-${year}`,
        label: `Semestre 2 (${year})`,
        startDate: `${year}-08-01`,
        endDate: `${nextYear}-01-31`,
      },
    ],
  };
}
