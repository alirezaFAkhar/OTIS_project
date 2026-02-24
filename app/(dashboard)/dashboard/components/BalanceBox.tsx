'use client';

import { ArrowLeft } from 'lucide-react';
import {
  calculateBatterySegments,
  calculateArrowPosition,
  getBalanceBoxColor,
  type BatteryData,
} from '../utils/batteryCalculations';
import { formatPersianNumber, toPersianNumber } from '../utils/numberUtils';

interface BalanceBoxProps {
  data: BatteryData;
  segmentsCount?: number;
}

/**
 * Component displaying the current balance box with arrow pointing to battery level
 */
export default function BalanceBox({
  data,
  segmentsCount = 10,
}: BalanceBoxProps) {
  // Calculate battery percentage and segments
  const batteryPercentage = Math.min(
    (data.currentBalance / data.lastChargeAmount) * 100,
    100
  );
  const { exactFilledSegments } = calculateBatterySegments(
    batteryPercentage,
    segmentsCount
  );

  // Calculate arrow position
  const rawArrowPosition = calculateArrowPosition(exactFilledSegments, segmentsCount);
  const arrowPosition = rawArrowPosition;

  // Get box color based on balance
  const boxColor = getBalanceBoxColor(data.currentBalance, data.lastChargeAmount);
  const batteryPercentagePersian = toPersianNumber(batteryPercentage.toFixed(1));

  const arrowTop = rawArrowPosition > 85 ? 'auto' : `${arrowPosition}%`;
  const arrowBottom = rawArrowPosition > 85 ? '0' : 'auto';
  const arrowTransform = rawArrowPosition > 85 ? 'translateY(0)' : 'translateY(-50%)';

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .balance-box-desktop {
            top: ${arrowTop};
            bottom: ${arrowBottom};
            transform: ${arrowTransform};
          }
        }
      `}</style>
      <div className="relative flex items-center overflow-visible w-full h-full lg:w-auto lg:h-auto min-h-[180px] lg:min-h-[600px]">
        {/* Arrow pointing to battery level */}
        <div
          className="absolute -right-8 z-10 hidden lg:block"
          style={{
            top: arrowTop,
            bottom: arrowBottom,
            transform: arrowTransform,
            transition: 'all 0.5s ease-out',
          }}
        >
          <ArrowLeft
            className={`${boxColor} text-white`}
            size={32}
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
            }}
          />
        </div>

        {/* Balance Box */}
        <div
          className={`${boxColor} rounded-xl p-5 shadow-2xl text-white w-full h-full lg:min-w-[200px] lg:w-auto lg:h-auto lg:absolute balance-box-desktop flex flex-col justify-center items-center`}
          style={{
            transition: 'all 0.5s ease-out',
          }}
        >
          <p className="text-base font-semibold mb-3 text-center">مانده اعتبار فعلی</p>
          <p className="text-3xl font-bold text-center">
            {formatPersianNumber(data.currentBalance)}
          </p>
          <p className="text-center text-white/80 mt-1 text-sm">تومان</p>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-center text-xs">
              {batteryPercentagePersian}% از ظرفیت
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

