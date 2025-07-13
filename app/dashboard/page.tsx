'use client';

import {useEffect, useMemo, useState} from 'react';
import dynamic from 'next/dynamic';
import {parseISO, subMonths, subWeeks} from 'date-fns';
import {ChevronDown, ChevronUp, Settings, TrendingUp, Target} from 'lucide-react';
import {AnimatePresence, motion} from 'framer-motion';
import SeedSettingModal from '@/components/SeedSettingModal';
import GoalSettingModal from '@/components/GoalSettingModal';
import GoalDashboard from '@/components/GoalDashboard';
import {getJournals} from '@/lib/api/journal';
import {Journal} from "@/type/domain/journal";
import {useSeed} from '@/hooks/useSeed';
import AdBanner from '@/components/AdBanner';

const SeedChart = dynamic(
    () => import('@/components/SeedChartRecharts'),
    { ssr: false }
);

export default function DashboardPage() {
    const { seed: totalSeed, updateSeed, isLoading: isSeedLoading } = useSeed();
    const [chartData, setChartData] = useState<any[]>([]);
    const [tableData, setTableData] = useState<Journal[]>([]);
    const [range, setRange] = useState<'1W' | '1M' | '3M' | '6M' | 'ALL'>('ALL');
    const [showChartSection, setShowChartSection] = useState(true);
    const [showGoalSection, setShowGoalSection] = useState(true);
    const [showSeedModal, setShowSeedModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);

    useEffect(() => {
        fetch('/mock_chart_trade_data_100.json')
            .then((res) => res.json())
            .then((data) => setChartData(data));

        getJournals({ page: 1, pageSize: 1000 })
            .then((res) => {
                setTableData(res.journals);
            })
            .catch((error) => {
                console.error('⛔️ 매매일지 조회 실패:', error);
            });
    }, []);

    const filteredChartData = useMemo(() => {
        if (range === 'ALL') return chartData;

        const now = new Date();
        let from = new Date(now);

        switch (range) {
            case '1W': from = subWeeks(now, 1); break;
            case '1M': from = subMonths(now, 1); break;
            case '3M': from = subMonths(now, 3); break;
            case '6M': from = subMonths(now, 6); break;
        }

        return chartData.filter((d) => parseISO(d.time) >= from);
    }, [chartData, range]);

    const totalProfit = tableData.reduce((sum, e) => {
        return sum + e.profit;
    }, 0);

    const totalRoi = (totalProfit / totalSeed) * 100;

    if (isSeedLoading) {
        return (
            <div className="flex justify-center w-full px-2 sm:px-4 relative z-0">
                <aside className="hidden 2xl:block w-[240px] p-3">
                    <AdBanner position="left" />
                </aside>
                <main className="w-full max-w-[1400px] px-2 sm:px-4 min-h-screen relative z-0">
                    <div className="p-4 sm:p-6 flex justify-center">
                        <div className="w-full max-w-[1400px] space-y-4">
                            <div className="animate-pulse">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
                                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </main>
                <aside className="hidden 2xl:block w-[240px] p-3">
                    <AdBanner position="right" />
                </aside>
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full px-2 sm:px-4 relative z-0">
            <aside className="hidden 2xl:block w-[240px] p-3">
                <AdBanner position="left" />
            </aside>
            <main className="w-full max-w-[1400px] px-2 sm:px-4 min-h-screen relative z-0">
                <div className="p-4 sm:p-6 flex justify-center">
                    <div className="w-full max-w-[1400px] space-y-4">
                        {/* 차트 섹션이 숨겨진 경우에만 보이는 버튼 */}
                        {!showChartSection && (
                            <div className="flex justify-end items-center mb-4">
                                <button
                                    onClick={() => setShowChartSection(true)}
                                    className="rounded-lg px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                                >
                                    <ChevronDown className="inline w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <AnimatePresence>
                            {showChartSection ? (
                                <motion.section
                                    key="chart-section"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="flex justify-between items-center">
                                        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                                            <TrendingUp size={20} />
                                            현재 시드 추이
                                        </h1>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowSeedModal(true)}
                                                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                                            >
                                                <Settings size={14} />
                                                시드 설정
                                            </button>
                                            <button
                                                onClick={() => setShowChartSection(false)}
                                                className="rounded-lg px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                                            >
                                                <ChevronUp className="inline w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-between items-center gap-4">
                                        <div className="flex flex-wrap gap-3">
                                            <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">시작 시드</div>
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {totalSeed.toLocaleString()}원
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">누적 손익</div>
                                                <div className={`font-semibold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {totalProfit > 0 ? '+' : ''}{totalProfit.toLocaleString()}원
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">현재 시드</div>
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {(totalSeed + totalProfit).toLocaleString()}원
                                                </div>
                                            </div>
                                            <div className={`px-3 py-2 rounded-lg ${totalRoi >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">총 수익률</div>
                                                <div className={`font-bold ${totalRoi >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {totalRoi > 0 ? '+' : ''}{totalRoi.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {['1W', '1M', '3M', '6M', 'ALL'].map((r: string) => (
                                                <button
                                                    key={r}
                                                    onClick={() => setRange(r as any)}
                                                    className={`px-2 py-1 text-xs rounded border transition-colors ${range === r ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 hover:border-emerald-600'}`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <SeedChart data={filteredChartData} />
                                    </div>
                                </motion.section>
                            ) : (<></>)}
                        </AnimatePresence>

                        {/* 목표가 숨겨진 경우에만 보이는 버튼 */}
                        {!showGoalSection && (
                            <div className="flex justify-end items-center mb-4">
                                <button
                                    onClick={() => setShowGoalSection(true)}
                                    className="rounded-lg px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                                >
                                    <ChevronDown className="inline w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* 목표 현황 섹션 */}
                        <AnimatePresence>
                            {showGoalSection ? (
                                <motion.div
                                    key="goal-section"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mb-12 overflow-hidden"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                                            <Target size={20} />
                                            목표 현황
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowGoalModal(true)}
                                                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                                            >
                                                <Settings size={14} />
                                                목표 설정
                                            </button>
                                            <button
                                                onClick={() => setShowGoalSection(false)}
                                                className="rounded-lg px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                                            >
                                                <ChevronUp className="inline w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <GoalDashboard
                                        currentProfit={totalProfit}
                                        totalSeed={totalSeed}
                                        currentRoi={totalRoi}
                                    />
                                </motion.div>
                            ) : (<></>)}
                        </AnimatePresence>

                        {showSeedModal && (
                            <SeedSettingModal
                                isOpen={showSeedModal}
                                handleClose={() => setShowSeedModal(false)}
                                handleSave={updateSeed}
                                currentSeed={totalSeed}
                            />
                        )}

                        {showGoalModal && (
                            <GoalSettingModal 
                                isOpen={showGoalModal}
                                handleClose={() => setShowGoalModal(false)}
                            />
                        )}
                    </div>
                </div>
            </main>
            <aside className="hidden 2xl:block w-[240px] p-3">
                <AdBanner position="right" />
            </aside>
        </div>
    );
}