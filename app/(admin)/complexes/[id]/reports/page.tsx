'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useComplexPayments } from './hooks/useComplexPayments';
import PaymentFilters from '@/components/PaymentFilters';
import PaymentTable from '@/app/(admin)/admin-reports/components/PaymentTable';
import PaymentCardList from '@/app/(admin)/admin-reports/components/PaymentCardList';
import Pagination from '@/app/(admin)/admin-reports/components/Pagination';
import LoadingState from '@/app/(admin)/admin-reports/components/LoadingState';
import ErrorState from '@/app/(admin)/admin-reports/components/ErrorState';

export default function ComplexReportsPage() {
  const params = useParams();
  const complexId = parseInt(params.id as string);
  const [complexName, setComplexName] = useState<string>('');

  const {
    payments,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    handleFilter,
    handleClearFilters,
    handlePageChange,
    handleRowsPerPageChange,
  } = useComplexPayments(complexId);

  useEffect(() => {
    // Fetch complex name
    const fetchComplexName = async () => {
      try {
        const response = await fetch('/api/admin/complexes');
        const data = await response.json();
        if (data.complexes) {
          const complex = data.complexes.find((c: any) => c.id === complexId);
          if (complex) {
            setComplexName(complex.name);
          }
        }
      } catch (err) {
        console.error('Error fetching complex name:', err);
      }
    };

    if (complexId) {
      fetchComplexName();
    }
  }, [complexId]);

  if (!complexId || isNaN(complexId)) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <ErrorState message="شناسه مجموعه نامعتبر است" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            گزارش پرداخت‌ها
          </h1>
          {complexName && (
            <p className="text-sm sm:text-base text-gray-600">
              مجموعه: <span className="font-semibold">{complexName}</span>
            </p>
          )}
        </div>

        <PaymentFilters
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          rowsPerPage={pagination.limit}
          onFromDateChange={(value) => setFilters({ ...filters, fromDate: value })}
          onToDateChange={(value) => setFilters({ ...filters, toDate: value })}
          onRowsPerPageChange={handleRowsPerPageChange}
          onFilter={handleFilter}
          onClearFilters={handleClearFilters}
          trackingNumber={filters.trackingNumber}
          onTrackingNumberChange={(value) => setFilters({ ...filters, trackingNumber: value })}
          status={filters.status}
          onStatusChange={(value) => setFilters({ ...filters, status: value })}
        />

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <>
            <PaymentTable payments={payments} />
            <PaymentCardList payments={payments} />
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}

