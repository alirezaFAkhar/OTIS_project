'use client';

/**
 * Loading state component
 */
export default function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
        <p className="text-sm sm:text-base text-gray-600">در حال بارگذاری اطلاعات...</p>
      </div>
    </div>
  );
}

