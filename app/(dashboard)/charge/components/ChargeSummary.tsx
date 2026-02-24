interface ChargeSummaryProps {
  amount: number;
}

export default function ChargeSummary({ amount }: ChargeSummaryProps) {
  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700">مبلغ شارژ:</span>
        <span className="font-bold text-gray-800">
          {amount.toLocaleString('fa-IR')} تومان
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-700">کارمزد:</span>
        <span className="font-bold text-gray-800">۰ تومان</span>
      </div>
      <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between items-center">
        <span className="font-semibold text-gray-800">جمع کل:</span>
        <span className="font-bold text-xl text-blue-600">
          {amount.toLocaleString('fa-IR')} تومان
        </span>
      </div>
    </div>
  );
}

