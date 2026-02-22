'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getDay, parseISO } from 'date-fns';
import { formatCurrencyWithSign } from '@/lib/currency';
import { useSeed } from '@/hooks/useSeed';
import { useAllJournals } from '@/hooks/useJournals';

interface DayData {
    dayIndex: number;
    label: string;
    count: number;
    winCount: number;
    winRate: number;
    totalPnl: number;
    avgPnl: number;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                    </div>
                    <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export default function DayAnalyticsPage() {
    const { data: journals = [], isLoading, error } = useAllJournals();
    const { seedCurrency } = useSeed();

    const dayData = useMemo(() => {
        // Initialize Mon(1) to Sun(0) - reorder to Mon~Sun for Korean convention
        const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
        const dayMap = new Map<number, { count: number; winCount: number; totalPnl: number }>();

        for (const idx of dayOrder) {
            dayMap.set(idx, { count: 0, winCount: 0, totalPnl: 0 });
        }

        for (const j of journals) {
            if (!j.tradedAt) continue;
            try {
                const date = parseISO(j.tradedAt);
                const dayIndex = getDay(date); // 0=Sun, 1=Mon, ...
                const entry = dayMap.get(dayIndex);
                if (!entry) continue;
                entry.count++;
                entry.totalPnl += j.profit;
                if (j.profit > 0) entry.winCount++;
            } catch {
                // skip invalid dates
            }
        }

        const result: DayData[] = dayOrder.map((dayIndex) => {
            const entry = dayMap.get(dayIndex)!;
            return {
                dayIndex,
                label: DAY_LABELS[dayIndex],
                count: entry.count,
                winCount: entry.winCount,
                winRate: entry.count > 0 ? (entry.winCount / entry.count) * 100 : 0,
                totalPnl: entry.totalPnl,
                avgPnl: entry.count > 0 ? entry.totalPnl / entry.count : 0,
            };
        });

        return result;
    }, [journals]);

    if (isLoading) return <LoadingSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
                    <Link
                        href="/analytics"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        분석으로 돌아가기
                    </Link>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
                        <p className="text-slate-500 dark:text-slate-400">Failed to load journal data.</p>
                    </div>
                </div>
            </div>
        );
    }

    const formatYAxis = (value: number) => {
        if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
        if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
    };

    const DayTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;
        const data = payload[0].payload as DayData;
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {data.label}요일
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    거래 수: <span className="font-semibold tabular-nums">{data.count}건</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    승률: <span className="font-semibold tabular-nums">{data.winRate.toFixed(1)}%</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    평균 손익:{' '}
                    <span className={`font-semibold tabular-nums ${data.avgPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatCurrencyWithSign(Math.round(data.avgPnl), seedCurrency)}
                    </span>
                </p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
                {/* Breadcrumb & Back */}
                <div className="mb-6">
                    <Link
                        href="/analytics"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        분석으로 돌아가기
                    </Link>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 dark:text-slate-500">
                        <span>분석</span>
                        <span>/</span>
                        <span className="text-slate-600 dark:text-slate-300">요일별 분석</span>
                    </div>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-violet-500" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                            요일별 분석
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        요일에 따른 거래 성과를 분석합니다.
                    </p>
                </div>

                {journals.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                        <p className="text-slate-500 dark:text-slate-400">
                            매매 기록이 없습니다.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Day of Week Bar Chart - Avg P&L */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                                요일별 평균 손익
                            </h3>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={dayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 13, fill: '#94a3b8' }}
                                    />
                                    <YAxis
                                        tickFormatter={formatYAxis}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                        width={55}
                                    />
                                    <Tooltip content={<DayTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                                    <Bar dataKey="avgPnl" radius={[4, 4, 0, 0]} barSize={48}>
                                        {dayData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.avgPnl >= 0 ? '#10b981' : '#ef4444'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Day of Week Table */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                    요일별 상세 통계
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                요일
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                거래 수
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                승률
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                평균 손익
                                            </th>
                                            <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                총 손익
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {dayData.map((day) => (
                                            <tr key={day.dayIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-3 text-slate-900 dark:text-white font-medium">
                                                    {day.label}요일
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                                                    {day.count}건
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                                                    {day.count > 0 ? `${day.winRate.toFixed(1)}%` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    {day.count > 0 ? (
                                                        <span className={day.avgPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                            {formatCurrencyWithSign(Math.round(day.avgPnl), seedCurrency)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-500">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-right tabular-nums">
                                                    {day.count > 0 ? (
                                                        <span className={day.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                            {formatCurrencyWithSign(Math.round(day.totalPnl), seedCurrency)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-500">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
