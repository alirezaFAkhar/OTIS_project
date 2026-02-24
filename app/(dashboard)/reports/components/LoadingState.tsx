'use client';

export default function LoadingState() {
  return (
    <div className="text-center py-16">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
    </div>
  );
}

