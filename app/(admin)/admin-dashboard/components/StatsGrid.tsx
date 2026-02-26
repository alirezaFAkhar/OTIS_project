'use client';

import { StatCard as StatCardType } from '../types';
import StatCard from './StatCard';

interface StatsGridProps {
  stats: StatCardType[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
}




