'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { LayoutDashboard, FileText, CreditCard, Key } from 'lucide-react';
import { BatteryProvider, useBattery } from '@/contexts/BatteryContext';
import Sidebar from './components/Sidebar';
import MobileDrawer from './components/MobileDrawer';
import Header from './components/Header';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { batteryData } = useBattery();

  // Get user data from battery context
  const user = {
    name: batteryData?.memberName || 'کاربر',
    email: '',
    phone: batteryData?.memberPhone || '-',
    address: batteryData?.complexName,
    adr: batteryData?.adr,
    balance: batteryData?.currentBalance ? batteryData.currentBalance.toLocaleString('fa-IR') : '-',
    serialNumber: batteryData?.memberSerialNumber || '',
  };

  const handleLogout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    toast.success('با موفقیت خارج شدید');
    router.push('/login');
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    {
      title: 'صفحه اصلی',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'گزارش‌ شارژ',
      href: '/reports',
      icon: FileText,
    },
    {
      title: 'شارژ حساب',
      href: '/charge',
      icon: CreditCard,
    },
    {
      title: 'تغییر رمز کاربری',
      href: '/change-password',
      icon: Key,
    },
  ];

  const currentDate = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        menuItems={menuItems}
        isActive={isActive}
        userName={user.name}
        userEmail={user.email}
        userPhone={user.phone}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        menuItems={menuItems}
        isActive={isActive}
        userName={user.name}
        userEmail={user.email}
        userPhone={user.phone}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:mr-64' : 'lg:mr-20'
        }`}
      >
        {/* Header */}
        <Header
          onMobileMenuClick={() => setMobileDrawerOpen(true)}
          user={user}
          batteryData={batteryData}
          currentDate={currentDate}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="p-3 sm:p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BatteryProvider>
      <DashboardContent>{children}</DashboardContent>
    </BatteryProvider>
  );
}
