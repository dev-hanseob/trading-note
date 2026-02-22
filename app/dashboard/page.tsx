'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { SlidersHorizontal, Flag } from 'lucide-react';
import SeedSettingModal from '@/components/SeedSettingModal';
import GoalSettingModal from '@/components/GoalSettingModal';
import GoalDashboard from '@/components/GoalDashboard';
import JournalDetailModal from '@/components/JournalDetailModal';
import { getTradingRuleStats } from '@/lib/api/tradingRule';
import { Journal } from '@/type/domain/journal';
import { useSeed } from '@/hooks/useSeed';
import { useAllJournals } from '@/hooks/useJournals';
import TodaySummary from '@/components/dashboard/TodaySummary';
import StatCards from '@/components/dashboard/StatCards';
import RecentTrades from '@/components/dashboard/RecentTrades';
import DateRangeFilter, { DatePreset } from '@/components/dashboard/DateRangeFilter';
import CalendarHeatmap from '@/components/dashboard/CalendarHeatmap';
import MobileDashboardTabs, { DashboardTab } from '@/components/dashboard/MobileDashboardTabs';
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState';
import { subWeeks, subMonths, startOfYear, parseISO, isAfter } from 'date-fns';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeBanner from '@/components/UpgradeBanner';

const EquityCurve = dynamic(
    () => import('@/components/dashboard/EquityCurve'),
    { ssr: false }
);

const MonthlyPnlChart = dynamic(
    () => import('@/components/dashboard/MonthlyPnlChart'),
    { ssr: false }
);

const EmotionStats = dynamic(
    () => import('@/components/dashboard/EmotionStats'),
    { ssr: false }
);

const RuleInsights = dynamic(
    () => import('@/components/dashboard/RuleInsights'),
    { ssr: false }
);

function filterByDatePreset(journals: Journal[], preset: DatePreset): Journal[] {
    if (preset === 'ALL') return journals;

    const now = new Date();
    let cutoff: Date;
    switch (preset) {
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
        case 'YTD':
            cutoff = startOfYear(now);
            break;
        default:
            return journals;
    }

    return journals.filter((j) => isAfter(parseISO(j.tradedAt), cutoff));
}

export default function DashboardPage() {
    const { seed: totalSeed, seedCurrency, updateSeed, isLoading: isSeedLoading } = useSeed();
    const { data: allJournals = [], isLoading: isLoadingJournals, error: journalsError } = useAllJournals();
    const error = journalsError ? '데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.' : null;
    const [showSeedModal, setShowSeedModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [datePreset, setDatePreset] = useState<DatePreset>('ALL');

    const [ruleComplianceRate, setRuleComplianceRate] = useState(0);
    const [hasRules, setHasRules] = useState(false);
    const [mobileTab, setMobileTab] = useState<DashboardTab>('summary');

    const [detailTarget, setDetailTarget] = useState<Journal | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        getTradingRuleStats()
            .then(stats => {
                setRuleComplianceRate(stats.overallComplianceRate);
                setHasRules(stats.ruleStats.length > 0);
            })
            .catch(() => {
                setRuleComplianceRate(0);
                setHasRules(false);
            });
    }, []);

    const tableData = useMemo(
        () => filterByDatePreset(allJournals, datePreset),
        [allJournals, datePreset]
    );

    const subscription = useSubscription();

    const totalProfit = tableData.reduce((sum, e) => sum + e.profit, 0);
    const totalRoi = totalSeed && totalSeed > 0 ? (totalProfit / totalSeed) * 100 : 0;
    const winCount = tableData.filter(j => j.profit > 0).length;
    const winRate = tableData.length > 0 ? (winCount / tableData.length) * 100 : 0;
    const tradeCount = tableData.length;

    if (isSeedLoading || isLoadingJournals) {
        return (
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-screen">
                <div className="animate-pulse space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                        <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    대시보드
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <DateRangeFilter value={datePreset} onChange={setDatePreset} />
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setShowSeedModal(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors"
                        >
                            <SlidersHorizontal size={12} />
                            시드
                        </button>
                        <button
                            onClick={() => setShowGoalModal(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors"
                        >
                            <Flag size={12} />
                            목표
                        </button>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-sm text-red-500 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Empty State - Onboarding */}
            {allJournals.length === 0 ? (
                <DashboardEmptyState
                    hasSeed={totalSeed > 0}
                    hasRules={hasRules}
                    onOpenSeedModal={() => setShowSeedModal(true)}
                />
            ) : (
                <>
                    {/* Upgrade Banner */}
                    {(subscription.effectiveTier === 'FREE' || subscription.isTrialActive) && (
                        <div className="mb-4">
                            <UpgradeBanner
                                tradesUsed={subscription.tradesUsed}
                                tradeLimit={subscription.tradeLimit}
                                usagePercent={subscription.usagePercent}
                                isTrialActive={subscription.isTrialActive}
                                trialDaysLeft={subscription.trialDaysLeft}
                            />
                        </div>
                    )}

                    {/* Today Summary */}
                    <div className="mb-4">
                        <TodaySummary journals={allJournals} seedCurrency={seedCurrency} />
                    </div>

                    {/* Stat Cards - always visible */}
                    <StatCards
                        totalSeed={totalSeed}
                        totalProfit={totalProfit}
                        totalRoi={totalRoi}
                        winRate={winRate}
                        tradeCount={tradeCount}
                        journals={tableData}
                        ruleComplianceRate={ruleComplianceRate}
                        seedCurrency={seedCurrency}
                    />

                    {/* Mobile Tab Navigation */}
                    <MobileDashboardTabs activeTab={mobileTab} onChange={setMobileTab} />

                    {/* Summary tab: Recent Trades */}
                    <div className={`lg:block ${mobileTab === 'summary' ? 'block' : 'hidden'}`}>
                        <div className="mt-4">
                            <RecentTrades
                                journals={tableData}
                                onSelect={(journal) => {
                                    setDetailTarget(journal);
                                    setShowDetailModal(true);
                                }}
                                seedCurrency={seedCurrency}
                            />
                        </div>
                    </div>

                    {/* Charts tab: EquityCurve, Calendar, MonthlyPnl */}
                    <div className={`lg:block ${mobileTab === 'charts' ? 'block' : 'hidden'}`}>
                        <div className="mt-4">
                            <EquityCurve journals={tableData} seed={totalSeed} seedCurrency={seedCurrency} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                            <CalendarHeatmap journals={allJournals} seedCurrency={seedCurrency} />
                            <MonthlyPnlChart journals={tableData} seedCurrency={seedCurrency} />
                        </div>
                    </div>

                    {/* Mindset tab: RuleInsights, EmotionStats */}
                    <div className={`lg:block ${mobileTab === 'mindset' ? 'block' : 'hidden'}`}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                            <RuleInsights />
                            <EmotionStats journals={tableData} />
                        </div>
                    </div>

                    {/* Goals tab */}
                    <div className={`lg:block ${mobileTab === 'goals' ? 'block' : 'hidden'}`}>
                        <div className="mt-4">
                            <GoalDashboard
                                currentProfit={totalProfit}
                                totalSeed={totalSeed}
                                currentRoi={totalRoi}
                                compact
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Modals */}
            {showDetailModal && detailTarget && (
                <JournalDetailModal
                    journal={detailTarget}
                    onClose={() => {
                        setShowDetailModal(false);
                        setDetailTarget(null);
                    }}
                    onEdit={() => {
                        setShowDetailModal(false);
                    }}
                    onDelete={() => {
                        setShowDetailModal(false);
                        setDetailTarget(null);
                    }}
                    totalSeed={totalSeed}
                />
            )}

            {showSeedModal && (
                <SeedSettingModal
                    isOpen={showSeedModal}
                    handleClose={() => setShowSeedModal(false)}
                    handleSave={updateSeed}
                    currentSeed={totalSeed}
                    currentCurrency={seedCurrency}
                />
            )}

            {showGoalModal && (
                <GoalSettingModal
                    isOpen={showGoalModal}
                    handleClose={() => setShowGoalModal(false)}
                    seedCurrency={seedCurrency}
                />
            )}
        </div>
    );
}
