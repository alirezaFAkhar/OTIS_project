'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatPersianNumber, toPersianNumber } from '../utils/numberUtils';
import TariffTable from './TariffTable';

interface MoreDetailsData {
  totalCharge: number;
  lastReadDate: string;
  voltage: number;
  amper: number;
  tariffs: Array<{
    name: string;
    readingAtLastCharge: number;
    lastReading: number;
    consumption: number;
  }>;
}

interface MoreDetailsSectionProps {
  data: MoreDetailsData;
}

/**
 * Collapsible section displaying additional battery and meter information
 */
export default function MoreDetailsSection({ data }: MoreDetailsSectionProps) {
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-6 w-full max-w-full box-border overflow-hidden">
      <button
        onClick={() => setShowMoreDetails(!showMoreDetails)}
        className="w-full flex items-center justify-between p-2 sm:p-4 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <h3 className="text-base sm:text-xl font-bold text-gray-800">مشاهده بیشتر</h3>
        {showMoreDetails ? (
          <ChevronUp className="text-gray-600 shrink-0" size={20} />
        ) : (
          <ChevronDown className="text-gray-600 shrink-0" size={20} />
        )}
      </button>

      {showMoreDetails && data && (
        <div className="mt-3 sm:mt-6 space-y-3 sm:space-y-6 w-full max-w-full box-border overflow-hidden">
          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 w-full max-w-full">
            <div className="bg-blue-50 rounded-lg p-2.5 sm:p-4 border-r-4 border-blue-500 w-full min-w-0 box-border overflow-hidden">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">کل اعتبار از ابتدا</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {data.totalCharge ? formatPersianNumber(data.totalCharge) : '0'}
                <span className="text-xs sm:text-sm text-gray-600 mr-1">تومان</span>
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-2.5 sm:p-4 border-r-4 border-green-500 w-full min-w-0 box-border overflow-hidden">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">زمان آخرین قرائت</p>
              <p className="text-sm sm:text-lg font-bold text-gray-800">
                {data.lastReadDate ? toPersianNumber(data.lastReadDate) : '-'}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-2.5 sm:p-4 border-r-4 border-orange-500 w-full min-w-0 box-border overflow-hidden">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">ولتاژ</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {data.voltage ? data.voltage.toFixed(1) : '0'}
                <span className="text-xs sm:text-sm text-gray-600 mr-1">V</span>
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-2.5 sm:p-4 border-r-4 border-purple-500 w-full min-w-0 box-border overflow-hidden">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">جریان</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {data.amper ? data.amper.toFixed(1) : '0'}
                <span className="text-xs sm:text-sm text-gray-600 mr-1">A</span>
              </p>
            </div>
          </div>

          {/* Tariff Table */}
          <div 
            className="w-full max-w-full box-border overflow-hidden" 
            style={{ 
              maxWidth: '100%',
              contain: 'layout',
              isolation: 'isolate'
            }}
          >
            <div 
              className="overflow-x-auto w-full" 
              style={{ 
                maxWidth: '100%',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="w-full min-w-0" style={{ maxWidth: '100%' }}>
                <TariffTable tariffs={data.tariffs} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

