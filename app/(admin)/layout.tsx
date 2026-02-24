'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { LayoutDashboard, Users, FileText } from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';
import AdminMobileDrawer from './components/AdminMobileDrawer';
import AdminHeader from './components/AdminHeader';

interface Complex {
  id: number;
  name: string;
}

function AdminContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [adminData, setAdminData] = useState<{
    username: string;
    email?: string;
  } | null>(null);
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token and load complexes
    Promise.all([
      fetch('/api/auth/verify').then(res => res.json()),
      fetch('/api/admin/complexes').then(res => res.json()),
    ])
      .then(([authData, complexesData]) => {
        if (authData.valid && authData.user && authData.role === 'admin') {
          setAdminData({
            username: authData.user.username,
            email: authData.user.email,
          });
          if (complexesData.complexes) {
            setComplexes(complexesData.complexes);
          }
        } else {
          toast.error('لطفا ابتدا وارد شوید');
          router.push('/login');
        }
      })
      .catch(err => {
        console.error('Error loading admin data:', err);
        toast.error('خطا در بارگذاری اطلاعات');
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

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
      href: '/admin-dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'مدیریت کاربران',
      href: '/users',
      icon: Users,
    },
    {
      title: 'گزارش‌ها',
      href: '/admin-reports',
      icon: FileText,
    },
  ];

  const currentDate = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        menuItems={menuItems}
        complexes={complexes}
        isActive={isActive}
        userName={adminData.username}
        userEmail={adminData.email || ''}
      />

      {/* Mobile Drawer */}
      <AdminMobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        menuItems={menuItems}
        complexes={complexes}
        isActive={isActive}
        userName={adminData.username}
        userEmail={adminData.email || ''}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:mr-64' : 'lg:mr-20'
        }`}
      >
        {/* Header */}
        <AdminHeader
          onMobileMenuClick={() => setMobileDrawerOpen(true)}
          adminName={adminData.username}
          adminEmail={adminData.email}
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminContent>{children}</AdminContent>;
}

