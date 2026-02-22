'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  children: ReactNode;
  isLocked: boolean;
  title?: string;
  description?: string;
  wasTrialUser?: boolean;
}

export default function FeatureGate({
  children,
  isLocked,
  title = 'Basic 전용 기능',
  description,
  wasTrialUser = false,
}: FeatureGateProps) {
  if (!isLocked) return <>{children}</>;

  const defaultDescription = wasTrialUser
    ? '체험 기간에 사용하셨던 기능입니다. 구독하면 다시 사용할 수 있어요.'
    : '업그레이드하면 전체 분석 기능을 이용할 수 있습니다.';

  return (
    <div className="relative">
      <div className="pointer-events-none select-none" aria-hidden="true">
        <div className="blur-[6px] opacity-50">
          {children}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6 py-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg max-w-xs">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            {title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            {description || defaultDescription}
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
          >
            Basic 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}
