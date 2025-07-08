

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

export async function fetchPerformanceFunnel(entityId: string, from: string, to: string, accessToken: string) {
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

  return {
    ogx: { data: ogxData },
    icx: { data: icxData },
    query: allQueries.join('\n\n---\n\n')
  };
}
