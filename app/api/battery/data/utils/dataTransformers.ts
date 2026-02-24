/**
 * Transform member data from database to battery data format
 */

export interface BatteryDataResponse {
  lastChargeDate: string;
  lastChargeAmount: number;
  balanceAfterCharge: number;
  currentBalance: number;
  maxCapacity: number;
  memberName: string;
  memberPhone: string;
  memberSerialNumber: string;
  complexName: string;
  totalCharge: number;
  lastReadDate: string;
  voltage: number;
  amper: number;
  isActive: boolean;
  tariffs: Array<{
    name: string;
    readingAtLastCharge: number;
    lastReading: number;
    consumption: number;
  }>;
}

/**
 * Parse numeric value from database
 */
function parseFloatSafe(value: any, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Format date to Persian locale
 */
function formatDate(date: any): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('fa-IR');
  } catch {
    return '';
  }
}

/**
 * Format datetime to Persian locale
 */
function formatDateTime(date: any): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString('fa-IR');
  } catch {
    return '';
  }
}

/**
 * Calculate tariff consumption data
 */
function calculateTariffData(member: any) {
  // Get tariff readings (P1, P2, P3, P4)
  const p1 = parseFloatSafe(member.P1); // باری (تعرفه 1)
  const p2 = parseFloatSafe(member.P2); // اوج بار (تعرفه 2)
  const p3 = parseFloatSafe(member.P3); // کم باری (تعرفه 3)
  const p4 = parseFloatSafe(member.P4); // انرژی راکتیو

  // For now, use current readings as last charge readings
  // TODO: If you have historical data, get readings at LastChargeDate
  const p1AtLastCharge = p1;
  const p2AtLastCharge = p2;
  const p3AtLastCharge = p3;
  const p4AtLastCharge = p4;

  // Last meter readings (current readings)
  const p1LastReading = p1;
  const p2LastReading = p2;
  const p3LastReading = p3;
  const p4LastReading = p4;

  // Calculate consumption (difference)
  const p1Consumption = p1LastReading - p1AtLastCharge;
  const p2Consumption = p2LastReading - p2AtLastCharge;
  const p3Consumption = p3LastReading - p3AtLastCharge;
  const p4Consumption = p4LastReading - p4AtLastCharge;

  return [
    {
      name: 'باری (تعرفه ۱)',
      readingAtLastCharge: p1AtLastCharge,
      lastReading: p1LastReading,
      consumption: p1Consumption,
    },
    {
      name: 'اوج بار (تعرفه ۲)',
      readingAtLastCharge: p2AtLastCharge,
      lastReading: p2LastReading,
      consumption: p2Consumption,
    },
    {
      name: 'کم باری (تعرفه ۳)',
      readingAtLastCharge: p3AtLastCharge,
      lastReading: p3LastReading,
      consumption: p3Consumption,
    },
    {
      name: 'انرژی راکتیو',
      readingAtLastCharge: p4AtLastCharge,
      lastReading: p4LastReading,
      consumption: p4Consumption,
    },
  ];
}

/**
 * Get safe column name from environment variable
 */
function safeColumnName(value: string | undefined, fallback: string): string {
  return value && value.trim() ? value.trim() : fallback;
}

/**
 * Transform member database record to battery data response
 */
export function transformMemberToBatteryData(member: any, complexName: string = ''): BatteryDataResponse {
  // Get column name for IsActive from environment variable
  const isActiveColumn = safeColumnName(process.env.MEMBERS_ACTIVE_COLUMN, 'IsActive');
  
  // Calculate battery data from Member table
  const lastChargeAmount = parseFloatSafe(member.LastCharge);
  const lastChargeDate = formatDate(member.LastChargeDate);
  const currentBalance = parseFloatSafe(member.CurrRemainCharge);
  const balanceAfterCharge = lastChargeAmount; // After charge, balance equals charge amount

  // Get member info
  const memberName = member.Name || '';
  const memberPhone = member.PhoneNo || '';
  const memberSerialNumber = member.SerialNumber || '';

  // Additional data
  const totalCharge = parseFloatSafe(member.TotalCharge);
  const lastReadDate = formatDateTime(member.LastReadDate);
  const voltage = parseFloatSafe(member.Voltage);
  const amper = parseFloatSafe(member.Amper);
  
  // Get IsActive status (default to true if not set)
  const activeRaw = member[isActiveColumn];
  const isActive = activeRaw === undefined || activeRaw === null ? true : Boolean(activeRaw);

  // Calculate tariff data
  const tariffs = calculateTariffData(member);

  return {
    lastChargeDate: lastChargeDate || '',
    lastChargeAmount,
    balanceAfterCharge,
    currentBalance,
    maxCapacity: lastChargeAmount,
    memberName,
    memberPhone,
    memberSerialNumber,
    complexName: complexName || '',
    totalCharge,
    lastReadDate,
    voltage,
    amper,
    isActive,
    tariffs,
  };
}

