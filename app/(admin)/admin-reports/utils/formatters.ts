export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) return '۰';
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '۰';
  const formatted = new Intl.NumberFormat('fa-IR').format(numValue);
  return formatted;
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const getPaymentStatus = (status: string | null) => {
  const statusStr = status ? String(status).trim() : '';
  const statusNum = status !== null && status !== undefined ? Number(status) : null;

  const isSuccess =
    statusStr === 'OK' ||
    statusStr === '1' ||
    statusNum === 1 ||
    statusStr.toLowerCase() === 'true' ||
    statusStr === 'موفق';

  const isFailed =
    statusStr === 'NOK' ||
    statusStr === '0' ||
    statusNum === 0 ||
    statusStr.toLowerCase() === 'false' ||
    statusStr === 'ناموفق';

  if (isSuccess) {
    return { label: 'موفق', className: 'bg-green-100 text-green-800' };
  } else if (isFailed) {
    return { label: 'ناموفق', className: 'bg-red-100 text-red-800' };
  } else {
    return { label: statusStr || 'نامشخص', className: 'bg-yellow-100 text-yellow-800' };
  }
};




