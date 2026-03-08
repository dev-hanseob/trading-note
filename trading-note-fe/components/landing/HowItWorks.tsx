'use client';

import { motion } from 'framer-motion';
import { Zap, BarChart3, TrendingUp } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import StaggerContainer, { staggerItemVariants } from './StaggerContainer';

const steps = [
  {
    step: '01',
    icon: Zap,
    title: '거래 직후, 30초 기록',
    desc: '종목과 손익만 입력하세요. ROI, 누적 수익은 자동으로 계산됩니다.',
  },
  {
    step: '02',
    icon: BarChart3,
    title: '통계가 자동으로 쌓인다',
    desc: '승률, Profit Factor, 연승/연패 패턴. 기록이 쌓일수록 데이터가 말해줍니다.',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: '약점을 발견하고 개선한다',
    desc: '어느 종목에서 손실이 나는지, 어느 시간대에 판단이 흐려지는지 확인하세요.',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white dark:bg-slate-950 py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              시작은 간단합니다
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400">
              복잡한 설정 없이, 3단계로 매매 분석을 시작하세요.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer
          staggerDelay={0.15}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10"
        >
          {steps.map((item, i) => {
            const Icon = item.icon;
            const isLast = i === steps.length - 1;

            return (
              <motion.div
                key={item.step}
                variants={staggerItemVariants}
                className="relative flex flex-col items-center text-center"
              >
                {/* Connector line between steps (desktop only) */}
                {!isLast && (
                  <div className="hidden sm:block absolute top-5 left-[calc(50%+24px)] w-[calc(100%-48px)] h-px border-t border-dashed border-slate-300 dark:border-slate-700 translate-x-[24px]" />
                )}

                {/* Step icon circle */}
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>

                {/* Step label */}
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-widest mt-3">
                  STEP {item.step}
                </span>

                {/* Title */}
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-2 mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
