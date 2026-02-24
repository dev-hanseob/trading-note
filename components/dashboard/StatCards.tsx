'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  Trophy,
  Repeat2,
  TrendingUp,
  Flame,
  ListChecks,
} from 'lucide-react';
import { Journal } from '@/type/domain/journal';
import { formatCurrency, formatCurrencyWithSign } from '@/lib/currency';

interface StatCardsProps {
  totalSeed: number;
  totalProfit: number;
  totalRoi: number;
  winRate: number;
  tradeCount: number;
  journals: Journal[];
  ruleComplianceRate: number;
  seedCurrency?: string;
}

function calculateStreak(journals: Journal[]): {
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'none';
  maxWinStreak: number;
} {
  if (journals.length === 0) {
    return { currentStreak: 0, currentStreakType: 'none', maxWinStreak: 0 };
  }

  const sorted = [...journals].sort(
    (a, b) => new Date(b.tradedAt).getTime() - new Date(a.tradedAt).getTime()
  );

  // Current streak
  let currentStreak = 0;
  let currentStreakType: 'win' | 'loss' | 'none' = 'none';

  if (sorted.length > 0) {
    const firstIsWin = sorted[0].profit > 0;
    currentStreakType = firstIsWin ? 'win' : 'loss';
    for (const j of sorted) {
      const isWin = j.profit > 0;
      if ((firstIsWin && isWin) || (!firstIsWin && !isWin)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Max win streak
  const chronological = [...journals].sort(
    (a, b) => new Date(a.tradedAt).getTime() - new Date(b.tradedAt).getTime()
  );
  let maxWinStreak = 0;
  let tempStreak = 0;
  for (const j of chronological) {
    if (j.profit > 0) {
      tempStreak++;
      maxWinStreak = Math.max(maxWinStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, currentStreakType, maxWinStreak };
}

function calculateProfitFactor(journals: Journal[]): string {
  const totalWins = journals
    .filter((j) => j.profit > 0)
    .reduce((sum, j) => sum + j.profit, 0);
  const totalLosses = Math.abs(
    journals.filter((j) => j.profit < 0).reduce((sum, j) => sum + j.profit, 0)
  );

  if (totalLosses === 0) {
    return totalWins > 0 ? '---' : '0.00';
  }
  return (totalWins / totalLosses).toFixed(2);
}

function calculateAvgPnl(journals: Journal[]): number {
  if (journals.length === 0) return 0;
  const total = journals.reduce((sum, j) => sum + j.profit, 0);
  return total / journals.length;
}

export default function StatCards({
  totalSeed,
  totalProfit,
  totalRoi,
  winRate,
  tradeCount,
  journals,
  ruleComplianceRate,
  seedCurrency = 'KRW',
}: StatCardsProps) {
  const totalBalance = totalSeed + totalProfit;
  const isProfitPositive = totalProfit >= 0;
  const isRoiPositive = totalRoi >= 0;
  const winCount = journals.filter((j) => j.profit > 0).length;
  const lossCount = journals.filter((j) => j.profit < 0).length;
  const { currentStreak, currentStreakType, maxWinStreak } = calculateStreak(journals);
  const profitFactor = calculateProfitFactor(journals);
  const avgPnl = calculateAvgPnl(journals);
  const isAvgPositive = avgPnl >= 0;

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  // Hero cards: 누적 손익, 총 수익률, 원칙 준수율 (심법 강조)
  const complianceGood = ruleComplianceRate >= 70;
  const complianceWarn = ruleComplianceRate >= 40 && ruleComplianceRate < 70;

  const heroCards = [
    {
      label: '누적 손익',
      value: formatCurrencyWithSign(totalProfit, seedCurrency),
      icon: isProfitPositive ? ArrowUpRight : ArrowDownRight,
      iconBg: isProfitPositive
        ? 'bg-emerald-100 dark:bg-emerald-900/30'
        : 'bg-red-100 dark:bg-red-900/30',
      iconColor: isProfitPositive
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-red-600 dark:text-red-400',
      valueColor: isProfitPositive
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-red-600 dark:text-red-400',
      subLabel: `총 ${tradeCount}건 거래`,
    },
    {
      label: '총 수익률',
      value: (isRoiPositive ? '+' : '') + totalRoi.toFixed(2) + '%',
      icon: Gauge,
      iconBg: isRoiPositive
        ? 'bg-emerald-100 dark:bg-emerald-900/30'
        : 'bg-red-100 dark:bg-red-900/30',
      iconColor: isRoiPositive
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-red-600 dark:text-red-400',
      valueColor: isRoiPositive
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-red-600 dark:text-red-400',
      subLabel: 'ROI',
    },
    {
      label: '원칙 준수율',
      value: ruleComplianceRate > 0 ? ruleComplianceRate.toFixed(0) + '%' : '-',
      icon: ListChecks,
      iconBg: complianceGood
        ? 'bg-emerald-100 dark:bg-emerald-900/30'
        : complianceWarn
          ? 'bg-amber-100 dark:bg-amber-900/30'
          : 'bg-slate-100 dark:bg-slate-800',
      iconColor: complianceGood
        ? 'text-emerald-600 dark:text-emerald-400'
        : complianceWarn
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-slate-500 dark:text-slate-400',
      valueColor: complianceGood
        ? 'text-emerald-600 dark:text-emerald-400'
        : complianceWarn
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-slate-900 dark:text-slate-100',
      subLabel: '매매원칙',
    },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {/* Hero Cards - 3 primary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {heroCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={itemVariants}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {card.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-full ${card.iconBg} flex items-center justify-center`}
                >
                  <Icon size={16} className={card.iconColor} />
                </div>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-bold ${card.valueColor} mb-1 tabular-nums`}
              >
                {card.value}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                {card.subLabel}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Cards - 5 supporting metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
        {/* Total Balance - demoted from hero */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
        >
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            총 잔고
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
            {formatCurrency(totalBalance, seedCurrency)}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            시드 {formatCurrency(totalSeed, seedCurrency)}
          </span>
        </motion.div>

        {/* Win Rate */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                승률
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
                {winRate.toFixed(1)}%
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {winCount}W / {lossCount}L
              </span>
            </div>
            {/* Mini donut chart via SVG */}
            <div className="w-11 h-11 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-red-100 dark:text-red-900/30"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${(winRate / 100) * 87.96} 87.96`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                  className="text-emerald-500"
                />
                <text
                  x="18"
                  y="18"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-slate-700 dark:fill-slate-300"
                  fontSize="8"
                  fontWeight="700"
                >
                  <tspan>{winRate.toFixed(0)}</tspan>
                </text>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Profit Factor */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
        >
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            손익비
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
            {profitFactor}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Profit Factor
          </span>
        </motion.div>

        {/* Average P&L */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
        >
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            평균 손익
          </span>
          <div
            className={`text-xl font-bold mt-0.5 tabular-nums ${
              isAvgPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrencyWithSign(Math.round(avgPnl), seedCurrency)}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Per Trade
          </span>
        </motion.div>

        {/* Current Streak */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
        >
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            현재 스트릭
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {currentStreakType === 'win' && currentStreak >= 2 && (
              <Flame size={18} className="text-orange-500" />
            )}
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {currentStreak > 0
                ? `${currentStreak}${currentStreakType === 'win' ? '연승' : '연패'}`
                : '-'}
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            최대: {maxWinStreak}연승
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
