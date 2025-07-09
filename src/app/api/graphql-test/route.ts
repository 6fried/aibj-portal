import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { fetchPerformanceFunnel } from '@/lib/analytics/graphql-fetcher';

// Helper to process promises in chunks
async function processInBatches<T, R>(items: T[], batchSize: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  let results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results = results.concat(batchResults);
  }
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('aiesec_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { officeId, selectedMonths } = body;

    if (!officeId || !selectedMonths || !Array.isArray(selectedMonths) || selectedMonths.length === 0) {
      return NextResponse.json({ error: 'Missing required parameters: officeId and selectedMonths are required.' }, { status: 400 });
    }

    // Convert 'YYYY-MM' strings into date ranges { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
    const monthlyIntervals = selectedMonths.map((monthStr: string) => {
      const monthDate = new Date(`${monthStr}-02`); // Use day 2 to avoid timezone issues
      const from = format(startOfMonth(monthDate), 'yyyy-MM-dd');
      const to = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      return { from, to };
    });

    const fetcher = (interval: { from: string, to: string }) => 
      fetchPerformanceFunnel(officeId, interval.from, interval.to, accessToken);

    // Process 3 months at a time to avoid gateway timeouts
    const results = await processInBatches(monthlyIntervals, 3, fetcher);

    const monthlyData = results.map((data, index) => ({
      month: selectedMonths[index], // Format YYYY-MM
      ...data
    }));

    return NextResponse.json(monthlyData);

  } catch (error : unknown) {
    console.error('Error in graphql-test route:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to process request', details },
      { status: 500 }
    );
  }
}

