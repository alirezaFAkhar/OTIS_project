'use client';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

/**
 * Error state component with retry button
 */
export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] px-4">
      <div className="text-center max-w-md w-full">
        <p className="text-sm sm:text-base text-red-600 mb-4 wrap-break-word">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}

