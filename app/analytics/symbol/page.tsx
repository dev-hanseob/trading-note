'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatCurrencyWithSign } from '@/lib/currency';
import { useSeed } from '@/hooks/useSeed';
import { useAllJournals } from '@/hooks/useJournals';

interface SymbolData {
    symbol: string;
    count: number;
    winCount: number;
    winRate: number;
    totalPnl: number;
    avgPnl: number;
    avgRoi: number;
}

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

export default function SymbolAnalyticsPage() {
    const { data: journals = [], isLoading, error } = useAllJournals();
    const { seedCurrency } = useSeed();

    const symbolData = useMemo(() => {
        const symbolMap = new Map<string, { count: number; winCount: number; totalPnl: number; totalRoi: number }>();

        for (const j of journals) {
            const sym = j.symbol?.trim();
            if (!sym) continue;

            const entry = symbolMap.get(sym) || { count: 0, winCount: 0, totalPnl: 0, totalRoi: 0 };
            entry.count++;
            entry.totalPnl += j.profit;
            entry.totalRoi += j.roi || 0;
            if (j.profit > 0) entry.winCount++;
            symbolMap.set(sym, entry);
        }

        const result: SymbolData[] = [];
        for (const [symbol, entry] of symbolMap) {
            result.push({
                symbol,
                count: entry.count,
                winCount: entry.winCount,
                winRate: entry.count > 0 ? (entry.winCount / entry.count) * 100 : 0,
                totalPnl: entry.totalPnl,
                avgPnl: entry.count > 0 ? entry.totalPnl / entry.count : 0,
                avgRoi: entry.count > 0 ? entry.totalRoi / entry.count : 0,
            });
        }

        // Sort by total P&L descending
        result.sort((a, b) => b.totalPnl - a.totalPnl);
        return result;
    }, [journals]);

    // Limit chart to top 15 symbols for readability
    const chartData = useMemo(() => symbolData.slice(0, 15), [symbolData]);
    const chartHeight = useMemo(() => Math.max(300, chartData.length * 40), [chartData]);

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

    const formatXAxis = (value: number) => {
        if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
        if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
    };

    const SymbolTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;
        const data = payload[0].payload as SymbolData;
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {data.symbol}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    거래 수: <span className="font-semibold tabular-nums">{data.count}건</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    승률: <span className="font-semibold tabular-nums">{data.winRate.toFixed(1)}%</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    총 손익:{' '}
                    <span className={`font-semibold tabular-nums ${data.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatCurrencyWithSign(Math.round(data.totalPnl), seedCurrency)}
                    </span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    평균 ROI:{' '}
                    <span className={`font-semibold tabular-nums ${data.avgRoi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {data.avgRoi >= 0 ? '+' : ''}{data.avgRoi.toFixed(2)}%
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
                        <span className="text-slate-600 dark:text-slate-300">종목별 분석</span>
                    </div>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-amber-500" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                            종목별 분석
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        종목(심볼)에 따른 거래 성과를 분석합니다.
                    </p>
                </div>

                {journals.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                        <p className="text-slate-500 dark:text-slate-400">
                            매매 기록이 없습니다.
                        </p>
                    </div>
                ) : symbolData.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                        <p className="text-slate-500 dark:text-slate-400">
                            종목 정보가 있는 거래가 없습니다.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Horizontal Bar Chart - Total P&L by Symbol */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                                종목별 총 손익
                            </h3>
                            {symbolData.length > 15 && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                                    상위 15개 종목을 표시합니다 (전체 {symbolData.length}개)
                                </p>
                            )}
                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <BarChart
                                    data={chartData}
                                    layout="vertical"
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                                    <XAxis
                                        type="number"
                                        tickFormatter={formatXAxis}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="symbol"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                        width={80}
                                    />
                                    <Tooltip content={<SymbolTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                                    <Bar dataKey="totalPnl" radius={[0, 4, 4, 0]} barSize={24}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.totalPnl >= 0 ? '#10b981' : '#ef4444'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Symbol Table */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                    종목별 상세 통계
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                종목
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
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                총 손익
                                            </th>
                                            <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                평균 ROI
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {symbolData.map((sym) => (
                                            <tr key={sym.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-3 text-slate-900 dark:text-white font-medium">
                                                    {sym.symbol}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                                                    {sym.count}건
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                                                    {sym.winRate.toFixed(1)}%
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    <span className={sym.avgPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                        {formatCurrencyWithSign(Math.round(sym.avgPnl), seedCurrency)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    <span className={sym.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                        {formatCurrencyWithSign(Math.round(sym.totalPnl), seedCurrency)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right tabular-nums">
                                                    <span className={sym.avgRoi >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                        {sym.avgRoi >= 0 ? '+' : ''}{sym.avgRoi.toFixed(2)}%
                                                    </span>
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
