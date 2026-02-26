'use client';

import { Payment } from '../types';
import { toPersianNumber } from '@/app/(dashboard)/dashboard/utils/numberUtils';
import { formatNumber, formatDate } from '../utils/formatters';
import PaymentStatusBadge from './PaymentStatusBadge';

interface PaymentTableRowProps {
  payment: Payment;
}

export default function PaymentTableRow({ payment }: PaymentTableRowProps) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {toPersianNumber(payment.Id.toString())}
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {payment.MemberId ? toPersianNumber(payment.MemberId.toString()) : '-'}
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {formatDate(payment.PayDate)}
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {formatDate(payment.AddDate)}
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {payment.PayType || '-'}
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800 font-mono">
        {payment.TrackingNumber ? toPersianNumber(payment.TrackingNumber) : '-'}
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {formatNumber(payment.Amount)} تومان
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {formatNumber(payment.Credit)} تومان
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
        <PaymentStatusBadge status={payment.Status} />
      </td>
    </tr>
  );
}




