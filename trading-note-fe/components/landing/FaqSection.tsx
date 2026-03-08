'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

const faqs = [
  {
    q: '정말 무료로 사용할 수 있나요?',
    a: '네, Free 플랜은 월 30건까지 무료로 이용 가능합니다. 더 많은 기록과 고급 분석이 필요하면 Basic 플랜으로 업그레이드할 수 있습니다.',
  },
  {
    q: '내 거래 데이터는 안전한가요?',
    a: '모든 데이터는 암호화되어 저장되며, 본인만 열람할 수 있습니다. 제3자에게 데이터를 공유하거나 판매하지 않습니다.',
  },
  {
    q: '모바일에서도 사용할 수 있나요?',
    a: '네, 반응형 웹으로 모바일 브라우저에서도 최적화된 화면으로 이용 가능합니다. 별도 앱 설치가 필요 없습니다.',
  },
  {
    q: '어떤 결제 수단을 지원하나요?',
    a: '신용카드, 체크카드, 카카오페이, 네이버페이를 지원합니다. 언제든 원클릭으로 해지할 수 있습니다.',
  },
  {
    q: '암호화폐와 주식 모두 기록할 수 있나요?',
    a: '네, 암호화폐(현물/선물)와 주식(현물/선물) 모두 지원합니다. 자산 유형별로 분리된 통계도 제공됩니다.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-slate-50 dark:bg-slate-900/50 py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              자주 묻는 질문
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400">
              궁금한 점이 있으시면 언제든 문의해 주세요.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;

              return (
                <div
                  key={i}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  >
                    <span className="text-sm font-medium text-slate-900 dark:text-white pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4">
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
