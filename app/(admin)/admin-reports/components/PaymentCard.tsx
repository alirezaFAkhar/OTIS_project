'use client';

import { Payment } from '../types';
import { toPersianNumber } from '@/app/(dashboard)/dashboard/utils/numberUtils';
import { formatNumber, formatDate } from '../utils/formatters';
import PaymentStatusBadge from './PaymentStatusBadge';

interface PaymentCardProps {
  payment: Payment;
}

export default function PaymentCard({ payment }: PaymentCardProps) {
  const memberName = payment.MemberName?.trim();
  const memberUsername = payment.MemberUsername?.trim();
  const memberPhone = payment.MemberPhone?.trim();

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
          <span className="text-xs text-gray-500 block mb-1">کاربر</span>
          <div className="flex justify-between items-start gap-3 w-full">
            {(memberUsername || memberPhone) && (
              <div className="flex flex-col gap-1 shrink-0 text-end" dir="ltr">
                {memberUsername ? (
                  <div className="text-xs text-gray-500">{toPersianNumber(memberUsername.toString())}</div>
                ) : null}
                {memberPhone ? (
                  <div className="text-xs text-gray-500">
                    {toPersianNumber(memberPhone)}
                  </div>
                ) : null}
              </div>
            )}
            {memberName ? (
              <div
                className={`text-xs text-gray-700 min-w-0 text-right ${
                  memberUsername || memberPhone ? 'flex-1' : 'w-full'
                }`}
              >
                {memberName}
              </div>
            ) : !(memberUsername || memberPhone) ? (
              <span className="text-xs text-gray-400">—</span>
            ) : null}
          </div>
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
          <span className="text-sm text-gray-800">
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
















