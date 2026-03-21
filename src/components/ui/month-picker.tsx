'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => currentYear - i + 5);

interface MonthPickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function MonthPicker({ id, value, onChange, required, className }: MonthPickerProps) {
  const autoId = useId();
  const baseId = id ?? autoId;

  const [year, month] = value ? value.split('-') : ['', ''];

  const handleMonthChange = (newMonth: string) => {
    if (newMonth && year) {
      onChange(`${year}-${newMonth}`);
    } else if (newMonth && !year) {
      onChange(`${currentYear}-${newMonth}`);
    } else if (!newMonth) {
      onChange('');
    }
  };

  const handleYearChange = (newYear: string) => {
    if (newYear && month) {
      onChange(`${newYear}-${month}`);
    } else if (newYear && !month) {
      onChange(`${newYear}-01`);
    } else if (!newYear) {
      onChange('');
    }
  };

  const selectClasses =
    'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30';

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      <select
        id={baseId}
        value={month ?? ''}
        onChange={(e) => handleMonthChange(e.target.value)}
        required={required}
        aria-label="Month"
        className={selectClasses}
      >
        <option value="">Month</option>
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select
        id={`${baseId}-year`}
        value={year ?? ''}
        onChange={(e) => handleYearChange(e.target.value)}
        required={required}
        aria-label="Year"
        className={selectClasses}
      >
        <option value="">Year</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
