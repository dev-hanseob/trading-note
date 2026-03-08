'use client';

import React from 'react';

export type DatePreset = '1W' | '1M' | '3M' | '6M' | 'YTD' | 'ALL';

interface DateRangeFilterProps {
  value: DatePreset;
  onChange: (preset: DatePreset) => void;
}

const presets: { label: string; value: DatePreset }[] = [
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: 'YTD', value: 'YTD' },
  { label: 'ALL', value: 'ALL' },
];

export default function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
      {presets.map((preset) => (
        <button
          key={preset.value}
          onClick={() => onChange(preset.value)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            value === preset.value
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
