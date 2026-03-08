'use client';

import React from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ListChecks, BookOpen, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  hasSeed: boolean;
  hasRules: boolean;
  onOpenSeedModal: () => void;
}

const pulseAnimation = {
  scale: [1, 1.03, 1],
  opacity: [1, 0.85, 1],
};

const pulseTransition = {
  duration: 2,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

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
      href: '/settings/rules',
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
  const firstIncompleteIndex = steps.findIndex(s => !s.done);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8"
    >
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-lg font-bold text-slate-900 dark:text-white mb-2"
        >
          트래빗 시작하기
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-sm text-slate-500 dark:text-slate-400"
        >
          3단계만 완료하면 대시보드가 활성화됩니다
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex items-center justify-center gap-2 mt-4"
        >
          <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 3) * 100}%` }}
              transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {completedCount}/3
          </span>
        </motion.div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = index === firstIncompleteIndex;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.12, duration: 0.35, ease: 'easeOut' }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                step.done
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
                  : isActive
                    ? 'bg-slate-50 dark:bg-slate-800/50 border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800/40'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.done
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {step.done ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.4 + index * 0.12 }}
                  >
                    <Check size={16} />
                  </motion.span>
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
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

              {!step.done && isActive && (
                'href' in step && step.href ? (
                  <motion.div
                    animate={pulseAnimation}
                    transition={pulseTransition}
                    className="flex-shrink-0"
                  >
                    <Link
                      href={step.href}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30"
                    >
                      {step.actionLabel}
                      <ArrowRight size={12} />
                    </Link>
                  </motion.div>
                ) : 'action' in step && step.action ? (
                  <motion.div
                    animate={pulseAnimation}
                    transition={pulseTransition}
                    className="flex-shrink-0"
                  >
                    <button
                      onClick={step.action}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30"
                    >
                      {step.actionLabel}
                      <ArrowRight size={12} />
                    </button>
                  </motion.div>
                ) : null
              )}

              {!step.done && !isActive && (
                'href' in step && step.href ? (
                  <Link
                    href={step.href}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                  >
                    {step.actionLabel}
                    <ArrowRight size={12} />
                  </Link>
                ) : 'action' in step && step.action ? (
                  <button
                    onClick={step.action}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                  >
                    {step.actionLabel}
                    <ArrowRight size={12} />
                  </button>
                ) : null
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
