'use client';

import { FileSpreadsheet, X, Check } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const painItems = [
  '매매 기록에 30분 이상 소요',
  'ROI, 승률 수동 계산',
  '분석 없이 쌓이기만 하는 데이터',
];

const solveItems = [
  '30초 만에 거래 기록 완료',
  'ROI, 승률, PF 자동 계산',
  '패턴 분석으로 약점 발견',
];

export default function PainPointBanner() {
  return (
    <section className="bg-white dark:bg-slate-950 py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text column - left */}
          <ScrollReveal direction="left">
            <div>
              <span className="text-red-500 dark:text-red-400 text-sm font-semibold tracking-wider uppercase">
                THE PROBLEM
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-3 mb-4">
                아직도 엑셀에<br />매매를 기록하시나요?
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                엑셀로도 기록은 할 수 있지만, 매번 수식을 고치고 차트를 새로 만들어야 합니다.
                반복되는 수동 작업에 지친다면, 이제 자동화된 트레이딩 저널로 바꿀 때입니다.
              </p>
            </div>
          </ScrollReveal>

          {/* Visual column - right */}
          <ScrollReveal direction="right" delay={0.15}>
            <div className="space-y-4 max-w-[420px] mx-auto">
              {/* Before - Excel */}
              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3.5">
                  <FileSpreadsheet className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                    Before
                  </span>
                </div>
                <div className="space-y-2.5">
                  {painItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                        <X className="w-2.5 h-2.5 text-red-500" />
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* After - Trabit */}
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    After
                  </span>
                </div>
                <div className="space-y-2.5">
                  {solveItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
