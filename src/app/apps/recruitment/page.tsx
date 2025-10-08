import RecruitmentClient from './_components/RecruitmentClient';
import { Suspense } from 'react';

export default function RecruitmentPage() {
  return (
    <div className="h-full w-full">
      <Suspense fallback={<div>Chargement des recrutements...</div>}>
        <RecruitmentClient />
      </Suspense>
    </div>
  );
}
