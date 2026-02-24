import { useState, useEffect } from 'react';
import { Payment, Pagination, PaymentFilters } from '@/app/(admin)/admin-reports/types';

export function useComplexPayments(complexId: number) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>({
    fromDate: '',
    toDate: '',
    trackingNumber: '',
    status: '',
  });

  const fetchPayments = async (page: number = pagination.page) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        complexId: complexId.toString(),
      });

      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.trackingNumber) params.append('trackingNumber', filters.trackingNumber);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/admin/payments?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setPayments(data.payments || []);
        setPagination((prev) => ({
          ...prev,
          ...data.pagination,
        }));
      }
    } catch (err: any) {
      setError('خطا در دریافت اطلاعات');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchPayments(1);
  };

  const handleClearFilters = () => {
    const emptyFilters: PaymentFilters = {
      fromDate: '',
      toDate: '',
      trackingNumber: '',
      status: '',
    };
    setFilters(emptyFilters);
    fetchPayments(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPayments(newPage);
    }
  };

  const handleRowsPerPageChange = (value: number) => {
    setPagination((prev) => ({ ...prev, limit: value, page: 1 }));
  };

  useEffect(() => {
    if (complexId) {
      fetchPayments(pagination.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complexId, pagination.limit]);

  useEffect(() => {
    if (complexId) {
      fetchPayments(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.fromDate, filters.toDate, filters.trackingNumber, filters.status]);

  return {
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
  };
}

