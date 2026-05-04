'use client';

import { Suspense } from 'react';

import { AdvisorWizard } from '@/components/selector/AdvisorWizard';

export default function SelectorAdvisorPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-[#f5f5f7]"
          style={{ WebkitFontSmoothing: 'antialiased' }}
        />
      }
    >
      <AdvisorWizard />
    </Suspense>
  );
}
