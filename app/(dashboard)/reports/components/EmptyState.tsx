'use client';

export default function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        هیچ پرداختی یافت نشد
      </h3>
      <p className="text-gray-500">
        پرداخت‌های شما در اینجا نمایش داده می‌شوند
      </p>
    </div>
  );
}

