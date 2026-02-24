'use client';

import { useMemo } from 'react';
import { Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TooltipProps } from 'recharts';
import { Journal } from '@/type/domain/journal';
import { EmotionType, EmotionTypeLabel, EmotionTypeColor } from '@/type/domain/journal.enum';
import { DashboardCard, CardHeader } from '@/components/dashboard/DashboardCard';

interface Props {
    journals: Journal[];
}

interface EmotionStat {
    emotion: EmotionType;
    label: string;
    count: number;
    totalPnl: number;
    avgPnl: number;
    winRate: number;
    winCount: number;
}

const EMOTION_CHART_COLORS: Record<string, string> = {
    CALM: '#3b82f6',
    CONFIDENT: '#10b981',
    FOMO: '#f97316',
    REVENGE: '#ef4444',
    ANXIOUS: '#a855f7',
    TIRED: '#64748b',
};

export default function EmotionStats({ journals }: Props) {
    const emotionStats = useMemo(() => {
        const journalsWithEmotion = journals.filter(
            (j) => j.emotion && Object.values(EmotionType).includes(j.emotion as EmotionType)
        );

        if (journalsWithEmotion.length === 0) return [];

        const grouped = new Map<EmotionType, Journal[]>();

        for (const j of journalsWithEmotion) {
            const emotion = j.emotion as EmotionType;
            const list = grouped.get(emotion) || [];
            list.push(j);
            grouped.set(emotion, list);
        }

        const stats: EmotionStat[] = [];

        for (const [emotion, group] of grouped) {
            const totalPnl = group.reduce((sum, j) => sum + j.profit, 0);
            const avgPnl = totalPnl / group.length;
            const winCount = group.filter((j) => j.profit > 0).length;
            const winRate = (winCount / group.length) * 100;

            stats.push({
                emotion,
                label: EmotionTypeLabel[emotion],
                count: group.length,
                totalPnl,
                avgPnl,
                winRate,
                winCount,
            });
        }

        stats.sort((a, b) => b.count - a.count);
        return stats;
    }, [journals]);

    const chartData = useMemo(() => {
        return emotionStats.map((stat) => ({
            name: stat.label,
            emotion: stat.emotion,
            count: stat.count,
        }));
    }, [emotionStats]);

    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (!active || !payload || !payload.length) return null;
        const data = payload[0].payload;
        const stat = emotionStats.find((s) => s.emotion === data.emotion);
        if (!stat) return null;

        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {stat.label}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    거래 수: <span className="font-semibold tabular-nums">{stat.count}건</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    승률: <span className="font-semibold tabular-nums">{stat.winRate.toFixed(1)}%</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                    평균 손익:{' '}
                    <span
                        className={`font-semibold tabular-nums ${
                            stat.avgPnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}
                    >
                        {stat.avgPnl >= 0 ? '+' : ''}
                        {Math.round(stat.avgPnl).toLocaleString()}원
                    </span>
                </p>
            </div>
        );
    };

    const hasData = emotionStats.length > 0;

    return (
        <DashboardCard className="flex flex-col h-full">
            <CardHeader
                icon={<Brain className="w-4 h-4 text-purple-500" />}
                title="감정별 트레이딩 통계"
            />

            {!hasData ? (
                <div className="flex flex-col items-center justify-center h-[200px] gap-2">
                    <Brain className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        거래 시 감정을 기록하면 통계를 확인할 수 있습니다
                    </p>
                </div>
            ) : (
                <>
                    {/* Bar Chart - Emotion Distribution */}
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                allowDecimals={false}
                                width={30}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={EMOTION_CHART_COLORS[entry.emotion] || '#64748b'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Emotion Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        {emotionStats.map((stat) => {
                            const colors = EmotionTypeColor[stat.emotion];
                            const isPositiveAvg = stat.avgPnl >= 0;

                            return (
                                <div
                                    key={stat.emotion}
                                    className={`rounded-lg border p-3 ${colors.bg} ${colors.border}`}
                                >
                                    <div className={`text-sm font-semibold mb-2 ${colors.text}`}>
                                        {stat.label}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                평균 손익
                                            </span>
                                            <span
                                                className={`text-xs font-semibold tabular-nums ${
                                                    isPositiveAvg
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                {isPositiveAvg ? '+' : ''}
                                                {Math.round(stat.avgPnl).toLocaleString()}원
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                승률
                                            </span>
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                                                {stat.winRate.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                거래
                                            </span>
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                                                {stat.count}건
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </DashboardCard>
    );
}
