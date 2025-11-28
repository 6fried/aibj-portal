import RecruitmentClient from './_components/RecruitmentClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function RecruitmentPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <RecruitmentClient />
      </Suspense>
    </div>
  );
}
