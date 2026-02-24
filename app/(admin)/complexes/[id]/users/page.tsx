'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useComplexMembers } from './hooks/useComplexMembers';
import UserFilters from '@/app/(admin)/users/components/UserFilters';
import MemberTable from '@/app/(admin)/users/components/MemberTable';
import MemberCardList from '@/app/(admin)/users/components/MemberCardList';
import Pagination from '@/app/(admin)/users/components/Pagination';
import LoadingState from '@/app/(admin)/users/components/LoadingState';
import ErrorState from '@/app/(admin)/users/components/ErrorState';

export default function ComplexUsersPage() {
  const params = useParams();
  const complexId = parseInt(params.id as string);
  const [complexName, setComplexName] = useState<string>('');

  const {
    members,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    handleFilter,
    handleClearFilters,
    handlePageChange,
  } = useComplexMembers(complexId);

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
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            کاربران مجموعه
          </h1>
          {complexName && (
            <p className="text-sm sm:text-base text-gray-600">
              مجموعه: <span className="font-semibold">{complexName}</span>
            </p>
          )}
        </div>

        <UserFilters
          filters={filters}
          onFilterChange={setFilters}
          onFilter={handleFilter}
          onClearFilters={handleClearFilters}
        />

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <>
            <MemberTable members={members} />
            <MemberCardList members={members} />
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}

