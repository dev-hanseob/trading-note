'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import GradientGlow from './GradientGlow';
import DashboardMockup from './DashboardMockup';

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden w-full px-4 sm:px-6 lg:px-8 pt-14 sm:pt-28 pb-12 sm:pb-16">
      {/* Background glow */}
      <GradientGlow
        className="top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
        color="16,185,129"
        opacity={0.08}
      />

      {/* Dot grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative max-w-4xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={fadeUp}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">트레이딩 저널</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.05] mb-4 tracking-tight"
        >
          복기하는 트레이더가<br />
          <span className="text-emerald-500">결국 이긴다.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-lg"
        >
          좋은 트레이더와 그렇지 않은 트레이더의 차이는<br className="hidden sm:block" />
          기억력이 아니라 기록 습관입니다.
        </motion.p>

        {/* CTA */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/login"
            className="flex w-full sm:w-auto justify-center items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors text-sm shadow-lg shadow-emerald-500/20"
          >
            무료로 기록 시작하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Sub-text */}
        <motion.p
          variants={fadeUp}
          className="text-xs text-slate-400 dark:text-slate-500 mt-3"
        >
          가입 즉시 사용 가능 · 설치 없음
        </motion.p>
      </motion.div>

      {/* Dashboard mockup */}
      <div className="relative mt-12 sm:mt-16">
        <DashboardMockup />
      </div>
    </section>
  );
}
