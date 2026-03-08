'use client';

import { motion } from 'framer-motion';
import StaggerContainer, { staggerItemVariants } from './StaggerContainer';

const stats = [
  { value: '30초', label: '거래 기록 시간', accent: false },
  { value: '무료', label: '시작 비용', accent: true },
  { value: '5가지', label: '성과 지표 자동 계산', accent: false },
  { value: '설치 없음', label: '브라우저에서 바로', accent: false },
];

export default function SocialProofBar() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50">
      <StaggerContainer
        staggerDelay={0.08}
        className="max-w-4xl mx-auto flex flex-wrap justify-center gap-10 sm:gap-16 text-center"
      >
        {stats.map((item, i) => (
          <motion.div key={i} variants={staggerItemVariants} className="min-w-[80px]">
            <div
              className={`text-3xl font-bold mb-1 ${
                item.accent
                  ? 'text-emerald-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {item.value}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {item.label}
            </div>
          </motion.div>
        ))}
      </StaggerContainer>
    </section>
  );
}
