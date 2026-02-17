'use client';

import React from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ListChecks, BookOpen, Check, ArrowRight } from 'lucide-react';

interface Props {
  hasSeed: boolean;
  hasRules: boolean;
  onOpenSeedModal: () => void;
}

export default function DashboardEmptyState({ hasSeed, hasRules, onOpenSeedModal }: Props) {
  const steps = [
    {
      id: 'seed',
      label: '시드머니 설정',
      description: '투자 원금을 설정하여 수익률을 추적하세요',
      icon: SlidersHorizontal,
      done: hasSeed,
      action: onOpenSeedModal,
      actionLabel: '시드 설정',
    },
    {
      id: 'rules',
      label: '매매원칙 설정',
      description: '나만의 트레이딩 규칙을 만들어 심법을 강화하세요',
      icon: ListChecks,
      done: hasRules,
      href: '/settings',
      actionLabel: '원칙 설정',
    },
    {
      id: 'trade',
      label: '첫 거래 기록',
      description: '매매일지를 작성하여 분석을 시작하세요',
      icon: BookOpen,
      done: false,
      href: '/journal/new',
      actionLabel: '거래 기록',
    },
  ] as const;

  const completedCount = steps.filter(s => s.done).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Trading Note 시작하기
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          3단계만 완료하면 대시보드가 활성화됩니다
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {completedCount}/3
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
              step.done
                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.done
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              {step.done ? <Check size={16} /> : <span className="text-sm font-bold">{index + 1}</span>}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${
                step.done ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
              }`}>
                {step.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {step.description}
              </p>
            </div>

            {!step.done && (
              'href' in step && step.href ? (
                <Link
                  href={step.href}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors flex-shrink-0"
                >
                  {step.actionLabel}
                  <ArrowRight size={12} />
                </Link>
              ) : 'action' in step && step.action ? (
                <button
                  onClick={step.action}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors flex-shrink-0"
                >
                  {step.actionLabel}
                  <ArrowRight size={12} />
                </button>
              ) : null
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
