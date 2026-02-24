'use client';

import {
  calculateBatterySegments,
  getSegmentColor,
  type BatteryData,
} from '../utils/batteryCalculations';

interface BatteryVisualizationProps {
  data: BatteryData;
  segmentsCount?: number;
}

/**
 * Component displaying the segmented battery visualization
 */
export default function BatteryVisualization({
  data,
  segmentsCount = 10,
}: BatteryVisualizationProps) {
  // Calculate battery percentage
  const batteryPercentage = Math.min(
    (data.currentBalance / data.lastChargeAmount) * 100,
    100
  );

  // Calculate segment states
  const {
    exactFilledSegments,
    filledSegments,
    hasPartialSegment,
    partialSegmentFill,
  } = calculateBatterySegments(batteryPercentage, segmentsCount);

  // Check if a segment is partially filled
  const isSegmentPartial = (segmentIndex: number) => {
    return hasPartialSegment && segmentIndex === filledSegments;
  };

  return (
    <div className="flex flex-col items-center" id="battery-container">
      <div className="relative">
        {/* Battery Terminal (Top) */}
        <div className="mx-auto w-32 h-6 bg-gray-800 rounded-t-lg mb-1.5"></div>

        {/* Battery Segments */}
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: segmentsCount }).map((_, index) => {
            const segmentIndex = segmentsCount - 1 - index; // از بالا به پایین
            const isFilled = segmentIndex < filledSegments;
            const isPartial = isSegmentPartial(segmentIndex);

            return (
              <div
                key={index}
                className="relative w-64 h-12 rounded-lg border-3 border-gray-800 overflow-hidden bg-gray-200"
                style={{
                  opacity: isFilled || isPartial ? 1 : 0.3,
                }}
              >
                {(isFilled || isPartial) && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
                      getSegmentColor(segmentIndex)
                    } ${isFilled ? 'shadow-lg' : ''}`}
                    style={{
                      height: isPartial ? `${partialSegmentFill}%` : '100%',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Battery Base */}
        <div className="mt-1.5 mx-auto w-64 h-5 bg-gray-800 rounded-b-lg"></div>
      </div>
    </div>
  );
}

