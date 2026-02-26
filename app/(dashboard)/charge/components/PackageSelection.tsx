import { Package } from '../types';

interface PackageSelectionProps {
  packages: Package[];
  selectedPackage: string | null;
  onSelect: (pkg: Package) => void;
}

export default function PackageSelection({
  packages,
  selectedPackage,
  onSelect,
}: PackageSelectionProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        انتخاب بسته شارژ
      </h3>
      {packages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          بسته شارژی یافت نشد
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => onSelect(pkg)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPackage === pkg.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className="text-sm font-bold text-gray-800">
                  {pkg.label}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}





