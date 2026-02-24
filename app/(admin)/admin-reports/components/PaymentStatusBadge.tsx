'use client';

import { getPaymentStatus } from '../utils/formatters';

interface PaymentStatusBadgeProps {
  status: string | null;
  size?: 'sm' | 'md';
}

export default function PaymentStatusBadge({ status, size = 'md' }: PaymentStatusBadgeProps) {
  const { label, className } = getPaymentStatus(status);
  const paddingClass = size === 'sm' ? 'px-2 py-0.5' : 'px-2 py-0.5 sm:px-2.5 sm:py-0.5';

  return (
    <span className={`inline-flex items-center ${paddingClass} rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

