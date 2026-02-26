'use client';

import { Payment } from '../types';
import PaymentTableRow from './PaymentTableRow';

interface PaymentTableProps {
  payments: Payment[];
}

export default function PaymentTable({ payments }: PaymentTableProps) {
  return (
    <div className="hidden lg:block overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-blue-50 border-b-2 border-blue-200">
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  شناسه
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  شناسه کاربر
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  تاریخ پرداخت
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  تاریخ ثبت
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  نوع پرداخت
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  کد پیگیری
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  مبلغ
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  موجودی
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  وضعیت
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500 text-sm">
                    هیچ پرداختی یافت نشد
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <PaymentTableRow key={payment.Id} payment={payment} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




