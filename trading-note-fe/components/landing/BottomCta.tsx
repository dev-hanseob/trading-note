'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import GradientGlow from './GradientGlow';
import ScrollReveal from './ScrollReveal';

export default function BottomCta() {
  return (
    <section className="bg-white dark:bg-slate-950 py-20 sm:py-28 relative overflow-hidden">
      <GradientGlow className="inset-0 w-full h-full" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <ScrollReveal direction="up">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            수익률이 달라지는 습관
          </h2>

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            무료로 시작 &middot; 언제든 취소 가능 &middot; 설치 없음
          </p>

          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all text-base shadow-lg shadow-emerald-500/20"
            >
              지금 기록하기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="mt-5 text-xs text-slate-400 dark:text-slate-500">
            Basic 플랜 월 10,400원 (연간) &middot; 언제든 해지 가능
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
