import { useState, useEffect } from 'react';
import { Member, Pagination, UserFilters } from '../types';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    username: '',
    phone: '',
    name: '',
    isActive: '',
  });

  const fetchMembers = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.username) params.append('username', filters.username);
      if (filters.phone) params.append('phone', filters.phone);
      if (filters.name) params.append('name', filters.name);
      if (filters.isActive) params.append('isActive', filters.isActive);

      const response = await fetch(`/api/admin/members?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMembers(data.members || []);
        setPagination(data.pagination || pagination);
      }
    } catch (err: any) {
      setError('خطا در دریافت اطلاعات');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchMembers(1);
  };

  const handleClearFilters = () => {
    const emptyFilters: UserFilters = {
      username: '',
      phone: '',
      name: '',
      isActive: '',
    };
    setFilters(emptyFilters);
    fetchMembers(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMembers(newPage);
    }
  };

  useEffect(() => {
    fetchMembers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    members,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    handleFilter,
    handleClearFilters,
    handlePageChange,
    fetchMembers,
  };
}

