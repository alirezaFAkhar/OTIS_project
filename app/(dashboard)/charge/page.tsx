import { Suspense } from 'react';
import ChargePageClient from './ChargePageClient';

function ChargeFallback() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
        <div className="h-10 bg-neutral-100 rounded-lg w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-48 bg-neutral-100 rounded-xl" />
          <div className="h-48 bg-neutral-100 rounded-xl" />
        </div>
        <div className="mt-8 h-24 bg-neutral-100 rounded-xl" />
        <div className="mt-6 h-14 bg-neutral-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function ChargePage() {
  return (
    <Suspense fallback={<ChargeFallback />}>
      <ChargePageClient />
    </Suspense>
  );
}
