import { StatCard } from '../types';

export const defaultStats: StatCard[] = [
  {
    title: 'کل کاربران',
    value: '-',
    icon: 'Users',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'کاربران غیرفعال',
    value: '-',
    icon: 'AlertCircle',
    bgColor: 'bg-red-100',
    valueColor: 'text-red-600',
  },
  {
    title: 'تراکنش‌های امروز',
    value: '-',
    icon: 'CreditCard',
    bgColor: 'bg-green-100',
  },
  {
    title: 'تعداد مجموعه‌ها',
    value: '-',
    icon: 'Building2',
    bgColor: 'bg-purple-100',
  },
];

