'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { LayoutDashboard, Users, Settings, FileText, Shield } from 'lucide-react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface Complex {
  id: number;
  name: string;
}

interface ComplexMenuItem {
  complex: Complex;
  isOpen: boolean;
  onToggle: () => void;
  sidebarOpen: boolean;
  isActive: (path: string) => boolean;
}

interface AdminSidebarProps {
  sidebarOpen: boolean;
  onToggle: () => void;
  menuItems: MenuItem[];
  complexes: Complex[];
  isActive: (path: string) => boolean;
  userName: string;
  userEmail: string;
}

function ComplexMenu({ complex, isOpen, onToggle, sidebarOpen, isActive }: ComplexMenuItem) {
  const submenuItems = [
    { title: 'کاربران', href: `/complexes/${complex.id}/users`, icon: Users },
    { title: 'گزارش‌ها', href: `/complexes/${complex.id}/reports`, icon: FileText },
  ];

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-blue-100 hover:bg-blue-700 hover:text-white ${
          isOpen ? 'bg-blue-700' : ''
        }`}
      >
        <Building2 size={20} className="shrink-0" />
        {sidebarOpen && (
          <>
            <span className="text-xs font-medium flex-1 text-right truncate">{complex.name}</span>
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </>
        )}
      </button>
      {isOpen && sidebarOpen && (
        <div className="mr-4 space-y-1">
          {submenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                  active
                    ? 'bg-white text-blue-900 shadow-md'
                    : 'text-blue-200 hover:bg-blue-700/50 hover:text-white'
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar({
  sidebarOpen,
  onToggle,
  menuItems,
  complexes,
  isActive,
  userName,
  userEmail,
}: AdminSidebarProps) {
  const [openComplexes, setOpenComplexes] = useState<Record<number, boolean>>({});

  const toggleComplex = (complexId: number) => {
    setOpenComplexes((prev) => ({
      ...prev,
      [complexId]: !prev[complexId],
    }));
  };

  return (
    <aside
      className={`hidden lg:block ${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-linear-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 ease-in-out fixed h-screen z-40 shadow-2xl`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-2xl font-bold text-white">پنل ادمین</h1>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-white text-blue-900 shadow-lg'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium">{item.title}</span>
                )}
              </Link>
            );
          })}

          {/* Complexes Section */}
          {sidebarOpen && complexes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-700">
              <div className="px-4 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                مجموعه‌ها
              </div>
              <div className="mt-2 space-y-1">
                {complexes.map((complex) => (
                  <ComplexMenu
                    key={complex.id}
                    complex={complex}
                    isOpen={openComplexes[complex.id] || false}
                    onToggle={() => toggleComplex(complex.id)}
                    sidebarOpen={sidebarOpen}
                    isActive={isActive}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-blue-700">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-700/50 ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white text-blue-900 flex items-center justify-center font-bold shrink-0">
              <Shield size={20} />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{'ادمین'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

