'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 4 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      style={{ perspective: 1200 }}
      className="max-w-5xl mx-auto"
    >
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-emerald-500/5 dark:shadow-emerald-500/10">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800/50 bg-slate-100 dark:bg-slate-900/80">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-0.5 bg-slate-200 dark:bg-slate-800/50 rounded text-[11px] text-slate-400 dark:text-slate-600 font-mono">
              trabit.app/dashboard
            </div>
          </div>
        </div>

        {/* Mock dashboard content */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Today summary bar */}
          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">오늘의 성과</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">+485,000원</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-500">3건 거래</span>
              <span className="text-emerald-600 dark:text-emerald-400">2W</span>
              <span className="text-red-600 dark:text-red-400">1L</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: '총 잔고', value: '11,120,000', sub: '+11.2%', color: 'text-slate-900 dark:text-white', subColor: 'text-emerald-500' },
              { label: '누적 손익', value: '+1,120,000', sub: '35건', color: 'text-emerald-600 dark:text-emerald-400', subColor: 'text-slate-500' },
              { label: '승률', value: '57.1%', sub: '20W / 15L', color: 'text-slate-900 dark:text-white', subColor: 'text-slate-500' },
              { label: 'Profit Factor', value: '1.65', sub: '', color: 'text-slate-900 dark:text-white', subColor: 'text-slate-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-100 dark:bg-slate-800/30 rounded-lg p-3">
                <div className="text-[11px] text-slate-500 mb-1">{stat.label}</div>
                <div className={`text-base font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
                <div className={`text-[11px] ${stat.subColor}`}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-slate-50 dark:bg-slate-800/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-500 font-medium">자산 추이</span>
              <div className="flex gap-1.5">
                {['1W', '1M', '3M', 'ALL'].map(p => (
                  <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded ${p === '1M' ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-600'}`}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <svg className="w-full h-24" viewBox="0 0 500 90" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartFillLanding" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,70 Q50,62 100,50 T200,35 T300,26 T400,10 T500,3 L500,90 L0,90Z" fill="url(#chartFillLanding)" />
              <path d="M0,70 Q50,62 100,50 T200,35 T300,26 T400,10 T500,3" fill="none" stroke="rgb(16, 185, 129)" strokeWidth="2" />
            </svg>
          </div>

          {/* Recent trades */}
          <div className="space-y-1">
            {[
              { symbol: 'BTC', type: 'LONG', pnl: '+320,000', roi: '+3.2%', win: true, time: '14:32' },
              { symbol: 'ETH', type: 'SHORT', pnl: '-85,000', roi: '-1.7%', win: false, time: '11:15' },
              { symbol: 'SOL', type: 'LONG', pnl: '+250,000', roi: '+8.3%', win: true, time: '09:48' },
            ].map((trade, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-900 dark:text-white w-8">{trade.symbol}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                    trade.type === 'LONG' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                  }`}>{trade.type}</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-500">{trade.time}</span>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className={`text-xs font-medium ${trade.win ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{trade.pnl}</span>
                  <span className={`text-[11px] w-12 text-right ${trade.win ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{trade.roi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
