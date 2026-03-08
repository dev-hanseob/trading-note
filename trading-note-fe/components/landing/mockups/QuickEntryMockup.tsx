'use client';

import { useState } from 'react';

type AssetType = 'crypto' | 'stock';

const data = {
  crypto: {
    symbol: 'BTC',
    position: 'LONG',
    positionColor: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500',
    date: '2026-02-24',
    currency: 'USDT',
    investment: '5,000',
    pnl: '+320',
    roi: '+6.40%',
    positive: true,
  },
  stock: {
    symbol: '삼성전자',
    position: '매수',
    positionColor: 'bg-red-500/20 border-red-500/30 text-red-500',
    date: '2026-02-25',
    currency: 'KRW',
    investment: '3,500,000',
    pnl: '+245,000',
    roi: '+7.00%',
    positive: true,
  },
};

export default function QuickEntryMockup() {
  const [activeTab, setActiveTab] = useState<AssetType>('crypto');
  const d = data[activeTab];
  const pnlColor = d.positive
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400';
  const pnlBg = d.positive
    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
    : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30';

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 space-y-4 shadow-lg">
      {/* Header with tab toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">Quick Entry</span>
        <div className="flex bg-slate-100 dark:bg-slate-800/60 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-default ${
              activeTab === 'crypto'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            암호화폐
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-default ${
              activeTab === 'stock'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            주식
          </button>
        </div>
      </div>

      {/* Symbol + Date */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-400 mb-0.5">종목</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">{d.symbol}</div>
        </div>
        <div className="flex-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-400 mb-0.5">거래일</div>
          <div className="text-xs text-slate-600 dark:text-slate-300 tabular-nums">{d.date}</div>
        </div>
      </div>

      {/* Investment + Profit + ROI */}
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/60 rounded-lg px-3 py-2.5">
          <span className="text-[11px] text-slate-400">투자금 ({d.currency})</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">{d.investment}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`border rounded-lg px-3 py-2.5 ${pnlBg}`}>
            <div className="text-[10px] text-slate-400 mb-0.5">손익 ({d.currency})</div>
            <div className={`text-sm font-bold tabular-nums ${pnlColor}`}>{d.pnl}</div>
          </div>
          <div className={`border rounded-lg px-3 py-2.5 ${pnlBg}`}>
            <div className="text-[10px] text-slate-400 mb-0.5">ROI %</div>
            <div className={`text-sm font-bold tabular-nums ${pnlColor}`}>{d.roi}</div>
          </div>
        </div>
      </div>

      {/* Emotion */}
      <div>
        <div className="text-[11px] text-slate-400 mb-2">감정</div>
        <div className="flex gap-2">
          {[
            { color: 'bg-red-400/60', active: false },
            { color: 'bg-orange-400/60', active: false },
            { color: 'bg-slate-400/60', active: false },
            { color: 'bg-emerald-400/60', active: true },
            { color: 'bg-emerald-500/80', active: false },
          ].map((e, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full ${e.color} ${
                e.active
                  ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-800'
                  : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* Submit button */}
      <button className="w-full py-2.5 bg-emerald-600 rounded-lg text-sm font-semibold text-white cursor-default">
        거래 등록
      </button>
    </div>
  );
}
