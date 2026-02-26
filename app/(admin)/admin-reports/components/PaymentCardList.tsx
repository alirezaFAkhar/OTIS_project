'use client';

import { Payment } from '../types';
import PaymentCard from './PaymentCard';

interface PaymentCardListProps {
  payments: Payment[];
}

export default function PaymentCardList({ payments }: PaymentCardListProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        هیچ پرداختی یافت نشد
      </div>
    );
  }

  return (
    <div className="lg:hidden space-y-4">
      {payments.map((payment) => (
        <PaymentCard key={payment.Id} payment={payment} />
      ))}
    </div>
  );
}




