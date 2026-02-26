/**
 * Payment type translation map
 */
const PAYMENT_TYPE_MAP: Record<string, string> = {
  // English values
  online: 'آنلاین',
  offline: 'آفلاین',
  cash: 'نقدی',
  card: 'کارت بانکی',
  banktransfer: 'انتقال بانکی',
  bank_transfer: 'انتقال بانکی',
  wallet: 'کیف پول',
  gateway: 'درگاه بانکی',
  zarinpal: 'زرین‌پال',
  saman: 'سامان',
  mellat: 'ملت',
  sadad: 'سداد',
  parsian: 'پارسیان',
  pasargad: 'پاسارگاد',
  saderat: 'صادرات',
  tejarat: 'تجارت',
  refah: 'رفاه',
  post: 'پست',
  pos: 'پوز',
  manual: 'دستی',
  credit: 'اعتباری',
  deposit: 'واریز',
  withdrawal: 'برداشت',
  // Persian values (if already in Persian, return as is)
  آنلاین: 'آنلاین',
  آفلاین: 'آفلاین',
  نقدی: 'نقدی',
  'کارت بانکی': 'کارت بانکی',
  'انتقال بانکی': 'انتقال بانکی',
  'کیف پول': 'کیف پول',
  'درگاه بانکی': 'درگاه بانکی',
  'زرین‌پال': 'زرین‌پال',
  دستی: 'دستی',
  اعتباری: 'اعتباری',
};

/**
 * Translate payment type to Persian
 */
export function translatePayType(payType: string | null | undefined): string {
  if (!payType) return '-';

  const normalizedType = String(payType).toLowerCase().trim();
  return PAYMENT_TYPE_MAP[normalizedType] || payType;
}






