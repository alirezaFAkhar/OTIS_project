'use client';

import { Menu, Calendar, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  onMobileMenuClick: () => void;
  adminName: string;
  adminEmail?: string;
  currentDate: string;
  onLogout: () => void;
}

export default function AdminHeader({
  onMobileMenuClick,
  adminName,
  adminEmail,
  currentDate,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Right Side - Mobile Menu Button & Admin Info */}
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
                {'ا'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg truncate">
                  {'ادمین'}
                </h2>
                {adminEmail && (
                  <div className="text-xs sm:text-sm text-gray-600">
                    <span className="truncate">{adminEmail}</span>
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
      </div>
    </header>
  );
}

