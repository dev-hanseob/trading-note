'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListChecks, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { getTradingRuleStats, getJournalAnalyticsByRules } from '@/lib/api/tradingRule';
import { TradingRuleStatsResponse, RuleAnalyticsResponse } from '@/type/domain/tradingRule';

export default function RuleInsights() {
    const [stats, setStats] = useState<TradingRuleStatsResponse | null>(null);
    const [analytics, setAnalytics] = useState<RuleAnalyticsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            try {
                const [statsData, analyticsData] = await Promise.all([
                    getTradingRuleStats(),
                    getJournalAnalyticsByRules(),
                ]);
                if (!cancelled) {
                    setStats(statsData);
                    setAnalytics(analyticsData);
                }
            } catch {
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchData();
        return () => { cancelled = true; };
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="flex-1 space-y-3">
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return null;
    }

    const hasData = stats.ruleStats.length > 0 && stats.journalsWithRules > 0;

    if (!hasData) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <ListChecks className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        매매원칙 인사이트
                    </h3>
                </div>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        매매 원칙을 설정하면 분석을 확인할 수 있습니다
                    </p>
                    <Link
                        href="/settings"
                        className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
                    >
                        설정으로 이동
                    </Link>
                </div>
            </div>
        );
    }

    const complianceRate = stats.overallComplianceRate;
    const topRules = analytics?.topPerformingRules?.slice(0, 3) ?? [];

    // SVG circular progress
    const size = 96;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (complianceRate / 100) * circumference;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        매매원칙 인사이트
                    </h3>
                </div>
                <Link
                    href="/analytics/rules"
                    className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                    상세 분석
                    <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {/* Content */}
            <div className="flex items-center gap-5">
                {/* Circular Progress */}
                <div className="relative flex-shrink-0">
                    <svg width={size} height={size} className="-rotate-90">
                        {/* Background circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-slate-200 dark:text-slate-800"
                        />
                        {/* Progress circle */}
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
                        <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                            {complianceRate.toFixed(0)}%
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">준수율</span>
                    </div>
                </div>

                {/* Top Rules */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                        상위 규칙 성과
                    </p>
                    {topRules.length > 0 ? (
                        <div className="space-y-2">
                            {topRules.map((rule) => (
                                <div key={rule.ruleId} className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                                        {rule.label}
                                    </span>
                                    <span
                                        className={`flex items-center gap-0.5 text-xs font-semibold tabular-nums flex-shrink-0 ${
                                            rule.avgProfit >= 0
                                                ? 'text-emerald-500'
                                                : 'text-red-500'
                                        }`}
                                    >
                                        {rule.avgProfit >= 0 ? (
                                            <TrendingUp className="w-3 h-3" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3" />
                                        )}
                                        {rule.avgProfit >= 0 ? '+' : ''}
                                        {Math.round(rule.avgProfit).toLocaleString('ko-KR')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            충분한 데이터가 없습니다
                        </p>
                    )}
                </div>
            </div>

            {/* Footer stats */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    원칙 적용 거래:{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {stats.journalsWithRules}/{stats.totalJournals}
                    </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    활성 규칙:{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {stats.ruleStats.filter(r => r.isActive).length}개
                    </span>
                </div>
            </div>
        </div>
    );
}
