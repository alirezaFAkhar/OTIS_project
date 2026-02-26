'use client';

import { Payment } from '../types';
import { toPersianNumber } from '@/app/(dashboard)/dashboard/utils/numberUtils';
import { formatNumber, formatDate } from '../utils/formatters';
import PaymentStatusBadge from './PaymentStatusBadge';

interface PaymentCardProps {
  payment: Payment;
}

export default function PaymentCard({ payment }: PaymentCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <span className="text-xs text-gray-500">شناسه</span>
        <span className="text-sm font-semibold text-gray-800">
          {toPersianNumber(payment.Id.toString())}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs text-gray-500 block mb-1">شناسه کاربر</span>
          <span className="text-sm text-gray-800">
            {payment.MemberId ? toPersianNumber(payment.MemberId.toString()) : '-'}
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">نوع پرداخت</span>
          <span className="text-sm text-gray-800">{payment.PayType || '-'}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">تاریخ پرداخت</span>
          <span className="text-sm text-gray-800">{formatDate(payment.PayDate)}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">تاریخ ثبت</span>
          <span className="text-sm text-gray-800">{formatDate(payment.AddDate)}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">کد پیگیری</span>
          <span className="text-sm text-gray-800 font-mono">
            {payment.TrackingNumber ? toPersianNumber(payment.TrackingNumber) : '-'}
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">وضعیت</span>
          <PaymentStatusBadge status={payment.Status} size="sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
        <div>
          <span className="text-xs text-gray-500 block mb-1">مبلغ</span>
          <span className="text-sm font-semibold text-gray-800">
            {formatNumber(payment.Amount)} تومان
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">موجودی</span>
          <span className="text-sm font-semibold text-gray-800">
            {formatNumber(payment.Credit)} تومان
          </span>
        </div>
      </div>
    </div>
  );
}




