'use client';

interface TariffData {
  name: string;
  readingAtLastCharge: number;
  lastReading: number;
  consumption: number;
}

interface TariffTableProps {
  tariffs: TariffData[];
}

/**
 * Component displaying tariff consumption table
 */
export default function TariffTable({ tariffs }: TariffTableProps) {
  return (
    <div className="w-full min-w-0 max-w-full box-border" style={{ contain: 'layout', maxWidth: '100%' }}>
      <div className="w-full max-w-full box-border" style={{ maxWidth: '100%' }}>
        <div className="overflow-hidden border border-gray-300 rounded-lg w-full" style={{ maxWidth: '100%' }}>
          <table 
            className="w-full border-collapse" 
            style={{ 
              width: '100%', 
              tableLayout: 'auto',
              maxWidth: '100%',
              minWidth: 0
            }}
          >
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1.5 text-xs font-bold text-gray-800 text-right border-r border-b border-gray-300 whitespace-nowrap">
                  تعرفه
                </th>
                <th className="px-2 py-1.5 text-xs font-bold text-gray-800 text-center border-r border-b border-gray-300">
                  <span className="block sm:inline">قرائت زمان آخرین شارژ</span>
                  <span className="hidden sm:inline"> (kWh)</span>
                </th>
                <th className="px-2 py-1.5 text-xs font-bold text-gray-800 text-center border-r border-b border-gray-300">
                  <span className="block sm:inline">آخرین قرائت کنتور</span>
                  <span className="hidden sm:inline"> (kWh)</span>
                </th>
                <th className="px-2 py-1.5 text-xs font-bold text-gray-800 text-center border-r border-b border-gray-300 whitespace-nowrap">
                  مصرف
                  <span className="hidden sm:inline"> (kWh)</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {tariffs && tariffs.length > 0 ? (
                tariffs.map((tariff, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-1.5 text-xs text-gray-800 font-medium border-r border-b border-gray-200 whitespace-nowrap">
                      {tariff.name}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-center text-gray-700  border-r border-b border-gray-200 whitespace-nowrap">
                      {tariff.readingAtLastCharge.toFixed(2)}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-700 text-center border-r border-b border-gray-200 whitespace-nowrap">
                      {tariff.lastReading.toFixed(2)}
                    </td>
                    <td className="px-2  py-1.5 text-xs text-blue-600 border-r font-semibold text-center border-b border-gray-200 whitespace-nowrap">
                      {tariff.consumption.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-2 py-4 text-center text-xs text-gray-500 border-b border-gray-200"
                  >
                    داده‌ای برای نمایش وجود ندارد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

