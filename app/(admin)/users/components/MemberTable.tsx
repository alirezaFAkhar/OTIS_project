'use client';

import { Member } from '../types';
import MemberTableRow from './MemberTableRow';

interface MemberTableProps {
  members: Member[];
}

export default function MemberTable({ members }: MemberTableProps) {
  return (
    <div className="hidden lg:block overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-blue-50 border-b-2 border-blue-200">
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  نام کاربری
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  رمز عبور
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  شماره تماس
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  وضعیت
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  نام
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  موجودی پس از شارژ
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                  مبلغ
                </th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                    هیچ کاربری یافت نشد
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <MemberTableRow key={member.id} member={member} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




