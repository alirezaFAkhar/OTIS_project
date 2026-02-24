'use client';

interface StatusBadgeProps {
  status: number | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusNum = typeof status === 'string' ? parseInt(status) : status;
  
  if (statusNum === 1 || status === '1' || status === 'موفق') {
    return (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
        موفق
      </span>
    );
  }
  
  if (statusNum === 0 || status === '0' || status === 'ناموفق') {
    return (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
        ناموفق
      </span>
    );
  }
  
  return (
    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
      در انتظار
    </span>
  );
}

