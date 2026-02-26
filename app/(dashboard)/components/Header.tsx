'use client';

import Link from 'next/link';
import { Menu, MapPin, Calendar, LogOut, CreditCard } from 'lucide-react';
import { toPersianNumber } from '../dashboard/utils/numberUtils';

interface UserData {
  name: string;
  address?: string;
  adr?: string;
  phone?: string;
  serialNumber?: string;
  balance: string;
}

interface HeaderProps {
  onMobileMenuClick: () => void;
  user: UserData;
  batteryData?: {
    isActive?: boolean;
  } | null;
  currentDate: string;
  onLogout: () => void;
}

export default function Header({
  onMobileMenuClick,
  user,
  batteryData,
  currentDate,
  onLogout,
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Right Side - Mobile Menu Button & User Info */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={onMobileMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            >
              <Menu size={24} className="text-gray-600" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg shadow-md shrink-0">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg truncate">
                  {user.name || 'کاربر'}
                </h2>
                {(user.address || user.adr) && (
                  <div className="flex flex-col gap-1">
                    {user.address && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <MapPin size={12} className="sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span className="truncate">{user.address}</span>
                      </div>
                    )}
                    {user.adr && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <MapPin size={12} className="sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span className="truncate">{user.adr}</span>
                      </div>
                    )}
                  </div>
                )}
                {user.serialNumber && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 mr-1">
                    <span className="truncate"> کد شناسایی:{toPersianNumber(user.serialNumber)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center - Date */}
          <div className="hidden md:flex items-center gap-2 text-gray-600 ml-2">
            <Calendar size={18} />
            <span className="text-sm font-medium">{currentDate}</span>
          </div>

          {/* Left Side - Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Charge Account Button */}
            <Link
              href="/charge"
              className="flex bg-blue-500 items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span className="block text-sm font-medium text-white">
                شارژ حساب
              </span>
            </Link>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden md:block text-sm font-medium">خروج</span>
            </button>
          </div>
        </div>

        {/* Additional Info Bar */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex items-center gap-2 sm:gap-4 lg:gap-6 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                batteryData?.isActive ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              وضعیت: {batteryData?.isActive ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CreditCard size={12} className="sm:w-4 sm:h-4 text-gray-400 shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">
              موجودی: <span className="font-bold text-green-600">{user.balance || '0'}</span> تومان
            </span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600">
                شماره تماس: <span className="font-medium">{toPersianNumber(user.phone)}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

