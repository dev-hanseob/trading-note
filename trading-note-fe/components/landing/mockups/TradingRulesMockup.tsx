'use client';

import { Check } from 'lucide-react';

export default function TradingRulesMockup() {
  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 space-y-4 shadow-lg">
      {/* Compliance Rate */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-slate-500 font-medium">이번 달 준수율</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">78%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: '78%' }}
          />
        </div>
      </div>

      {/* Rules Checklist */}
      <div className="space-y-2">
        <div className="text-[11px] text-slate-500 font-medium">매매원칙 체크리스트</div>
        {[
          { text: '진입 전 손절가 반드시 설정', checked: true },
          { text: '1회 진입 시 시드의 2% 이하로 제한', checked: true },
          { text: '연속 3패 후 당일 매매 중단', checked: false },
        ].map((rule, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border ${
              rule.checked
                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
                : 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700/30'
            }`}
          >
            <div
              className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 ${
                rule.checked
                  ? 'bg-emerald-500'
                  : 'border border-slate-300 dark:border-slate-600'
              }`}
              style={{ width: 18, height: 18 }}
            >
              {rule.checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <span
              className={`text-xs ${
                rule.checked
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-400'
              }`}
            >
              {rule.text}
            </span>
          </div>
        ))}
      </div>

      {/* Performance Comparison */}
      <div className="space-y-2">
        <div className="text-[11px] text-slate-500 font-medium">원칙 준수 효과</div>
        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-lg">
          <span className="text-[11px] text-slate-600 dark:text-slate-400">준수 시</span>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">승률 63%</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">+47만</span>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg">
          <span className="text-[11px] text-slate-600 dark:text-slate-400">미준수 시</span>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-red-600 dark:text-red-400 tabular-nums">승률 44%</span>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 tabular-nums">-28만</span>
          </div>
        </div>
      </div>
    </div>
  );
}
