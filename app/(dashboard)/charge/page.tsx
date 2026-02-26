'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Package } from './types';
import { BANKS } from './constants';
import ChargeHeader from './components/ChargeHeader';
import PackageSelection from './components/PackageSelection';
import ManualAmountInput from './components/ManualAmountInput';
import BankSelection from './components/BankSelection';
import ChargeButton from './components/ChargeButton';

export default function ChargePage() {
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState<string | null>(null);

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      setPackagesLoading(true);
      setPackagesError(null);
      try {
        const response = await fetch('/api/payment-amounts', {
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'خطا در دریافت بسته‌های شارژ');
        }

        const data = await response.json();
        setPackages(data);
      } catch (error: any) {
        console.error('Error fetching packages:', error);
        setPackagesError(error.message || 'خطا در دریافت بسته‌های شارژ');
        toast.error('خطا در دریافت بسته‌های شارژ. لطفا صفحه را رفرش کنید.');
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Handle callback from payment gateway
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const transactionId = searchParams.get('transactionId');
    const refId = searchParams.get('refId');
    const message = searchParams.get('message');

    if (success === 'true' && transactionId) {
      toast.success(
        `پرداخت با موفقیت انجام شد. کد پیگیری: ${refId || transactionId}`,
        { duration: 5000 }
      );
      // Reset form
      setAmount('');
      setSelectedPackage(null);
      setSelectedBank(null);
    } else if (error) {
      const errorMessages: Record<string, string> = {
        missing_authority: 'کد تراکنش یافت نشد',
        transaction_not_found: 'تراکنش یافت نشد',
        payment_cancelled: 'پرداخت توسط کاربر لغو شد',
        payment_failed: message || 'پرداخت ناموفق بود',
        database_error: 'خطا در ذخیره اطلاعات',
        callback_error: 'خطا در پردازش بازگشت از درگاه',
      };
      toast.error(errorMessages[error] || 'خطا در پرداخت');
    }
  }, [searchParams]);

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg.id);
    setAmount(pkg.amount);
  };

  const handleCharge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('لطفا مبلغ معتبری وارد کنید');
      return;
    }

    if (!selectedBank) {
      toast.error('لطفا بانک مورد نظر را انتخاب کنید');
      return;
    }

    setIsLoading(true);
    try {
      const selectedBankData = BANKS.find((b) => b.id === selectedBank);
      if (!selectedBankData) {
        toast.error('بانک انتخاب شده معتبر نیست');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(amount),
          bankId: selectedBank,
          bankName: selectedBankData.name,
          description: `شارژ حساب - ${parseFloat(amount).toLocaleString('fa-IR')} تومان`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطا در ایجاد تراکنش');
      }

      if (data.success && data.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.message || 'خطا در ایجاد درخواست پرداخت');
      }
    } catch (error: any) {
      console.error('Charge error:', error);
      toast.error(error.message || 'خطا در شارژ حساب. لطفا دوباره تلاش کنید.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <ChargeHeader />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {packagesLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-500">در حال بارگذاری بسته‌های شارژ...</div>
            </div>
          ) : packagesError ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-red-500">{packagesError}</div>
            </div>
          ) : (
            <PackageSelection
              packages={packages}
              selectedPackage={selectedPackage}
              onSelect={handlePackageSelect}
            />
          )}

          <ManualAmountInput amount={amount} />
        </div>

        <BankSelection
          banks={BANKS}
          selectedBank={selectedBank}
          onSelect={setSelectedBank}
        />

        <ChargeButton
          amount={amount}
          selectedBank={selectedBank}
          isLoading={isLoading}
          onCharge={handleCharge}
        />
      </div>
      
      <Toaster position="top-center" />
    </div>
  );
}
