import ChargeSummary from './ChargeSummary';

interface ManualAmountInputProps {
  amount: string;
}

export default function ManualAmountInput({ amount }: ManualAmountInputProps) {
  const amountNumber = parseFloat(amount) || 0;
  const isValidAmount = amountNumber > 0;

  // تبدیل عدد به فارسی
  const formatToPersian = (num: number): string => {
    return num.toLocaleString('fa-IR');
  };

  // نمایش مقدار فارسی در input
  const displayValue = amount ? formatToPersian(amountNumber) : '';

  return (
    <div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مبلغ (تومان)
          </label>
          <input
            type="text"
            value={displayValue}
            readOnly
            placeholder="ابتدا بسته شارژ را انتخاب کنید"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-lg text-gray-800 cursor-not-allowed"
            dir="rtl"
          />
        </div>

        {isValidAmount && <ChargeSummary amount={amountNumber} />}
      </div>
    </div>
  );
}

