import 'server-only';
import { E2EAnalyticsClient } from './_components/E2EAnalyticsClient';

export default function E2EAnalyticsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <E2EAnalyticsClient />
    </div>
  );
}
