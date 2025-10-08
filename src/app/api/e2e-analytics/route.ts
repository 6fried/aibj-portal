import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { formatISO } from 'date-fns';
interface AppWithPersonId {
  person: {
    id: string;
  };
}

const statusToDateField: { [key: string]: string } = {
  applied: 'created_at',
  an_signed: 'date_an_signed',
  approved: 'date_approved',
  realized: 'date_realized',
};

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('aiesec_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      sendingEntity,
      hostingEntity,
      status,
      date,
      sendingEntityType,
      hostingEntityType
    } = body;

    if (!sendingEntity || !hostingEntity || !status || !date || !date.from || !date.to) {
      return NextResponse.json({ error: 'Missing required filters' }, { status: 400 });
    }

    const dateField = statusToDateField[status];
    if (!dateField) {
      return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 });
    }

    const fromDate = formatISO(new Date(date.from));
    const toDate = formatISO(new Date(date.to));

    const AIESEC_GRAPHQL_URL = process.env.AIESEC_GRAPHQL_URL;
    if (!AIESEC_GRAPHQL_URL) {
      throw new Error("AIESEC_GRAPHQL_URL environment variable is not set.");
    }

    const fetchPage = async (page: number) => {
      // Construct the final query string with interpolated values
      const finalQuery = `
        query {
          allOpportunityApplication(page: ${page}, per_page: 100, filters: {
            ${dateField}: {
              from: "${fromDate}",
              to: "${toDate}"
            },
            ${sendingEntityType === 'MC' ? 'person_home_mc' : 'person_home_lc'}: ${sendingEntity},
            ${hostingEntityType === 'MC' ? 'opportunity_home_mc' : 'opportunity_home_lc'}: ${hostingEntity}
          }) {
            data {
              person {
                id
              }
            }
            paging {
              total_items
              current_page
              total_pages
            }
          }
        }
      `;

      console.log(`--- Final Query for Page ${page} ---`);
      console.log(finalQuery);
      console.log('--------------------------');

      const response = await fetch(AIESEC_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken,
        },
        body: JSON.stringify({ query: finalQuery }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('GraphQL API Error:', errorBody);
        throw new Error(`GraphQL API responded with status ${response.status}`);
      }
      
      const result = await response.json();
      if (result.errors) {
        console.error('GraphQL Query Errors:', result.errors);
        throw new Error('GraphQL query returned errors.');
      }
      return result.data.allOpportunityApplication;
    };

    // First call to get total pages
    const initialData = await fetchPage(1);
    const totalPages = initialData.paging.total_pages;
    const applications = initialData.paging.total_items;
        const allApplicants = new Set(initialData.data.map((app: AppWithPersonId) => app.person.id));

    // Fetch remaining pages if any
    if (totalPages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(fetchPage(page));
      }
      const results = await Promise.all(pagePromises);
      results.forEach(pageData => {
                pageData.data.forEach((app: AppWithPersonId) => allApplicants.add(app.person.id));
      });
    }

    return NextResponse.json({
      applications,
      applicants: allApplicants.size
    });

  } catch (error: unknown) {
    console.error('E2E Analytics API Route Error:', error);
    const message = error instanceof Error ? error.message : 'An internal server error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
