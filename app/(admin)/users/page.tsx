'use client';

import { useMembers } from './hooks/useMembers';
import UserFilters from './components/UserFilters';
import MemberTable from './components/MemberTable';
import MemberCardList from './components/MemberCardList';
import Pagination from './components/Pagination';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

export default function UsersPage() {
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
  } = useMembers();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          مدیریت کاربران
        </h1>

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

