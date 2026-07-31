'use client';

import { Payment } from '../types';
import { toPersianNumber } from '@/app/(dashboard)/dashboard/utils/numberUtils';
import { formatNumber, formatDate } from '../utils/formatters';
import PaymentStatusBadge from './PaymentStatusBadge';

interface PaymentTableRowProps {
  payment: Payment;
  complexName: string;
}

export default function PaymentTableRow({ payment, complexName }: PaymentTableRowProps) {
  const memberName = payment.MemberName?.trim();
  const memberUsername = payment.MemberUsername?.trim();
  const memberPhone = payment.MemberPhone?.trim();

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {toPersianNumber(payment.Id.toString())}
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        <div className="flex  flex-col-reverse justify-between items-start gap-3">
          {(memberUsername || memberPhone) && (
            <div className="flex flex-col gap-1 shrink-0 text-end text-xs text-gray-500" dir="ltr">
              {memberUsername ? (
                <div className="">{toPersianNumber(memberUsername)}</div>
              ) : null}
              {memberPhone ? (
                <div className="">{toPersianNumber(memberPhone)}</div>
              ) : null}
            </div>
          )}
          {memberName ? (
            <div
              className={`text-gray-700 ${memberUsername || memberPhone ? 'flex-1 text-right min-w-0' : 'w-full text-right'}`}
            >
              {memberName}
            </div>
          ) : !(memberUsername || memberPhone) ? (
            <span className="text-gray-400">—</span>
          ) : null}
        </div>
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {complexName}
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
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
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
















