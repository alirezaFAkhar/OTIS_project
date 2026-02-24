interface ChargeButtonProps {
  amount: string;
  selectedBank: string | null;
  isLoading: boolean;
  onCharge: () => void;
}

export default function ChargeButton({
  amount,
  selectedBank,
  isLoading,
  onCharge,
}: ChargeButtonProps) {
  const amountNumber = parseFloat(amount) || 0;
  const isValidAmount = amountNumber > 0;
  const canCharge = isValidAmount && selectedBank !== null;

  if (!canCharge) {
    return null;
  }

  return (
    <div className="mt-6">
      <button
        onClick={onCharge}
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? 'در حال پردازش...' : 'شارژ حساب'}
      </button>
    </div>
  );
}

