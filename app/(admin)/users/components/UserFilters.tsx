'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserFilters } from '../types';

interface UserFiltersProps {
  filters: UserFilters;
  onFilterChange: (filters: UserFilters) => void;
  onFilter: () => void;
  onClearFilters: () => void;
}

export default function UserFiltersComponent({
  filters,
  onFilterChange,
  onFilter,
  onClearFilters,
}: UserFiltersProps) {
  const handleInputChange = (field: keyof UserFilters, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            نام کاربری
          </label>
          <Input
            type="text"
            value={filters.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="جستجو بر اساس نام کاربری..."
            dir="rtl"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            شماره تماس
          </label>
          <Input
            type="text"
            value={filters.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="جستجو بر اساس شماره تماس..."
            dir="rtl"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            نام
          </label>
          <Input
            type="text"
            value={filters.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="جستجو بر اساس نام..."
            dir="rtl"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            وضعیت
          </label>
          <select
            value={filters.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            dir="rtl"
          >
            <option value="">همه</option>
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Button
          onClick={onFilter}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
        >
          <Search size={16} className="ml-2" />
          اعمال فیلتر
        </Button>
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="border-gray-300 text-sm sm:text-base"
        >
          <X size={16} className="ml-2" />
          پاک کردن فیلترها
        </Button>
      </div>
    </div>
  );
}




