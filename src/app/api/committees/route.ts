import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('aiesec_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  const AIESEC_GRAPHQL_URL = process.env.AIESEC_GRAPHQL_URL;
  if (!AIESEC_GRAPHQL_URL) {
    return NextResponse.json({ error: 'GraphQL URL not configured' }, { status: 500 });
  }

  try {
    const graphqlQuery = `
      query SearchCommittees {
        committees(q: "${query}") {
          data {
            id
            name
            tag
          }
        }
      }
    `;

    const response = await fetch(AIESEC_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken,
      },
      body: JSON.stringify({ query: graphqlQuery }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL API responded with status ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL Query Errors:', result.errors);
      throw new Error('GraphQL query returned errors');
    }

    return NextResponse.json(result.data.committees.data);
  } catch (error) {
    console.error('Error in committees API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch committees', details: errorMessage }, { status: 500 });
  }
}
