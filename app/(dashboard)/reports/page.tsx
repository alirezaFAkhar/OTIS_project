'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import PaymentFilters from '@/components/PaymentFilters';
import PaymentTable from './components/PaymentTable';
import PaymentCard from './components/PaymentCard';
import PaymentPagination from './components/PaymentPagination';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';
import { Payment, Pagination } from './types';

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPayments = async (page: number = currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
      });

      if (fromDate) {
        params.append('fromDate', fromDate);
      }
      if (toDate) {
        params.append('toDate', toDate);
      }

      const response = await fetch(`/api/reports/payments?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت داده‌ها');
      }

      const data = await response.json();
      setPayments(data.payments || []);
      setPagination(data.pagination || pagination);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error(error.message || 'خطا در دریافت داده‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage, fromDate, toDate]);

  const handleFilter = () => {
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            گزارش‌های پرداخت
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            مشاهده و مدیریت گزارش‌های پرداخت خود
          </p>
        </div>

        <PaymentFilters
          fromDate={fromDate}
          toDate={toDate}
          rowsPerPage={rowsPerPage}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onRowsPerPageChange={handleRowsPerPageChange}
          onFilter={handleFilter}
        />

        {loading ? (
          <LoadingState />
        ) : payments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <PaymentTable
              payments={payments}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
            />

            <div className="md:hidden space-y-3 mt-4">
              {payments.map((payment, index) => (
                <PaymentCard
                  key={payment.Id}
                  payment={payment}
                  index={index}
                  currentPage={currentPage}
                  rowsPerPage={rowsPerPage}
                />
            ))}
          </div>

            <PaymentPagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
