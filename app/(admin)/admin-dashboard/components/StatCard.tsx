'use client';

import { StatCard as StatCardType } from '../types';
import { Users, AlertCircle, CreditCard, Building2 } from 'lucide-react';

interface StatCardProps {
  stat: StatCardType;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'Users': Users,
  'AlertCircle': AlertCircle,
  'CreditCard': CreditCard,
  'Building2': Building2,
};

export default function StatCard({ stat }: StatCardProps) {
  const IconComponent = stat.icon && iconMap[stat.icon] ? iconMap[stat.icon] : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
          <p
            className={`text-xl sm:text-2xl font-bold truncate ${
              stat.valueColor || 'text-gray-800'
            }`}
          >
            {stat.value}
          </p>
        </div>
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center shrink-0 mr-3`}
        >
          {IconComponent ? (
            <IconComponent size={24} className={stat.valueColor || 'text-gray-700'} />
          ) : (
            <span className="text-xl sm:text-2xl">{stat.icon}</span>
          )}
        </div>
      </div>
    </div>
  );
}

