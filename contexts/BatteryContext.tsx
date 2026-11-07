'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface TariffData {
  name: string;
  readingAtLastCharge: number;
  lastReading: number;
  consumption: number;
  amount?: number;
}

interface BatteryData {
  lastChargeDate: string;
  lastChargeAmount: number;
  balanceAfterCharge: number;
  currentBalance: number;
  maxCapacity: number;
  // Member info
  memberName: string;
  memberPhone: string;
  memberSerialNumber: string;
  memberPartNumber: string;
  complexName: string;
  adr: string;
  // Additional data
  totalCharge: number;
  lastReadDate: string;
  voltage: number;
  amper: number;
  isActive: boolean;
  tariffs: TariffData[];
}

interface BatteryContextType {
  batteryData: BatteryData | null;
  loading: boolean;
  error: string | null;
  fetchBatteryData: () => Promise<void>;
  refreshBatteryData: () => Promise<void>;
}

const BatteryContext = createContext<BatteryContextType | undefined>(undefined);

export function BatteryProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [batteryData, setBatteryData] = useState<BatteryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatteryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/battery/data', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Stale/invalid token: clear it server-side and send the user back to login
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
          router.replace('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در دریافت اطلاعات');
      }

      const data = await response.json();
      setBatteryData(data);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت اطلاعات باتری');
      console.error('Error fetching battery data:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refreshBatteryData = useCallback(async () => {
    await fetchBatteryData();
  }, [fetchBatteryData]);

  // Fetch data on mount
  useEffect(() => {
    fetchBatteryData();
  }, [fetchBatteryData]);

  return (
    <BatteryContext.Provider
      value={{
        batteryData,
        loading,
        error,
        fetchBatteryData,
        refreshBatteryData,
      }}
    >
      {children}
    </BatteryContext.Provider>
  );
}

export function useBattery() {
  const context = useContext(BatteryContext);
  if (context === undefined) {
    throw new Error('useBattery must be used within a BatteryProvider');
  }
  return context;
}

