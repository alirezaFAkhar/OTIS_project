'use client';

import { toPersianNumber } from '../../dashboard/utils/numberUtils';

interface PaymentPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function PaymentPagination({
  currentPage,
  totalPages,
  totalCount,
  rowsPerPage,
  onPageChange,
}: PaymentPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 sm:mt-6">
      {/* Mobile Pagination */}
      <div className="md:hidden space-y-3">
        <div className="text-center text-xs sm:text-sm text-gray-600">
          نمایش {toPersianNumber((currentPage - 1) * rowsPerPage + 1)} تا{' '}
          {toPersianNumber(Math.min(currentPage * rowsPerPage, totalCount))} از{' '}
          {toPersianNumber(totalCount)} ردیف
        </div>
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            قبلی
          </button>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 px-2">
              صفحه {toPersianNumber(currentPage)} از {toPersianNumber(totalPages)}
            </span>
          </div>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            بعدی
          </button>
        </div>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden md:flex justify-between items-center">
        <div className="text-sm text-gray-600">
          نمایش {toPersianNumber((currentPage - 1) * rowsPerPage + 1)} تا{' '}
          {toPersianNumber(Math.min(currentPage * rowsPerPage, totalCount))} از{' '}
          {toPersianNumber(totalCount)} ردیف
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            قبلی
          </button>
          <div className="flex space-x-1 space-x-reverse">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
              )
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {toPersianNumber(page)}
                  </button>
                </div>
              ))}
          </div>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            بعدی
          </button>
        </div>
      </div>
    </div>
  );
}

