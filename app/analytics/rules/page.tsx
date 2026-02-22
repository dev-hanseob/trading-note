'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Trophy, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, TooltipProps,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import {
    getTradingRuleStats,
    getTradingRulePerformance,
    getJournalAnalyticsByRules,
} from '@/lib/api/tradingRule';
import {
    RulePerformanceResponse,
} from '@/type/domain/tradingRule';
import { EmotionTypeLabel } from '@/type/domain/journal.enum';

const EMOTION_CHART_COLORS: Record<string, string> = {
    CALM: '#3b82f6',
    CONFIDENT: '#10b981',
    FOMO: '#f97316',
    REVENGE: '#ef4444',
    ANXIOUS: '#a855f7',
    TIRED: '#64748b',
};

function ComplianceRing({ rate, size = 120 }: { rate: number; size?: number }) {
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (rate / 100) * circumference;

    return (
        <div className="relative">
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-200 dark:text-slate-800"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {rate.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">준수율</span>
            </div>
        </div>
    );
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl lg:col-span-2" />
                    </div>
                    <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                    <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export default function RulesAnalyticsPage() {
    const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery({
        queryKey: ['tradingRuleStats'],
        queryFn: getTradingRuleStats,
    });

    const { data: analytics, isLoading: isLoadingAnalytics, error: analyticsError } = useQuery({
        queryKey: ['journalAnalyticsByRules'],
        queryFn: getJournalAnalyticsByRules,
    });

    const { data: performances = [] } = useQuery({
        queryKey: ['tradingRulePerformances', stats?.ruleStats],
        queryFn: async () => {
            if (!stats || stats.ruleStats.length === 0) return [];
            const perfPromises = stats.ruleStats.map((r) =>
                getTradingRulePerformance(r.ruleId).catch(() => null)
            );
            const perfResults = await Promise.all(perfPromises);
            return perfResults.filter((p): p is RulePerformanceResponse => p !== null);
        },
        enabled: !!stats && stats.ruleStats.length > 0,
    });

    const isLoading = isLoadingStats || isLoadingAnalytics;
    const error = statsError || analyticsError;

    if (isLoading) return <LoadingSkeleton />;

    if (error || !stats || !analytics) {
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
                        <p className="text-slate-500 dark:text-slate-400">
                            {error ? '데이터를 불러오는데 실패했습니다.' : '데이터를 불러올 수 없습니다.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Monthly comparison
    const monthlyRates = stats.monthlyComplianceRates;
    const currentMonth = monthlyRates.length > 0 ? monthlyRates[monthlyRates.length - 1] : null;
    const lastMonth = monthlyRates.length > 1 ? monthlyRates[monthlyRates.length - 2] : null;
    const monthDiff = currentMonth && lastMonth ? currentMonth.rate - lastMonth.rate : null;

    // Sort performances by impact (difference between checked vs unchecked win rate)
    const sortedPerformances = [...performances].sort((a, b) => {
        const aDiff = a.checkedStats.winRate - a.uncheckedStats.winRate;
        const bDiff = b.checkedStats.winRate - b.uncheckedStats.winRate;
        return bDiff - aDiff;
    });

    // Chart data for monthly trend
    const monthlyChartData = monthlyRates.map((m) => ({
        month: m.month,
        rate: Number(m.rate.toFixed(1)),
        journalCount: m.journalCount,
    }));

    const formatMonth = (monthStr: string) => {
        const parts = monthStr.split('-');
        return `${parseInt(parts[1])}월`;
    };

    // Emotion chart data
    const emotionData = analytics.complianceByEmotion.map((e) => ({
        emotion: e.emotion,
        name: (EmotionTypeLabel as Record<string, string>)[e.emotion] || e.emotion,
        complianceRate: Number(e.avgComplianceRate.toFixed(1)),
        avgProfit: Math.round(e.avgProfit),
    }));

    const MonthlyTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (!active || !payload || !payload.length) return null;
        const data = payload[0].payload;
        const [year, month] = data.month.split('-');
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {year}년 {parseInt(month)}월
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    준수율: <span className="font-semibold tabular-nums text-emerald-500">{data.rate}%</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    거래 수: <span className="font-semibold tabular-nums">{data.journalCount}건</span>
                </p>
            </div>
        );
    };

    const EmotionTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (!active || !payload || !payload.length) return null;
        const data = payload[0].payload;
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {data.name}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    준수율: <span className="font-semibold tabular-nums text-emerald-500">{data.complianceRate}%</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    평균 손익:{' '}
                    <span className={`font-semibold tabular-nums ${data.avgProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {data.avgProfit >= 0 ? '+' : ''}{data.avgProfit.toLocaleString('ko-KR')}원
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
                        <span className="text-slate-600 dark:text-slate-300">매매원칙 분석</span>
                    </div>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        매매원칙 분석
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        규칙별 성과와 준수율을 분석합니다.
                    </p>
                </div>

                {/* Section 1: Overview - Free */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* Compliance Rate */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
                        <ComplianceRing rate={stats.overallComplianceRate} />
                        <div className="mt-4 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                전체 준수율
                            </p>
                            {monthDiff !== null && (
                                <p className={`text-xs font-medium mt-1 tabular-nums ${
                                    monthDiff >= 0 ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                    전월 대비 {monthDiff >= 0 ? '+' : ''}{monthDiff.toFixed(1)}%p
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stats summary */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                            요약
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">전체 거래</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                                    {stats.totalJournals.toLocaleString('ko-KR')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">원칙 적용 거래</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                                    {stats.journalsWithRules.toLocaleString('ko-KR')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">활성 규칙</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                                    {stats.ruleStats.filter(r => r.isActive).length}개
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">이번 달 준수율</p>
                                <p className="text-xl font-bold text-emerald-500 tabular-nums mt-1">
                                    {currentMonth ? `${currentMonth.rate.toFixed(1)}%` : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Monthly Trend */}
                {monthlyChartData.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                            월별 준수율 추이
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickFormatter={formatMonth}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(v) => `${v}%`}
                                    width={45}
                                />
                                <Tooltip content={<MonthlyTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="rate"
                                    stroke="#10b981"
                                    strokeWidth={2.5}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Section 3: Rule Performance Table */}
                {sortedPerformances.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                규칙별 성과 비교
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                규칙 준수 시와 미준수 시의 성과 차이를 비교합니다
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            규칙
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            체크율
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            승률 (준수)
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            승률 (미준수)
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            평균손익 (준수)
                                        </th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            평균손익 (미준수)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {sortedPerformances.map((perf) => {
                                        const winDiff = perf.checkedStats.winRate - perf.uncheckedStats.winRate;
                                        const ruleStat = stats.ruleStats.find(r => r.ruleId === perf.ruleId);
                                        const checkRate = ruleStat ? ruleStat.checkRate : 0;

                                        return (
                                            <tr key={perf.ruleId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-3 text-slate-900 dark:text-white font-medium">
                                                    {perf.label}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                                                    {checkRate.toFixed(1)}%
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    <span className={winDiff >= 0 ? 'text-emerald-500 font-semibold' : 'text-slate-700 dark:text-slate-300'}>
                                                        {perf.checkedStats.winRate.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    <span className={winDiff < 0 ? 'text-emerald-500 font-semibold' : 'text-slate-700 dark:text-slate-300'}>
                                                        {perf.uncheckedStats.winRate.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    <span className={perf.checkedStats.avgProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                        {perf.checkedStats.avgProfit >= 0 ? '+' : ''}
                                                        {Math.round(perf.checkedStats.avgProfit).toLocaleString('ko-KR')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right tabular-nums">
                                                    <span className={perf.uncheckedStats.avgProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                        {perf.uncheckedStats.avgProfit >= 0 ? '+' : ''}
                                                        {Math.round(perf.uncheckedStats.avgProfit).toLocaleString('ko-KR')}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Section 4: Rankings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Best Rules */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                최고 성과 규칙
                            </h3>
                        </div>
                        {analytics.topPerformingRules.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.topPerformingRules.map((rule, idx) => (
                                    <div
                                        key={rule.ruleId}
                                        className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 rounded-full tabular-nums">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                    {rule.label}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                                                    승률 {rule.winRate.toFixed(1)}% | {rule.tradeCount}건
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`flex items-center gap-0.5 text-sm font-semibold tabular-nums flex-shrink-0 ${
                                            rule.avgProfit >= 0 ? 'text-emerald-500' : 'text-red-500'
                                        }`}>
                                            {rule.avgProfit >= 0 ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4" />
                                            )}
                                            {rule.avgProfit >= 0 ? '+' : ''}
                                            {Math.round(rule.avgProfit).toLocaleString('ko-KR')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                                충분한 데이터가 없습니다
                            </p>
                        )}
                    </div>

                    {/* Most Ignored Rules */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                가장 무시된 규칙
                            </h3>
                        </div>
                        {analytics.mostIgnoredRules.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.mostIgnoredRules.map((rule, idx) => (
                                    <div
                                        key={rule.ruleId}
                                        className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 rounded-full tabular-nums">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                    {rule.label}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                                                    무시율 {rule.ignoreRate.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-semibold tabular-nums flex-shrink-0 ${
                                            rule.missedProfit >= 0 ? 'text-emerald-500' : 'text-red-500'
                                        }`}>
                                            {rule.missedProfit >= 0 ? '+' : ''}
                                            {Math.round(rule.missedProfit).toLocaleString('ko-KR')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                                충분한 데이터가 없습니다
                            </p>
                        )}
                    </div>
                </div>

                {/* Section 5: Emotion vs Compliance */}
                {emotionData.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                            감정별 준수율 및 손익
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={emotionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    domain={[0, 100]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(v) => `${v}%`}
                                    width={45}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(v) => {
                                        if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
                                        if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}K`;
                                        return v.toString();
                                    }}
                                    width={50}
                                />
                                <Tooltip content={<EmotionTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                                <Bar yAxisId="left" dataKey="complianceRate" radius={[4, 4, 0, 0]} barSize={32}>
                                    {emotionData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={EMOTION_CHART_COLORS[entry.emotion] || '#64748b'}
                                            opacity={0.8}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Legend cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                            {emotionData.map((e) => (
                                <div
                                    key={e.emotion}
                                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: EMOTION_CHART_COLORS[e.emotion] || '#64748b' }}
                                        />
                                        <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                                            {e.name}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-900 dark:text-white tabular-nums flex-shrink-0 ml-2">
                                        {e.complianceRate}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
