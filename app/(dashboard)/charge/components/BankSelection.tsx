import { Bank } from '../types';

interface BankSelectionProps {
  banks: Bank[];
  selectedBank: string | null;
  onSelect: (bankId: string) => void;
}

export default function BankSelection({
  banks,
  selectedBank,
  onSelect,
}: BankSelectionProps) {
  return (
    <div className="mt-8 bg-gray-50 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        انتخاب بانک
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {banks.map((bank) => (
          <button
            key={bank.id}
            onClick={() => onSelect(bank.id)}
            className={`bg-white rounded-lg p-4 text-center border-2 transition-all ${
              selectedBank === bank.id
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-center mb-3 h-12">
              <img
                src={bank.logo}
                alt={bank.name}
                className="h-full w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="text-sm font-medium text-gray-700">{bank.name}</div>
            {selectedBank === bank.id && (
              <div className="mt-2 text-xs text-blue-600 font-semibold">
                ✓ انتخاب شده
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

