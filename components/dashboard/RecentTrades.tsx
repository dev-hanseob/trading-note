'use client';

import React from 'react';
import Link from 'next/link';
import { Journal } from '@/type/domain/journal';
import { History, ScrollText, ArrowRight, TrendingUp, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrencyWithSign } from '@/lib/currency';
import { CardHeader } from '@/components/dashboard/DashboardCard';

interface RecentTradesProps {
  journals: Journal[];
  onSelect: (journal: Journal) => void;
  seedCurrency?: string;
}

export default function RecentTrades({ journals, onSelect, seedCurrency = 'KRW' }: RecentTradesProps) {
  const recentTrades = [...journals]
    .sort((a, b) => new Date(b.tradedAt).getTime() - new Date(a.tradedAt).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="px-5 pt-5">
        <CardHeader
          icon={<History size={16} className="text-slate-500 dark:text-slate-400" />}
          title="최근 거래"
        />
      </div>

      {recentTrades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center flex-1">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <BarChart3 size={24} className="text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            아직 거래 기록이 없습니다
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
            매매일지에서 첫 거래를 기록해보세요
          </p>
          <Link
            href="/journal/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
          >
            <TrendingUp size={14} />
            거래 기록하기
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-0 px-3 flex-1">
            {recentTrades.map((trade, index) => {
              const isProfit = trade.profit > 0;
              const isLoss = trade.profit < 0;
              const isLong = trade.position === 'LONG';

              return (
                <button
                  key={trade.id}
                  onClick={() => onSelect(trade)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all rounded-lg group cursor-pointer ${
                    index < recentTrades.length - 1
                      ? 'border-b border-slate-100 dark:border-slate-800'
                      : ''
                  }`}
                >
                  {/* Symbol & Position */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {trade.symbol}
                    </span>
                    {trade.position && (
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold flex-shrink-0 ${
                          isLong
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {isLong ? 'L' : 'S'}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 tabular-nums text-right min-w-[36px]">
                    {format(new Date(trade.tradedAt), 'MM.dd')}
                  </span>

                  {/* Profit & ROI */}
                  <div className="flex flex-col items-end flex-shrink-0 w-[110px]">
                    <span
                      className={`text-sm font-semibold ${
                        isProfit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isLoss
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-500'
                      }`}
                    >
                      {formatCurrencyWithSign(trade.profit, seedCurrency)}
                    </span>
                    <span
                      className={`text-xs tabular-nums ${
                        isProfit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isLoss
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}
                      {trade.roi.toFixed(2)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* View All Link */}
          <Link
            href="/journal"
            className="flex items-center justify-center gap-1 py-3.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 border-t border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-b-xl"
          >
            전체 거래 보기
            <ArrowRight size={14} />
          </Link>
        </>
      )}
    </div>
  );
}
