'use client';

import { toPersianNumber } from '../../dashboard/utils/numberUtils';
import StatusBadge from './StatusBadge';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Payment } from '../types';

interface PaymentCardProps {
  payment: Payment;
  index: number;
  currentPage: number;
  rowsPerPage: number;
}

export default function PaymentCard({
  payment,
  index,
  currentPage,
  rowsPerPage,
}: PaymentCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">ردیف:</span>
          <span className="text-sm font-medium text-gray-700">
            {toPersianNumber((currentPage - 1) * rowsPerPage + index + 1)}
          </span>
        </div>
        <StatusBadge status={payment.Status} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-xs text-gray-500">تاریخ:</span>
          <span className="text-sm text-gray-700 font-medium">
            {formatDate(payment.PayDate || payment.AddDate)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-xs text-gray-500">نوع شارژ:</span>
          <span className="text-sm text-gray-700">{payment.PayType || '-'}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-xs text-gray-500">شماره پیگیری:</span>
          <span className="text-sm text-gray-700 font-medium">
            {toPersianNumber(Number(payment.TrackingNumber)) || '-'}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-xs text-gray-500">مبلغ:</span>
          <span className="text-sm font-semibold text-blue-600">
            {formatCurrency(payment.Amount)} تومان
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-xs text-gray-500">مانده اعتبار:</span>
          <span className="text-sm text-gray-700 font-semibold">
            {formatCurrency(payment.Credit)} تومان
          </span>
        </div>
      </div>
    </div>
  );
}

