export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) return '۰';
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '۰';
  const formatted = new Intl.NumberFormat('fa-IR').format(numValue);
  return formatted;
};




