'use client';

interface TariffData {
  name: string;
  readingAtLastCharge: number;
  lastReading: number;
  consumption: number;
  /** مبلغ (ریال) - منتظر فرمول محاسبه */
  amount?: number;
}

interface TariffTableProps {
  tariffs: TariffData[];
}

// رنگ هر ستون هم‌رنگ کارت هم‌ستون خود در جدول بالا (از راست به چپ)
const COLUMN_STYLES = {
  name: { head: 'bg-blue-50 border-b-blue-500', cell: 'bg-blue-50/40' },
  readingAtLastCharge: { head: 'bg-teal-50 border-b-teal-500', cell: 'bg-teal-50/40' },
  lastReading: { head: 'bg-green-50 border-b-green-500', cell: 'bg-green-50/40' },
  consumption: { head: 'bg-orange-50 border-b-orange-500', cell: 'bg-orange-50/40' },
  amount: { head: 'bg-purple-50 border-b-purple-500', cell: 'bg-purple-50/40' },
} as const;

/**
 * Component displaying tariff consumption table
 */
export default function TariffTable({ tariffs }: TariffTableProps) {
  const s = COLUMN_STYLES;
  return (
    <div className="w-full min-w-0 max-w-full box-border" style={{ contain: 'layout', maxWidth: '100%' }}>
      <div className="w-full max-w-full box-border" style={{ maxWidth: '100%' }}>
        <div className="overflow-x-auto border border-gray-300 rounded-lg w-full" style={{ maxWidth: '100%' }}>
          <table
            className="w-full border-collapse"
            style={{
              width: '100%',
              tableLayout: 'fixed',
              maxWidth: '100%',
              minWidth: 640
            }}
          >
            <colgroup>
              {[0, 1, 2, 3, 4].map((i) => (
                <col key={i} style={{ width: '20%' }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className={`${s.name.head} px-2 py-1.5 text-xs font-bold text-gray-800 text-right border-r border-b-2 border-r-gray-300 whitespace-nowrap`}>
                  زمان مصرف
                </th>
                <th className={`${s.readingAtLastCharge.head} px-2 py-1.5 text-xs font-bold text-gray-800 text-center border-r border-b-2 border-r-gray-300 `}>
                  عدد قرائت زمان آخرین شارژ
                </th>
                <th className={`${s.lastReading.head} px-2 py-1.5 text-xs font-bold text-gray-800 text-center border-r border-b-2 border-r-gray-300 `}>
                  عدد آخرین قرائت کنتور
                </th>
                <th className={`${s.consumption.head} px-2 py-1.5 text-xs font-bold text-gray-800 text-center border-r border-b-2 border-r-gray-300 whitespace-nowrap`}>
                  انرژی (Kwh)
                </th>
                <th className={`${s.amount.head} px-2 py-1.5 text-xs font-bold text-gray-800 text-center border-r border-b-2 border-r-gray-300 whitespace-nowrap`}>
                  مبلغ (ریال)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {tariffs && tariffs.length > 0 ? (
                tariffs.map((tariff, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className={`${s.name.cell} px-2 py-1.5 text-xs text-gray-800 font-medium border-r border-b border-gray-200 whitespace-nowrap`}>
                      {tariff.name}
                    </td>
                    <td className={`${s.readingAtLastCharge.cell} px-2 py-1.5 text-xs text-center text-gray-700 border-r border-b border-gray-200 whitespace-nowrap`}>
                      {tariff.readingAtLastCharge.toFixed(2)}
                    </td>
                    <td className={`${s.lastReading.cell} px-2 py-1.5 text-xs text-gray-700 text-center border-r border-b border-gray-200 whitespace-nowrap`}>
                      {tariff.lastReading.toFixed(2)}
                    </td>
                    <td className={`${s.consumption.cell} px-2 py-1.5 text-xs text-orange-700 border-r font-semibold text-center border-b border-gray-200 whitespace-nowrap`}>
                      {tariff.consumption.toFixed(2)}
                    </td>
                    <td className={`${s.amount.cell} px-2 py-1.5 text-xs text-purple-700 border-r font-semibold text-center border-b border-gray-200 whitespace-nowrap`}>
                      {tariff.amount !== undefined ? tariff.amount.toLocaleString('fa-IR') : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
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
