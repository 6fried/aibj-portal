

const programs = [
  { id: 7, name: 'gv' },
  { id: 8, name: 'gta' },
  { id: 9, name: 'gte' },
];

// Builds a query for a specific program or for the total (OGX)
function buildOgxProgramQuery(from: string, to: string, entityId: string, programName: string, programId?: number): string {
  const fromDate = `${from}T00:00:00+01:00`;
  const toDate = `${to}T23:59:59+01:00`;

  const signupFilter = programId ? `,selected_programmes:${programId}` : '';
  const opportunityFilters = `person_home_lc:${entityId}${programId ? `,programmes:${programId}` : ''}`;
  const finishedOpportunityFilters = `opportunity_home_lc:${entityId}${programId ? `,programmes:${programId}` : ''}`;

  const queryParts = `
    signup_${programName}:people(filters:{registered:{from:"${fromDate}",to:"${toDate}"}${signupFilter}}){paging{total_items}}
    applied_${programName}:allOpportunityApplication(filters:{created_at:{from:"${fromDate}",to:"${toDate}"},${opportunityFilters}}){paging{total_items}}
    accepted_${programName}:allOpportunityApplication(filters:{date_an_signed:{from:"${fromDate}",to:"${toDate}"},${opportunityFilters}}){paging{total_items}}
    approved_${programName}:allOpportunityApplication(filters:{date_approved:{from:"${fromDate}",to:"${toDate}"},${opportunityFilters}}){paging{total_items}}
    realized_${programName}:allOpportunityApplication(filters:{date_realized:{from:"${fromDate}",to:"${toDate}"},${opportunityFilters}}){paging{total_items}}
    finished_${programName}:allOpportunityApplication(filters:{experience_end_date:{from:"${fromDate}",to:"${toDate}"},${finishedOpportunityFilters}}){paging{total_items}}
    completed_${programName}:allOpportunityApplication(filters:{experience_end_date:{from:"${fromDate}",to:"${toDate}"},status:"completed",${opportunityFilters}}){paging{total_items}}
  `;

  return `query { ${queryParts} }`;
}

// Builds a query for a specific program or for the total (ICX)
function buildIcxProgramQuery(from: string, to: string, entityId: string, programName: string, programId?: number): string {
  const fromDate = `${from}T00:00:00+01:00`;
  const toDate = `${to}T23:59:59+01:00`;

  const programFilter = programId ? `,programmes:${programId}` : '';
  const opportunityFilters = `opportunity_home_lc:${entityId}${programId ? `,programmes:${programId}` : ''}`;

  const queryParts = `
    open_icx_${programName}:opportunities(filters:{date_opened:{from:"${fromDate}",to:"${toDate}"}${programFilter}}){paging{total_items}}
    applied_icx_${programName}:allOpportunityApplication(filters:{created_at:{from:"${fromDate}",to:"${toDate}"},${opportunityFilters}}){paging{total_items}}
    accepted_icx_${programName}:allOpportunityApplication(filters:{date_an_signed:{from:"${fromDate}",to:"${toDate}"},${opportunityFilters}}){paging{total_items}}
    approved_icx_${programName}:allOpportunityApplication(filters:{date_approved:{from:"${fromDate}",to:"${toDate}"},${opportunityFilters}}){paging{total_items}}
    realized_icx_${programName}:allOpportunityApplication(filters:{date_realized:{from:"${fromDate}",to:"${toDate}"},${opportunityFilters}}){paging{total_items}}
    finished_icx_${programName}:allOpportunityApplication(filters:{experience_end_date:{from:"${fromDate}",to:"${toDate}"},${opportunityFilters}}){paging{total_items}}
    completed_icx_${programName}:allOpportunityApplication(filters:{experience_end_date:{from:"${fromDate}",to:"${toDate}"},status:"completed",${opportunityFilters}}){paging{total_items}}
  `;

  return `query { ${queryParts} }`;
}

interface PerformanceFunnelData {
  ogx: { [key: string]: any };
  icx: { [key: string]: any };
}

interface PerformanceFunnelDebugData {
  query: string;
  rawResponse: any;
  processedData: PerformanceFunnelData;
}

export function fetchPerformanceFunnel(from: string, to: string, entityId: string, accessToken: string, debug: true): Promise<PerformanceFunnelDebugData>;
export function fetchPerformanceFunnel(from: string, to: string, entityId: string, accessToken: string, debug?: false): Promise<PerformanceFunnelData>;
export async function fetchPerformanceFunnel(
  from: string, 
  to: string, 
  entityId: string, 
  accessToken: string, 
  debug: boolean = false
): Promise<PerformanceFunnelData | PerformanceFunnelDebugData> {
  const AIESEC_GRAPHQL_URL = process.env.AIESEC_GRAPHQL_URL;
  if (!AIESEC_GRAPHQL_URL) {
    throw new Error("La variable d'environnement AIESEC_GRAPHQL_URL est manquante. Veuillez la définir dans votre fichier .env.local.");
  }

  const allPrograms = [...programs, { id: undefined, name: 'total' }];

  const ogxQueries = allPrograms.map(p => buildOgxProgramQuery(from, to, entityId, p.name, p.id));
  const icxQueries = allPrograms.map(p => buildIcxProgramQuery(from, to, entityId, p.name, p.id));
  const allQueries = [...ogxQueries, ...icxQueries].filter(Boolean);

  const promises = allQueries.map(query => 
    fetch(AIESEC_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken,
      },
      body: JSON.stringify({ query }),
    })
  );

  const responses = await Promise.all(promises);

  for (const response of responses) {
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`GraphQL API responded with status ${response.status}: ${errorBody}`);
    }
  }

  const results = await Promise.all(responses.map(res => res.json()));

  const combinedData = results.reduce((acc, result) => {
    if (result.data) {
      Object.assign(acc, result.data);
    }
    return acc;
  }, {});

  const ogxData: { [key: string]: any } = {};
  const icxData: { [key: string]: any } = {};

  Object.keys(combinedData).forEach(key => {
    if (key.includes('_icx_')) {
      icxData[key.replace('_icx_', '_')] = combinedData[key];
    } else {
      ogxData[key] = combinedData[key];
    }
  });

    const processedData = { ogx: ogxData, icx: icxData };

  if (debug) {
    return {
      query: allQueries.join('\n\n---\n\n'),
      rawResponse: combinedData,
      processedData,
    };
  }

  return processedData;
}

// --- Report Progression --- //

interface StatusProgressionData {
  month: string;
  apl: number;
  acc: number;
  apd: number;
  re: number;
  fin: number;
  co: number;
}

function generateMonthsInPeriod(startDate: string, endDate: string): string[] {
  const months = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (current <= end) {
    const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    months.push(monthStr);
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

function getLastDayOfMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

export async function fetchReportProgression(entityId: string, startDate: string, endDate: string, accessToken: string): Promise<{ ogx: StatusProgressionData[], icx: StatusProgressionData[] }> {
  const AIESEC_GRAPHQL_URL = process.env.AIESEC_GRAPHQL_URL;
  if (!AIESEC_GRAPHQL_URL) {
    throw new Error("La variable d'environnement AIESEC_GRAPHQL_URL est manquante.");
  }

  const months = generateMonthsInPeriod(startDate, endDate);
  const ogxFilters = `person_home_lc: { id: \"${entityId}\" }`;
  const icxFilters = `opportunity_home_lc: { id: \"${entityId}\" }`;

  const statusDateMap: { [key: string]: string } = {
    apl: 'date_applied',
    acc: 'date_an_approved',
    apd: 'date_approved',
    re: 'date_realized',
    fin: 'experience_end_date',
    co: 'experience_end_date',
  };

  let allQueries = '';

  for (const month of months) {
    const monthStart = `${month}-01`;
    const monthEnd = getLastDayOfMonth(month);
    const monthAlias = month.replace('-', '');

    for (const status in statusDateMap) {
      const dateField = statusDateMap[status];
      const extraFilter = status === 'co' ? ', status: \"completed\"' : '';

      // OGX Query Part
      allQueries += `ogx_${status}_${monthAlias}: allOpportunityApplication(filters: { ${dateField}: { from: \"${monthStart}\", to: \"${monthEnd}\" }, ${ogxFilters}${extraFilter} }) { paging { total_items } }\n`;

      // ICX Query Part
      allQueries += `icx_${status}_${monthAlias}: allOpportunityApplication(filters: { ${dateField}: { from: \"${monthStart}\", to: \"${monthEnd}\" }, ${icxFilters}${extraFilter} }) { paging { total_items } }\n`;
    }
  }

  const fullQuery = `query { ${allQueries} }`;

  const response = await fetch(AIESEC_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken,
    },
    body: JSON.stringify({ query: fullQuery }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GraphQL API responded with status ${response.status}: ${errorBody}`);
  }

  const results = await response.json();
  const resultData = results.data;

  const ogxProgression: StatusProgressionData[] = [];
  const icxProgression: StatusProgressionData[] = [];

  for (const month of months) {
    const monthAlias = month.replace('-', '');
    ogxProgression.push({
      month,
      apl: resultData?.[`ogx_apl_${monthAlias}`]?.paging?.total_items ?? 0,
      acc: resultData?.[`ogx_acc_${monthAlias}`]?.paging?.total_items ?? 0,
      apd: resultData?.[`ogx_apd_${monthAlias}`]?.paging?.total_items ?? 0,
      re: resultData?.[`ogx_re_${monthAlias}`]?.paging?.total_items ?? 0,
      fin: resultData?.[`ogx_fin_${monthAlias}`]?.paging?.total_items ?? 0,
      co: resultData?.[`ogx_co_${monthAlias}`]?.paging?.total_items ?? 0,
    });
    icxProgression.push({
      month,
      apl: resultData?.[`icx_apl_${monthAlias}`]?.paging?.total_items ?? 0,
      acc: resultData?.[`icx_acc_${monthAlias}`]?.paging?.total_items ?? 0,
      apd: resultData?.[`icx_apd_${monthAlias}`]?.paging?.total_items ?? 0,
      re: resultData?.[`icx_re_${monthAlias}`]?.paging?.total_items ?? 0,
      fin: resultData?.[`icx_fin_${monthAlias}`]?.paging?.total_items ?? 0,
      co: resultData?.[`icx_co_${monthAlias}`]?.paging?.total_items ?? 0,
    });
  }

  return { ogx: ogxProgression, icx: icxProgression };
}
