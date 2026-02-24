'use client';

import { toPersianNumber } from '../../dashboard/utils/numberUtils';
import StatusBadge from './StatusBadge';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Payment } from '../types';

interface PaymentTableProps {
  payments: Payment[];
  currentPage: number;
  rowsPerPage: number;
}

export default function PaymentTable({
  payments,
  currentPage,
  rowsPerPage,
}: PaymentTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
              ردیف
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
              تاریخ
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
              نوع شارژ
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
              شماره پیگیری
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
              مبلغ
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
              مانده اعتبار
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
              وضعیت پرداخت
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr
              key={payment.Id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm text-gray-700">
                {toPersianNumber((currentPage - 1) * rowsPerPage + index + 1)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {formatDate(payment.PayDate || payment.AddDate)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {payment.PayType || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {toPersianNumber(Number(payment.TrackingNumber)) || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                {formatCurrency(payment.Amount)} تومان
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                {formatCurrency(payment.Credit)} تومان
              </td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge status={payment.Status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

