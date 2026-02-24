'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { toPersianNumber } from '../dashboard/utils/numberUtils';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  isActive: (path: string) => boolean;
  userName: string;
  userEmail: string;
  userPhone: string;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  menuItems,
  isActive,
  userName,
  userEmail,
  userPhone,
}: MobileDrawerProps) {
  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-linear-to-b from-blue-900 to-blue-800 text-white transition-transform duration-300 ease-in-out z-50 lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-blue-700">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">OTIS</h1>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-white text-blue-900 shadow-lg'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-blue-700">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-700/50">
              <div className="w-10 h-10 rounded-full bg-white text-blue-900 flex items-center justify-center font-bold shrink-0">
                {userName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{userName}</p>
                <p className="text-xs text-blue-200 truncate">
                  {userEmail || toPersianNumber(userPhone)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

