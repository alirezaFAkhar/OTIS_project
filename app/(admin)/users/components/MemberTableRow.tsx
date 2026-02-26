'use client';

import { Member } from '../types';
import { toPersianNumber } from '@/app/(dashboard)/dashboard/utils/numberUtils';
import { formatNumber } from '../utils/formatters';

interface MemberTableRowProps {
  member: Member;
}

export default function MemberTableRow({ member }: MemberTableRowProps) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {toPersianNumber(member.username)}
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 font-mono">
        {member.password || '-'}
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {member.phone ? toPersianNumber(member.phone) : '-'}
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
        <span
          className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${
            member.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {member.isActive ? 'فعال' : 'غیرفعال'}
        </span>
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {member.name || '-'}
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {formatNumber(member.balanceAfterCharge)} تومان
      </td>
      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-800">
        {formatNumber(member.amount)} تومان
      </td>
    </tr>
  );
}




