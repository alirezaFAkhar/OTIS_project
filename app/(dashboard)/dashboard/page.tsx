'use client';

import { useBattery } from '@/contexts/BatteryContext';
import BatteryStatsCards from './components/BatteryStatsCards';
import BatteryVisualization from './components/BatteryVisualization';
import BalanceBox from './components/BalanceBox';
import MoreDetailsSection from './components/MoreDetailsSection';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

/**
 * Default/fallback data structure for development and testing
 */
const DEFAULT_BATTERY_DATA = {
  lastChargeDate: '1403/09/15 - 14:30',
  lastChargeAmount: 500000,
  balanceAfterCharge: 2000000,
  currentBalance: 360000,
  maxCapacity: 2000000,
  memberName: '',
  memberPhone: '',
  memberSerialNumber: '',
  totalCharge: 0,
  lastReadDate: '',
  voltage: 0,
  amper: 0,
  tariffs: [],
};

/**
 * Main Dashboard Page Component
 * 
 * Displays battery information including:
 * - Statistics cards (last charge date, amount, balance)
 * - Visual battery representation with segments
 * - Current balance indicator
 * - Additional details (collapsible)
 */
export default function DashboardPage() {
  const { batteryData, loading, error, refreshBatteryData } = useBattery();

  // Use battery data or fallback to default data
  const data = batteryData || DEFAULT_BATTERY_DATA;

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={refreshBatteryData} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 max-w-full box-border">
      {/* Top Statistics Cards */}
      <BatteryStatsCards
        lastChargeDate={data.lastChargeDate}
        lastChargeAmount={data.lastChargeAmount}
        balanceAfterCharge={data.balanceAfterCharge}
      />

      {/* Battery Visualization Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 overflow-hidden max-w-full box-border">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-16 relative">
          {/* Segmented Battery Visualization */}
          <div className="shrink-0">
            <BatteryVisualization data={data} />
          </div>

          {/* Balance Box with Arrow */}
          <div className="shrink-0 w-full h-full lg:w-auto lg:h-auto min-h-[180px] lg:min-h-0">
            <BalanceBox data={data} />
          </div>
        </div>
      </div>

      {/* More Details Section (Collapsible) */}
      <MoreDetailsSection
        data={{
          totalCharge: data.totalCharge,
          lastReadDate: data.lastReadDate,
          voltage: data.voltage,
          amper: data.amper,
          tariffs: data.tariffs,
        }}
      />
    </div>
  );
}
