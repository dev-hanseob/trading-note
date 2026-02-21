'use client';

import Link from 'next/link';
import { Zap, AlertTriangle } from 'lucide-react';

interface UpgradeBannerProps {
  tradesUsed: number;
  tradeLimit: number;
  usagePercent: number;
}

export default function UpgradeBanner({ tradesUsed, tradeLimit, usagePercent }: UpgradeBannerProps) {
  if (usagePercent < 70) return null;

  const isExhausted = tradesUsed >= tradeLimit;
  const remaining = tradeLimit - tradesUsed;

  if (isExhausted) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              이번 달 거래 기록 한도에 도달했습니다
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              Basic으로 업그레이드하면 무제한으로 기록할 수 있습니다.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            업그레이드
          </Link>
        </div>
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-red-600 dark:text-red-400 tabular-nums">{tradesUsed}/{tradeLimit}건 사용</span>
          </div>
          <div className="h-1.5 bg-red-200 dark:bg-red-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  // 70-99% usage warning
  const isUrgent = usagePercent >= 90;

  return (
    <div className={`rounded-xl border px-4 py-3 ${
      isUrgent
        ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30'
        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
    }`}>
      <div className="flex items-start gap-3">
        <Zap className={`w-5 h-5 mt-0.5 shrink-0 ${
          isUrgent ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'
        }`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${
            isUrgent
              ? 'text-amber-800 dark:text-amber-300'
              : 'text-slate-700 dark:text-slate-300'
          }`}>
            이번 달 거래 {remaining}건 남았습니다
          </p>
          <p className={`text-xs mt-0.5 ${
            isUrgent
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            Basic으로 업그레이드하면 무제한으로 기록할 수 있습니다.
          </p>
        </div>
        <Link
          href="/pricing"
          className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            isUrgent
              ? 'text-white bg-amber-500 hover:bg-amber-600'
              : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
          }`}
        >
          업그레이드
        </Link>
      </div>
      <div className="mt-2.5">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={`tabular-nums ${
            isUrgent
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}>{tradesUsed}/{tradeLimit}건 사용</span>
        </div>
        <div className={`h-1.5 rounded-full overflow-hidden ${
          isUrgent
            ? 'bg-amber-200 dark:bg-amber-900/50'
            : 'bg-slate-200 dark:bg-slate-800'
        }`}>
          <div
            className={`h-full rounded-full transition-all ${
              isUrgent ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
