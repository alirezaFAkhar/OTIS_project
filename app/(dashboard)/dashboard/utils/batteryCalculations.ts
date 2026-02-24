/**
 * Utility functions for battery calculations and visualizations
 */

export interface BatteryData {
  lastChargeDate: string;
  lastChargeAmount: number;
  balanceAfterCharge: number;
  currentBalance: number;
  maxCapacity: number;
}

/**
 * Calculate battery percentage based on current balance vs last charge amount
 */
export function calculateBatteryPercentage(data: BatteryData): number {
  return Math.min((data.currentBalance / data.lastChargeAmount) * 100, 100);
}

/**
 * Calculate filled segments for battery visualization
 */
export function calculateBatterySegments(
  batteryPercentage: number,
  segmentsCount: number = 10
) {
  const exactFilledSegments = (batteryPercentage / 100) * segmentsCount;
  const filledSegments = Math.floor(exactFilledSegments);
  const hasPartialSegment = exactFilledSegments > filledSegments;
  const partialSegmentFill = (exactFilledSegments - filledSegments) * 100;

  return {
    exactFilledSegments,
    filledSegments,
    hasPartialSegment,
    partialSegmentFill,
  };
}

/**
 * Get color for battery segment based on its position
 * - Bottom segment (0): Red (last 10 Toman)
 * - Second segment (1): Orange (10% to 20%)
 * - Segments 2-4: Yellow (20% to 50%)
 * - Segments 5-9: Green (50% to 100%)
 */
export function getSegmentColor(segmentIndex: number): string {
  // Bottom segment (last 10 Toman): Red
  if (segmentIndex === 0) {
    return 'bg-red-500';
  }

  // Second segment (10% to 20%): Orange
  if (segmentIndex === 1) {
    return 'bg-orange-500';
  }

  // Segments 2-4 (20% to 50%): Yellow
  if (segmentIndex >= 2 && segmentIndex <= 4) {
    return 'bg-yellow-500';
  }

  // Segments 5-9 (50% to 100%): Green
  return 'bg-green-500';
}

/**
 * Get color for balance box based on remaining balance
 */
export function getBalanceBoxColor(
  currentBalance: number,
  lastChargeAmount: number
): string {
  // Last 10 Toman: Red
  if (currentBalance <= 10) return 'bg-red-500';

  // 10% to last 10 Toman: Orange
  const tenPercent = lastChargeAmount * 0.1;
  if (currentBalance <= tenPercent && currentBalance > 10) {
    return 'bg-orange-500';
  }

  // 50% to 10%: Yellow
  const fiftyPercent = lastChargeAmount * 0.5;
  if (currentBalance <= fiftyPercent && currentBalance > tenPercent) {
    return 'bg-yellow-500';
  }

  // Above 50%: Green
  return 'bg-green-500';
}

/**
 * Calculate arrow position for balance box
 */
export function calculateArrowPosition(
  exactFilledSegments: number,
  segmentsCount: number = 10
): number {
  const rawPosition = ((segmentsCount - exactFilledSegments) / segmentsCount) * 100;
  // Limit position to stay within container (10% to 90%)
  return Math.max(10, Math.min(90, rawPosition));
}

