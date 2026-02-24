'use client';

import PersianDatePicker from './PersianDatePicker';
import { ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PaymentFiltersProps {
  fromDate: string;
  toDate: string;
  rowsPerPage: number;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onRowsPerPageChange: (value: number) => void;
  onFilter: () => void;
  onClearFilters?: () => void;
  // Optional additional filters
  trackingNumber?: string;
  onTrackingNumberChange?: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
}

export default function PaymentFilters({
  fromDate,
  toDate,
  rowsPerPage,
  onFromDateChange,
  onToDateChange,
  onRowsPerPageChange,
  onFilter,
  onClearFilters,
  trackingNumber,
  onTrackingNumberChange,
  status,
  onStatusChange,
  statusOptions = [
    { value: '', label: 'همه' },
    { value: 'OK', label: 'موفق' },
    { value: 'NOK', label: 'ناموفق' },
    { value: 'Pending', label: 'در انتظار' },
  ],
}: PaymentFiltersProps) {
  const hasAdditionalFilters = trackingNumber !== undefined || status !== undefined;
  
  // Calculate grid columns based on available filters
  const gridCols = hasAdditionalFilters 
    ? 'sm:grid-cols-2 lg:grid-cols-5' 
    : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
        فیلترها
      </h3>
      <div className={`grid ${gridCols} gap-3 sm:gap-4 mb-4`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            از تاریخ
          </label>
          <PersianDatePicker
            value={fromDate}
            onChange={onFromDateChange}
            placeholder="از تاریخ"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تا تاریخ
          </label>
          <PersianDatePicker
            value={toDate}
            onChange={onToDateChange}
            placeholder="تا تاریخ"
          />
        </div>
        {trackingNumber !== undefined && onTrackingNumberChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              کد پیگیری
            </label>
            <Input
              type="text"
              value={trackingNumber}
              onChange={(e) => onTrackingNumberChange(e.target.value)}
              placeholder="جستجو بر اساس کد پیگیری..."
              dir="rtl"
              className="w-full"
            />
          </div>
        )}
        {status !== undefined && onStatusChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وضعیت
            </label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dir="rtl"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تعداد ردیف
          </label>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(parseInt(e.target.value))}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer hover:border-gray-400 transition-colors"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onFilter}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          اعمال فیلتر
        </Button>
        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="border-gray-300"
          >
            <X size={16} className="ml-2" />
            پاک کردن فیلترها
          </Button>
        )}
      </div>
    </div>
  );
}

