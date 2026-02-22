'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    TooltipProps,
} from 'recharts';
import { formatCurrencyWithSign } from '@/lib/currency';
import { useSeed } from '@/hooks/useSeed';
import { useAllJournals } from '@/hooks/useJournals';

interface HourData {
    hour: number;
    label: string;
    count: number;
}

interface TimeSlotData {
    slot: string;
    label: string;
    count: number;
    winCount: number;
    winRate: number;
    totalPnl: number;
    avgPnl: number;
}

const TIME_SLOTS = [
    { slot: 'dawn', label: '새벽 (00-06시)', start: 0, end: 6 },
    { slot: 'morning', label: '오전 (06-12시)', start: 6, end: 12 },
    { slot: 'afternoon', label: '오후 (12-18시)', start: 12, end: 18 },
    { slot: 'night', label: '야간 (18-24시)', start: 18, end: 24 },
];

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

export default function TimeAnalyticsPage() {
    const { data: journals = [], isLoading, error } = useAllJournals();
    const { seedCurrency } = useSeed();

    const hourData = useMemo(() => {
        const hours: HourData[] = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            label: `${i}시`,
            count: 0,
        }));

        for (const j of journals) {
            if (!j.tradedAt) continue;
            try {
                const date = new Date(j.tradedAt);
                const hour = date.getHours();
                hours[hour].count++;
            } catch {
                // skip invalid dates
            }
        }

        return hours;
    }, [journals]);

    const timeSlotData = useMemo(() => {
        const slots: TimeSlotData[] = TIME_SLOTS.map((s) => ({
            slot: s.slot,
            label: s.label,
            count: 0,
            winCount: 0,
            winRate: 0,
            totalPnl: 0,
            avgPnl: 0,
        }));

        for (const j of journals) {
            if (!j.tradedAt) continue;
            try {
                const date = new Date(j.tradedAt);
                const hour = date.getHours();
                const slotIndex = TIME_SLOTS.findIndex(
                    (s) => hour >= s.start && hour < s.end
                );
                if (slotIndex === -1) continue;

                slots[slotIndex].count++;
                slots[slotIndex].totalPnl += j.profit;
                if (j.profit > 0) slots[slotIndex].winCount++;
            } catch {
                // skip invalid dates
            }
        }

        for (const slot of slots) {
            slot.winRate = slot.count > 0 ? (slot.winCount / slot.count) * 100 : 0;
            slot.avgPnl = slot.count > 0 ? slot.totalPnl / slot.count : 0;
        }

        return slots;
    }, [journals]);

    const maxCount = useMemo(() => Math.max(...hourData.map((d) => d.count), 1), [hourData]);

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

    const HourTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (!active || !payload || !payload.length) return null;
        const data = payload[0].payload as HourData;
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {data.hour}시 ~ {data.hour + 1}시
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    거래 수: <span className="font-semibold tabular-nums">{data.count}건</span>
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
                        <span className="text-slate-600 dark:text-slate-300">시간대별 분석</span>
                    </div>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-500" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                            시간대별 분석
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        거래 시간대에 따른 성과를 분석합니다.
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
                        {/* Hourly Bar Chart */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                                시간별 거래 빈도
                            </h3>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={hourData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        interval={1}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                        allowDecimals={false}
                                        width={35}
                                    />
                                    <Tooltip content={<HourTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {hourData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.count > 0
                                                    ? `rgba(16, 185, 129, ${0.3 + (entry.count / maxCount) * 0.7})`
                                                    : 'rgba(148, 163, 184, 0.2)'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Time Slot Table */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                    시간대별 상세 통계
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                시간대
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                거래 수
                                            </th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                승률
                                            </th>
                                            <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                평균 손익
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {timeSlotData.map((slot) => (
                                            <tr key={slot.slot} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-3 text-slate-900 dark:text-white font-medium">
                                                    {slot.label}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                                                    {slot.count}건
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                                                    {slot.count > 0 ? `${slot.winRate.toFixed(1)}%` : '-'}
                                                </td>
                                                <td className="px-6 py-3 text-right tabular-nums">
                                                    {slot.count > 0 ? (
                                                        <span className={slot.avgPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                            {formatCurrencyWithSign(Math.round(slot.avgPnl), seedCurrency)}
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
