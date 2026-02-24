'use client';

import { motion } from 'framer-motion';
import { BarChart3, Clock, TrendingUp, Check } from 'lucide-react';
import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import StaggerContainer, { staggerItemVariants } from './StaggerContainer';

export default function AnalyticsShowcase() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              데이터가 패턴을 발견한다
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              기록이 쌓일수록, 당신의 매매 습관이 숫자로 드러납니다.
            </p>
          </div>
        </ScrollReveal>

        {/* 2x2 Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Card 1: Symbol P&L */}
          <motion.div variants={staggerItemVariants}>
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">종목별 손익</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { symbol: 'BTC', pnl: 2450000, max: 2450000 },
                  { symbol: 'SOL', pnl: 1280000, max: 2450000 },
                  { symbol: 'ETH', pnl: 450000, max: 2450000 },
                  { symbol: 'XRP', pnl: -320000, max: 2450000 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-slate-900 dark:text-white w-8">
                      {item.symbol}
                    </span>
                    <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800/50 rounded-sm overflow-hidden">
                      <div
                        className={`h-full rounded-sm ${item.pnl >= 0 ? 'bg-emerald-500/70' : 'bg-red-500/70'}`}
                        style={{ width: `${Math.abs(item.pnl / item.max) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-medium tabular-nums w-20 text-right ${
                        item.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {item.pnl >= 0 ? '+' : ''}
                      {(item.pnl / 10000).toFixed(0)}만
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                어떤 종목에서 수익이 나는지 한눈에
              </p>
            </div>
          </motion.div>

          {/* Card 2: Time Analysis */}
          <motion.div variants={staggerItemVariants}>
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">시간대별 성과</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { slot: '새벽', winRate: 45, trades: 8, color: 'text-red-400' },
                  { slot: '오전', winRate: 72, trades: 45, color: 'text-emerald-400' },
                  { slot: '오후', winRate: 65, trades: 38, color: 'text-emerald-400' },
                  { slot: '야간', winRate: 52, trades: 21, color: 'text-slate-400' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="text-center p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg"
                  >
                    <div className="text-[11px] text-slate-500 mb-1">{item.slot}</div>
                    <div className={`text-lg font-bold tabular-nums ${item.color}`}>
                      {item.winRate}%
                    </div>
                    <div className="text-[10px] text-slate-500">{item.trades}건</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                언제 매매해야 승률이 높은지 확인
              </p>
            </div>
          </motion.div>

          {/* Card 3: Day of Week Analysis */}
          <motion.div variants={staggerItemVariants}>
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">요일별 평균 손익</span>
              </div>
              <div className="flex items-end gap-1.5 px-1" style={{ height: '96px' }}>
                {[
                  { day: '월', value: 35, positive: true },
                  { day: '화', value: 65, positive: true },
                  { day: '수', value: 20, positive: false },
                  { day: '목', value: 80, positive: true },
                  { day: '금', value: 50, positive: true },
                  { day: '토', value: 15, positive: false },
                  { day: '일', value: 10, positive: false },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-sm ${
                        item.positive ? 'bg-emerald-500/60' : 'bg-red-500/60'
                      }`}
                      style={{ height: `${item.value}%`, minHeight: '4px' }}
                    />
                    <span className="text-[10px] text-slate-500 mt-1">{item.day}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                요일별 패턴으로 리스크를 관리
              </p>
            </div>
          </motion.div>

          {/* Card 4: Rules Compliance */}
          <motion.div variants={staggerItemVariants}>
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">매매원칙 준수 효과</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-lg">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">원칙 준수 시</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-500 tabular-nums">승률 78%</span>
                    <span className="text-xs font-bold text-emerald-500 tabular-nums">+82만</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">원칙 미준수 시</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-red-500 tabular-nums">승률 41%</span>
                    <span className="text-xs font-bold text-red-500 tabular-nums">-45만</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                원칙을 지키면 얼마나 달라지는지 증명
              </p>
            </div>
          </motion.div>
        </StaggerContainer>

        {/* Bottom link */}
        <div className="text-center mt-8">
          <Link
            href="/login"
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium transition-colors"
          >
            분석 기능 직접 체험하기 {'->'}
          </Link>
        </div>
      </div>
    </section>
  );
}
