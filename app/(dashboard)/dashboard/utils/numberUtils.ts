/**
 * Utility functions for number formatting and Persian number conversion
 */

/**
 * Convert numbers to Persian digits
 */
export function toPersianNumber(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
}

/**
 * Format number with Persian locale
 */
export function formatPersianNumber(num: number): string {
  return num.toLocaleString('fa-IR');
}

