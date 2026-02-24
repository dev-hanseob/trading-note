'use client';

import React, { useMemo, useState } from 'react';
import { Journal } from '@/type/domain/journal';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatCurrencyWithSign } from '@/lib/currency';
import { DashboardCard, CardHeader } from '@/components/dashboard/DashboardCard';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns';

interface CalendarHeatmapProps {
  journals: Journal[];
  seedCurrency?: string;
}

export default function CalendarHeatmap({ journals, seedCurrency = 'KRW' }: CalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const dailyPnl = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number }>();
    for (const j of journals) {
      const dateKey = format(parseISO(j.tradedAt), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || { pnl: 0, count: 0 };
      map.set(dateKey, {
        pnl: existing.pnl + j.profit,
        count: existing.count + 1,
      });
    }
    return map;
  }, [journals]);

  // Calculate max absolute PnL for intensity scaling
  const maxAbsPnl = useMemo(() => {
    let max = 0;
    for (const { pnl } of dailyPnl.values()) {
      max = Math.max(max, Math.abs(pnl));
    }
    return max || 1;
  }, [dailyPnl]);

  const getIntensity = (pnl: number): number => {
    const ratio = Math.abs(pnl) / maxAbsPnl;
    if (ratio >= 0.75) return 4;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.25) return 2;
    return 1;
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const getCellClasses = (day: Date): string => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const data = dailyPnl.get(dateKey);
    const inMonth = isSameMonth(day, currentDate);
    const today = isToday(day);

    let base =
      'aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all relative';

    if (!inMonth) {
      return `${base} text-slate-200 dark:text-slate-700`;
    }

    if (today) {
      base += ' ring-2 ring-emerald-400 dark:ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900';
    }

    if (!data) {
      return `${base} bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500`;
    }

    const intensity = getIntensity(data.pnl);

    if (data.pnl > 0) {
      switch (intensity) {
        case 4:
          return `${base} bg-emerald-500 text-white`;
        case 3:
          return `${base} bg-emerald-400 text-white`;
        case 2:
          return `${base} bg-emerald-200 dark:bg-emerald-700 text-emerald-900 dark:text-emerald-100`;
        default:
          return `${base} bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300`;
      }
    }

    if (data.pnl < 0) {
      switch (intensity) {
        case 4:
          return `${base} bg-red-500 text-white`;
        case 3:
          return `${base} bg-red-400 text-white`;
        case 2:
          return `${base} bg-red-200 dark:bg-red-700 text-red-900 dark:text-red-100`;
        default:
          return `${base} bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300`;
      }
    }

    // pnl === 0
    return `${base} bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400`;
  };

  // Monthly summary
  const monthSummary = useMemo(() => {
    let totalPnl = 0;
    let trades = 0;
    let winDays = 0;
    let lossDays = 0;

    for (const [dateKey, data] of dailyPnl.entries()) {
      const d = parseISO(dateKey);
      if (isSameMonth(d, currentDate)) {
        totalPnl += data.pnl;
        trades += data.count;
        if (data.pnl > 0) winDays++;
        if (data.pnl < 0) lossDays++;
      }
    }
    return { totalPnl, trades, winDays, lossDays };
  }, [dailyPnl, currentDate]);

  return (
    <DashboardCard>
      <CardHeader
        icon={<CalendarDays className="w-4 h-4 text-emerald-500" />}
        title="Trading Calendar"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              <ChevronLeft size={16} className="text-slate-400" />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[100px] text-center">
              {format(currentDate, 'yyyy년 M월')}
            </span>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              <ChevronRight size={16} className="text-slate-400" />
            </button>
          </div>
        }
      />

      {/* Monthly summary bar */}
      <div className="flex items-center gap-4 mb-4 px-1 text-xs text-slate-500 dark:text-slate-400">
        <span>
          P&L:{' '}
          <span
            className={`font-semibold ${
              monthSummary.totalPnl >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrencyWithSign(monthSummary.totalPnl, seedCurrency)}
          </span>
        </span>
        <span>{monthSummary.trades}건</span>
        <span className="text-emerald-600 dark:text-emerald-400">{monthSummary.winDays}일 이익</span>
        <span className="text-red-500 dark:text-red-400">{monthSummary.lossDays}일 손실</span>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const data = dailyPnl.get(dateKey);
          const inMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={dateKey}
              className={getCellClasses(day)}
              onMouseEnter={() => inMonth ? setHoveredDay(dateKey) : undefined}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {inMonth ? day.getDate() : ''}
              {/* Tooltip */}
              {hoveredDay === dateKey && data && inMonth && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2.5 text-xs whitespace-nowrap pointer-events-none">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {format(day, 'M월 d일')}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {data.count}건 거래
                  </p>
                  <p
                    className={`font-semibold ${
                      data.pnl >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatCurrencyWithSign(data.pnl, seedCurrency)}
                  </p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 rotate-45 -mt-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-slate-400 dark:text-slate-500">
        <span>손실</span>
        <div className="w-3 h-3 rounded-sm bg-red-400" />
        <div className="w-3 h-3 rounded-sm bg-red-200 dark:bg-red-700" />
        <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-700" />
        <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-700" />
        <div className="w-3 h-3 rounded-sm bg-emerald-400" />
        <span>이익</span>
      </div>
    </DashboardCard>
  );
}
