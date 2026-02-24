'use client';

import React, { useMemo } from 'react';
import { Journal } from '@/type/domain/journal';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TooltipProps } from 'recharts';
import { format, parseISO } from 'date-fns';
import { CalendarRange } from 'lucide-react';
import { formatCurrencyWithSign } from '@/lib/currency';
import { DashboardCard, CardHeader } from '@/components/dashboard/DashboardCard';

interface MonthlyPnlChartProps {
  journals: Journal[];
  seedCurrency?: string;
}

interface MonthlyData {
  month: string;
  pnl: number;
}

export default function MonthlyPnlChart({ journals, seedCurrency = 'KRW' }: MonthlyPnlChartProps) {
  const monthlyData = useMemo(() => {
    if (journals.length === 0) return [];

    const monthMap = new Map<string, number>();
    for (const j of journals) {
      const monthKey = format(parseISO(j.tradedAt), 'yyyy-MM');
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + j.profit);
    }

    const data: MonthlyData[] = [];
    for (const [month, pnl] of monthMap) {
      data.push({ month, pnl });
    }

    data.sort((a, b) => a.month.localeCompare(b.month));
    return data;
  }, [journals]);

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatXAxis = (monthStr: string) => {
    const parts = monthStr.split('-');
    return `${parseInt(parts[1])}월`;
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload as MonthlyData;
    const [year, month] = data.month.split('-');

    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
          {year}년 {parseInt(month)}월
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          손익:{' '}
          <span className={`font-semibold ${data.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrencyWithSign(data.pnl, seedCurrency)}
          </span>
        </p>
      </div>
    );
  };

  if (journals.length === 0) {
    return (
      <DashboardCard className="flex flex-col h-full">
        <CardHeader
          icon={<CalendarRange className="w-4 h-4 text-emerald-500" />}
          title="월별 손익"
        />
        <div className="flex flex-col items-center justify-center flex-1 min-h-[250px] gap-2">
          <CalendarRange className="w-8 h-8 text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-400 dark:text-slate-500">
            거래를 기록하면 월별 손익을 확인할 수 있습니다
          </p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="flex flex-col h-full">
      <CardHeader
        icon={<CalendarRange className="w-4 h-4 text-emerald-500" />}
        title="월별 손익"
      />
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
