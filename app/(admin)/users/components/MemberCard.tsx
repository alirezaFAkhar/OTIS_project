'use client';

import { Member } from '../types';
import { toPersianNumber } from '@/app/(dashboard)/dashboard/utils/numberUtils';
import { formatNumber } from '../utils/formatters';

interface MemberCardProps {
  member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <span className="text-xs text-gray-500">نام کاربری</span>
        <span className="text-sm font-semibold text-gray-800">
          {toPersianNumber(member.username)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs text-gray-500 block mb-1">شماره تماس</span>
          <span className="text-sm text-gray-800">
            {member.phone ? toPersianNumber(member.phone) : '-'}
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">نام</span>
          <span className="text-sm text-gray-800">{member.name || '-'}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">رمز عبور</span>
          <span className="text-sm text-gray-600 font-mono">
            {member.password || '-'}
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">وضعیت</span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              member.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {member.isActive ? 'فعال' : 'غیرفعال'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
        <div>
          <span className="text-xs text-gray-500 block mb-1">موجودی پس از شارژ</span>
          <span className="text-sm font-semibold text-gray-800">
            {formatNumber(member.balanceAfterCharge)} تومان
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-1">مبلغ</span>
          <span className="text-sm font-semibold text-gray-800">
            {formatNumber(member.amount)} تومان
          </span>
        </div>
      </div>
    </div>
  );
}




