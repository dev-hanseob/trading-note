'use client';

import { useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { Journal } from '@/type/domain/journal';
import { format, isToday, parseISO } from 'date-fns';

interface Props {
  journals: Journal[];
}

export default function TodaySummary({ journals }: Props) {
  const todayTrades = useMemo(() => {
    return journals.filter(j => {
      try {
        return isToday(parseISO(j.tradedAt));
      } catch {
        return false;
      }
    });
  }, [journals]);

  const stats = useMemo(() => {
    if (todayTrades.length === 0) return null;
    const totalPnl = todayTrades.reduce((sum, j) => sum + j.profit, 0);
    const wins = todayTrades.filter(j => j.profit > 0).length;
    const losses = todayTrades.filter(j => j.profit < 0).length;
    const best = todayTrades.reduce((max, j) => j.profit > max.profit ? j : max, todayTrades[0]);
    const worst = todayTrades.reduce((min, j) => j.profit < min.profit ? j : min, todayTrades[0]);
    return { totalPnl, wins, losses, count: todayTrades.length, best, worst };
  }, [todayTrades]);

  const today = format(new Date(), 'M월 d일');

  if (!stats) {
    return (
      <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">{today}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">오늘의 거래</div>
            </div>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-600">아직 거래가 없습니다</span>
        </div>
      </div>
    );
  }

  const isPositive = stats.totalPnl > 0;
  const isNegative = stats.totalPnl < 0;

  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 ${
      isPositive ? 'border-emerald-200 dark:border-emerald-800/50' : isNegative ? 'border-red-200 dark:border-red-800/50' : 'border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Date + PnL */}
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isPositive ? 'bg-emerald-100 dark:bg-emerald-900/30' : isNegative ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800'
          }`}>
            {isPositive ? <TrendingUp className="w-5 h-5 text-emerald-400" /> :
             isNegative ? <TrendingDown className="w-5 h-5 text-red-400" /> :
             <Minus className="w-5 h-5 text-slate-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900 dark:text-white">{today}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{stats.count}건 거래</span>
            </div>
            <div className={`text-lg font-bold tabular-nums ${
              isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400'
            }`}>
              {isPositive ? '+' : ''}{stats.totalPnl.toLocaleString()}원
            </div>
          </div>
        </div>

        {/* Right: Win/Loss + Best/Worst */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">이익</div>
              <span className="font-bold text-emerald-400 tabular-nums">{stats.wins}</span>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">손실</div>
              <span className="font-bold text-red-400 tabular-nums">{stats.losses}</span>
            </div>
          </div>
          {stats.count > 1 && (
            <>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Best</div>
                  <span className="font-medium text-emerald-400 tabular-nums text-xs">
                    {stats.best.symbol} {stats.best.profit > 0 ? '+' : ''}{stats.best.profit.toLocaleString()}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Worst</div>
                  <span className="font-medium text-red-400 tabular-nums text-xs">
                    {stats.worst.symbol} {stats.worst.profit > 0 ? '+' : ''}{stats.worst.profit.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
