'use client';

import React, { useMemo, useState } from 'react';
import { Journal } from '@/type/domain/journal';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TooltipProps } from 'recharts';
import { parseISO, subWeeks, subMonths, format, isAfter } from 'date-fns';
import { Activity } from 'lucide-react';
import { formatCurrency, formatCurrencyWithSign } from '@/lib/currency';
import { DashboardCard, CardHeader } from '@/components/dashboard/DashboardCard';

interface EquityCurveProps {
  journals: Journal[];
  seed: number;
  seedCurrency?: string;
}

type Period = '1W' | '1M' | '3M' | '6M' | 'ALL';

interface EquityDataPoint {
  date: string;
  equity: number;
  change: number;
}

const periodButtons: { label: string; value: Period }[] = [
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: 'ALL', value: 'ALL' },
];

export default function EquityCurve({ journals, seed, seedCurrency = 'KRW' }: EquityCurveProps) {
  const [period, setPeriod] = useState<Period>('ALL');

  const equityData = useMemo(() => {
    if (journals.length === 0) return [];

    const sorted = [...journals].sort(
      (a, b) => parseISO(a.tradedAt).getTime() - parseISO(b.tradedAt).getTime()
    );

    const dateMap = new Map<string, number>();
    for (const j of sorted) {
      const dateKey = format(parseISO(j.tradedAt), 'yyyy-MM-dd');
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + j.profit);
    }

    let cumulative = 0;
    const data: EquityDataPoint[] = [];
    for (const [date, dailyProfit] of dateMap) {
      cumulative += dailyProfit;
      data.push({
        date,
        equity: seed + cumulative,
        change: cumulative,
      });
    }

    return data;
  }, [journals, seed]);

  const filteredData = useMemo(() => {
    if (period === 'ALL' || equityData.length === 0) return equityData;

    const now = new Date();
    let cutoff: Date;
    switch (period) {
      case '1W':
        cutoff = subWeeks(now, 1);
        break;
      case '1M':
        cutoff = subMonths(now, 1);
        break;
      case '3M':
        cutoff = subMonths(now, 3);
        break;
      case '6M':
        cutoff = subMonths(now, 6);
        break;
      default:
        return equityData;
    }

    return equityData.filter((d) => isAfter(parseISO(d.date), cutoff));
  }, [equityData, period]);

  const currentEquity = filteredData.length > 0 ? filteredData[filteredData.length - 1].equity : seed;
  const isProfit = currentEquity >= seed;

  const strokeColor = isProfit ? '#10b981' : '#ef4444';
  const gradientId = isProfit ? 'equityGradientProfit' : 'equityGradientLoss';

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatXAxis = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'M/d');
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload as EquityDataPoint;
    const date = parseISO(data.date);
    const dateStr = format(date, 'yyyy년 M월 d일');

    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{dateStr}</p>
        <p className="text-slate-600 dark:text-slate-400">
          자산: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(data.equity, seedCurrency)}</span>
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          변동:{' '}
          <span className={`font-semibold ${data.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrencyWithSign(data.change, seedCurrency)}
          </span>
        </p>
      </div>
    );
  };

  if (journals.length === 0) {
    return (
      <DashboardCard>
        <CardHeader
          icon={<Activity className="w-4 h-4 text-emerald-500" />}
          title="자산 추이"
        />
        <div className="flex items-center justify-center h-64 text-sm text-slate-400 dark:text-slate-500">
          매매 기록이 없습니다.
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <CardHeader
        icon={<Activity className="w-4 h-4 text-emerald-500" />}
        title="자산 추이"
        action={
          <div className="flex gap-1">
            {periodButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setPeriod(btn.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  period === btn.value
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        }
      />
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            width={55}
            domain={[
              (dataMin: number) => {
                const padding = (dataMin) * 0.02;
                return Math.max(0, Math.floor((dataMin - padding) / 100000) * 100000);
              },
              (dataMax: number) => {
                const padding = (dataMax) * 0.02;
                return Math.ceil((dataMax + padding) / 100000) * 100000;
              }
            ]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={seed}
            stroke="#94a3b8"
            strokeDasharray="5 5"
            label={{ value: '시작 시드', position: 'insideTopRight', fontSize: 11, fill: '#94a3b8' }}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={strokeColor}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 5, stroke: strokeColor, strokeWidth: 2, fill: '#ffffff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
}
