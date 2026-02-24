'use client';

import { Calendar, DollarSign, CreditCard } from 'lucide-react';
import { toPersianNumber, formatPersianNumber } from '../utils/numberUtils';

interface BatteryStatsCardsProps {
  lastChargeDate: string;
  lastChargeAmount: number;
  balanceAfterCharge: number;
}

/**
 * Component displaying top 3 statistics cards:
 * - Last charge date
 * - Last charge amount
 * - Balance after charge
 */
export default function BatteryStatsCards({
  lastChargeDate,
  lastChargeAmount,
  balanceAfterCharge,
}: BatteryStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* زمان آخرین شارژ */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-r-4 border-blue-500">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Calendar className="text-blue-600" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-600 text-xs sm:text-sm mb-1">زمان آخرین شارژ</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800 wrap-break-word">
              {toPersianNumber(lastChargeDate)}
            </p>
          </div>
        </div>
      </div>

      {/* مبلغ آخرین شارژ */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-r-4 border-green-500">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
            <DollarSign className="text-green-600" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-600 text-xs sm:text-sm mb-1">مبلغ آخرین شارژ</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              {formatPersianNumber(lastChargeAmount)}
              <span className="text-xs sm:text-sm text-gray-600 mr-1">تومان</span>
            </p>
          </div>
        </div>
      </div>

      {/* مانده اعتبار بعد از شارژ */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-r-4 border-purple-500 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
            <CreditCard className="text-purple-600" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-600 text-xs sm:text-sm mb-1">مانده اعتبار بعد از شارژ</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              {formatPersianNumber(balanceAfterCharge)}
              <span className="text-xs sm:text-sm text-gray-600 mr-1">تومان</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

