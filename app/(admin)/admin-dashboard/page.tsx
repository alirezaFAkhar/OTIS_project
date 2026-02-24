'use client';

import { useState, useEffect } from 'react';
import WelcomeCard from './components/WelcomeCard';
import StatsGrid from './components/StatsGrid';
import { defaultStats } from './data/stats';
import { StatCard } from './types';
import PaymentTable from '@/app/(admin)/admin-reports/components/PaymentTable';
import PaymentCardList from '@/app/(admin)/admin-reports/components/PaymentCardList';
import { Payment } from '@/app/(admin)/admin-reports/types';
import LoadingState from '@/app/(admin)/admin-reports/components/LoadingState';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatCard[]>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [todayPayments, setTodayPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();

        if (data.error) {
          console.error('Error fetching stats:', data.error);
          setStats(defaultStats);
        } else {
          setStats([
            {
              title: 'کل کاربران',
              value: data.totalMembers?.toLocaleString('fa-IR') || '0',
              icon: 'Users',
              bgColor: 'bg-blue-100',
            },
            {
              title: 'کاربران غیرفعال',
              value: data.inactiveMembers?.toLocaleString('fa-IR') || '0',
              icon: 'AlertCircle',
              bgColor: 'bg-red-100',
              valueColor: 'text-red-600',
            },
            {
              title: 'تراکنش‌های امروز',
              value: data.todayPaymentsCount?.toLocaleString('fa-IR') || '0',
              icon: 'CreditCard',
              bgColor: 'bg-green-100',
            },
            {
              title: 'تعداد مجموعه‌ها',
              value: data.totalComplexes?.toLocaleString('fa-IR') || '0',
              icon: 'Building2',
              bgColor: 'bg-purple-100',
            },
          ]);
        }
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    };

    const fetchTodayPayments = async () => {
      try {
        const response = await fetch('/api/admin/payments/today');
        const data = await response.json();

        if (data.error) {
          console.error('Error fetching today payments:', data.error);
          setTodayPayments([]);
        } else {
          setTodayPayments(data.payments || []);
        }
      } catch (err: any) {
        console.error('Error fetching today payments:', err);
        setTodayPayments([]);
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchStats();
    fetchTodayPayments();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <WelcomeCard />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {defaultStats.map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 animate-pulse"
            >
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <StatsGrid stats={stats} />
      )}

      {/* Today's Payments Table */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          تراکنش‌های امروز
        </h2>
        {paymentsLoading ? (
          <LoadingState />
        ) : todayPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            هیچ تراکنشی برای امروز ثبت نشده است
          </div>
        ) : (
          <>
            <PaymentTable payments={todayPayments} />
            <PaymentCardList payments={todayPayments} />
          </>
        )}
      </div>
    </div>
  );
}

