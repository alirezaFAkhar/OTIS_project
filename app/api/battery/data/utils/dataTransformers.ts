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
  memberPartNumber: string;
  complexName: string;
  adr: string;
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
    amount?: number;
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
function calculateTariffData(
  member: any,
  latestPayment: any = null,
  prices: number[] | null = null
) {
  // مبلغ (ریال) = مصرف هر سطر × قیمت تعرفه‌ی همان سطر (P1..P4 از جدول مجتمع)
  const amountFor = (consumption: number, index: number) =>
    prices ? Math.round(consumption * prices[index]) : undefined;

  // "آخرین قرائت کنتور" (current meter reading) always comes from the Members
  // table — this is the live reading and must not change.
  const p1LastReading = parseFloatSafe(member.P1); // باری (تعرفه 1)
  const p2LastReading = parseFloatSafe(member.P2); // اوج بار (تعرفه 2)
  const p3LastReading = parseFloatSafe(member.P3); // کم باری (تعرفه 3)
  const p4LastReading = parseFloatSafe(member.P4); // انرژی راکتیو

  // "قرائت زمان آخرین شارژ" (reading at the time of the last charge) comes only
  // from the member's most recent Payments row. If that row has no readings
  // (e.g. NULL / no Payments row at all), show 0 rather than silently falling
  // back to the current reading — a 0 here is a visible signal that Payments
  // has no data, instead of looking like a coincidental duplicate.
  const hasPaymentReadings = latestPayment && (
    latestPayment.P1 !== undefined && latestPayment.P1 !== null ||
    latestPayment.P2 !== undefined && latestPayment.P2 !== null ||
    latestPayment.P3 !== undefined && latestPayment.P3 !== null ||
    latestPayment.P4 !== undefined && latestPayment.P4 !== null
  );

  const p1AtLastCharge = hasPaymentReadings ? parseFloatSafe(latestPayment.P1) : 0;
  const p2AtLastCharge = hasPaymentReadings ? parseFloatSafe(latestPayment.P2) : 0;
  const p3AtLastCharge = hasPaymentReadings ? parseFloatSafe(latestPayment.P3) : 0;
  const p4AtLastCharge = hasPaymentReadings ? parseFloatSafe(latestPayment.P4) : 0;

  // Calculate consumption (difference)
  const p1Consumption = p1LastReading - p1AtLastCharge;
  const p2Consumption = p2LastReading - p2AtLastCharge;
  const p3Consumption = p3LastReading - p3AtLastCharge;
  const p4Consumption = p4LastReading - p4AtLastCharge;

  return [
    {
      name: 'میان بار (تعرفه ۱)',
      readingAtLastCharge: p1AtLastCharge,
      lastReading: p1LastReading,
      consumption: p1Consumption,
      amount: amountFor(p1Consumption, 0),
    },
    {
      name: 'اوج بار (تعرفه ۲)',
      readingAtLastCharge: p2AtLastCharge,
      lastReading: p2LastReading,
      consumption: p2Consumption,
      amount: amountFor(p2Consumption, 1),
    },
    {
      name: 'کم بار (تعرفه ۳)',
      readingAtLastCharge: p3AtLastCharge,
      lastReading: p3LastReading,
      consumption: p3Consumption,
      amount: amountFor(p3Consumption, 2),
    },
    {
      name: 'انرژی راکتیو',
      readingAtLastCharge: p4AtLastCharge,
      lastReading: p4LastReading,
      consumption: p4Consumption,
      amount: amountFor(p4Consumption, 3),
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
export function transformMemberToBatteryData(
  member: any,
  complexName: string = '',
  latestPayment: { Amount?: any; Credit?: any; PayDate?: any; AddDate?: any } | null = null,
  complexPrices: number[] | null = null
): BatteryDataResponse {
  // Get column name for IsActive from environment variable
  const isActiveColumn = safeColumnName(process.env.MEMBERS_ACTIVE_COLUMN, 'IsActive');

  // Last charge amount comes from the member's latest Payments row when available,
  // falling back to the Member table. currentBalance is the live account balance
  // (Members.CurrRemainCharge) used by the battery/BalanceBox/header. balanceAfterCharge
  // is a separate stored value (Members.CreditAfterLastCharge), defaulting to 0 when absent.
  const currentBalance = parseFloatSafe(member.CurrRemainCharge);
  const lastChargeAmount = latestPayment
    ? parseFloatSafe(latestPayment.Amount)
    : parseFloatSafe(member.LastCharge);
  const lastChargeDate = formatDate(
    latestPayment ? (latestPayment.PayDate || latestPayment.AddDate) : member.LastChargeDate
  );
  const balanceAfterCharge = parseFloatSafe(member.CreditAfterLastCharge);

  // Get member info
  const memberName = member.Name || '';
  const memberPhone = member.PhoneNo || '';
  const memberSerialNumber = member.SerialNumber || '';
  const memberPartNumber = member.PartNo || '';
  const adr = member.Adr || '';

  // Additional data
  const totalCharge = parseFloatSafe(member.TotalCharge);
  const lastReadDate = formatDateTime(member.LastReadDate);
  const voltage = parseFloatSafe(member.Voltage);
  const amper = parseFloatSafe(member.Amper);
  
  // Get IsActive status (default to true if not set)
  const activeRaw = member[isActiveColumn];
  const isActive = activeRaw === undefined || activeRaw === null ? true : Boolean(activeRaw);

  // Calculate tariff data
  const tariffs = calculateTariffData(member, latestPayment, complexPrices);

  return {
    lastChargeDate: lastChargeDate || '',
    lastChargeAmount,
    balanceAfterCharge,
    currentBalance,
    maxCapacity: lastChargeAmount,
    memberName,
    memberPhone,
    memberSerialNumber,
    memberPartNumber,
    complexName: complexName || '',
    adr: adr || '',
    totalCharge,
    lastReadDate,
    voltage,
    amper,
    isActive,
    tariffs,
  };
}

