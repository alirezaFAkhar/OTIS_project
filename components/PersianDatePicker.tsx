'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { toPersianNumber } from '@/app/(dashboard)/dashboard/utils/numberUtils';

interface PersianDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Simple Persian month names
const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const persianDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

// Convert Gregorian to Jalali
function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + 
             Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return [jy, jm, jd];
}

// Convert Jalali to Gregorian
function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  jy += 1595;
  let days = -355668 + (365 * jy) + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd;
  if (jm < 7) {
    days += (jm - 1) * 31;
  } else {
    days += ((jm - 7) * 30) + 186;
  }
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 13 && gd > sal_a[gm]) {
    gd -= sal_a[gm];
    gm++;
  }
  return [gy, gm, gd];
}

// Format date to YYYY-MM-DD for input
function formatDateForInput(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Parse YYYY-MM-DD (Gregorian) to Jalali
function parseInputDate(dateStr: string): [number, number, number] | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  // Convert Gregorian to Jalali
  return gregorianToJalali(year, month, day);
}

export default function PersianDatePicker({ value, onChange, placeholder = 'انتخاب تاریخ' }: PersianDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<[number, number, number]>(() => {
    if (value) {
      const parsed = parseInputDate(value);
      if (parsed) return parsed;
    }
    const now = new Date();
    return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  });
  const [selectedDate, setSelectedDate] = useState<[number, number, number] | null>(() => {
    if (value) {
      return parseInputDate(value);
    }
    return null;
  });
  const [viewMonth, setViewMonth] = useState(currentDate[1]);
  const [viewYear, setViewYear] = useState(currentDate[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (year: number, month: number): number => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    // Check if it's a leap year
    const a = (year + 2346) % 128;
    return a < 30 || (a === 30 && (year + 1413) % 33 < 29) ? 30 : 29;
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    const [gy, gm, gd] = jalaliToGregorian(year, month, 1);
    const date = new Date(gy, gm - 1, gd);
    let day = date.getDay();
    day = (day + 1) % 7; // Convert to Persian week (Saturday = 0)
    return day;
  };

  const handleDateSelect = (day: number) => {
    const newDate: [number, number, number] = [viewYear, viewMonth, day];
    setSelectedDate(newDate);
    const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, day);
    const gregorianDate = formatDateForInput(gy, gm, gd);
    onChange(gregorianDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSelectedDate(null);
  };

  const displayValue = selectedDate
    ? `${toPersianNumber(selectedDate[0])}/${toPersianNumber(String(selectedDate[1]).padStart(2, '0'))}/${toPersianNumber(String(selectedDate[2]).padStart(2, '0'))}`
    : '';

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
      >
        <span className={displayValue ? 'text-gray-800' : 'text-gray-400'}>
          {displayValue || placeholder}
        </span>
        <div className="flex items-center gap-2">
          {displayValue && (
            <X
              onClick={handleClear}
              className="w-4 h-4 text-gray-400 hover:text-gray-600"
            />
          )}
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-gray-600">‹</span>
            </button>
            <div className="text-lg font-semibold text-gray-800">
              {persianMonths[viewMonth - 1]} {toPersianNumber(viewYear)}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-gray-600">›</span>
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {persianDays.map((day, index) => (
              <div
                key={index}
                className="text-center text-sm font-medium text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const isSelected =
                selectedDate &&
                selectedDate[0] === viewYear &&
                selectedDate[1] === viewMonth &&
                selectedDate[2] === day;
              return (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  className={`aspect-square flex items-center justify-center rounded-lg transition-colors text-sm ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {toPersianNumber(day)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

