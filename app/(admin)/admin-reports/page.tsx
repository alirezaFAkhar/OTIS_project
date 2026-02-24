'use client';

import PaymentFilters from '@/components/PaymentFilters';
import { usePayments } from './hooks/usePayments';
import PaymentTable from './components/PaymentTable';
import PaymentCardList from './components/PaymentCardList';
import Pagination from './components/Pagination';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

export default function AdminReportsPage() {
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
  } = usePayments();

  return (
    <div className="space-y-4 sm:space-y-6 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          گزارش پرداخت‌ها
        </h1>

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

