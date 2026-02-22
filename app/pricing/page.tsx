'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, ArrowLeft, Clock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

const features = [
    { name: '거래 기록', free: '월 30건', basic: '무제한' },
    { name: '대시보드', free: '기본', basic: '전체 (에퀴티 커브, 캘린더, 월별 P&L)' },
    { name: '매매원칙', free: true, basic: true },
    { name: '데이터 조회', free: '최근 30일', basic: '전체 기간' },
    { name: '차트 스크린샷', free: '1장/거래', basic: '5장/거래' },
    { name: '감정/실수 태그', free: true, basic: true },
    { name: '목표 설정 & 추적', free: false, basic: true },
    { name: '시드머니 관리', free: false, basic: true },
    { name: 'CSV 가져오기/내보내기', free: false, basic: true },
    { name: '매매원칙 성과 분석', free: false, basic: true },
    { name: '고급 분석 (시간대/요일/종목별)', free: false, basic: true },
];

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(true);
    const router = useRouter();
    const subscription = useSubscription();
    const monthlyPrice = 14900;
    const yearlyPrice = 10400;
    const price = isYearly ? yearlyPrice : monthlyPrice;
    const isAlreadyBasic = subscription.effectiveTier === 'BASIC';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
                {/* Back link */}
                <Link href="/settings/account" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    설정으로 돌아가기
                </Link>

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                        나에게 맞는 플랜 선택
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base max-w-lg mx-auto">
                        무제한 기록, 전체 분석, 성과 추적. 매매 실력을 한 단계 끌어올리세요.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <span className={`text-sm font-medium ${!isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>월간</span>
                    <button onClick={() => setIsYearly(!isYearly)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${isYearly ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-sm font-medium ${isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                        연간
                    </span>
                    {isYearly && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                            30% 할인
                        </span>
                    )}
                </div>

                {/* Price Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    {/* Free */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Free</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">매매 기록의 첫 걸음</p>
                        <div className="flex items-baseline gap-1 mb-5">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">0</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">원</span>
                        </div>
                        <button className="w-full py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-medium cursor-default">
                            현재 플랜
                        </button>
                        <ul className="mt-5 space-y-2.5">
                            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />월 30건 거래 기록
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />기본 대시보드
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />매매원칙
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />최근 30일 데이터
                            </li>
                        </ul>
                    </div>

                    {/* Basic */}
                    <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-2xl p-6 shadow-lg shadow-emerald-500/10 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="text-xs font-semibold text-white bg-emerald-500 px-3 py-1 rounded-full">추천</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Basic</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">본격적인 매매 분석</p>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                                {price.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">원/월</span>
                        </div>
                        {isYearly && (
                            <p className="text-xs text-emerald-500 font-semibold mb-4">
                                연 {((monthlyPrice - yearlyPrice) * 12).toLocaleString()}원 절약
                            </p>
                        )}
                        {!isYearly && <div className="mb-4" />}
                        <button
                            onClick={() => {
                                if (!isAlreadyBasic) {
                                    router.push(`/pricing/checkout?cycle=${isYearly ? 'YEARLY' : 'MONTHLY'}`);
                                }
                            }}
                            disabled={isAlreadyBasic}
                            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors ${
                                isAlreadyBasic
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                        >
                            {isAlreadyBasic ? '현재 플랜' : 'Basic 시작하기'}
                        </button>
                        <ul className="mt-5 space-y-2.5">
                            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />무제한 거래 기록
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />전체 대시보드 + 분석
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />무제한 매매원칙
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />매매원칙 성과 분석
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />고급 분석 + CSV
                            </li>
                        </ul>
                    </div>

                    {/* Pro - Coming Soon */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative flex flex-col items-center justify-center text-center">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full">
                                <Clock className="w-3 h-3" />출시 예정
                            </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 mt-4">Pro</h2>
                        <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
                            더 강력한 기능을<br />준비하고 있습니다
                        </p>
                    </div>
                </div>

                {/* Feature Comparison */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="px-6 py-4">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">기능</span>
                        </div>
                        <div className="px-4 py-4 text-center border-l border-slate-200 dark:border-slate-800">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Free</span>
                        </div>
                        <div className="px-4 py-4 text-center border-l border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10">
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Basic</span>
                        </div>
                    </div>
                    {features.map((feature, i) => (
                        <div key={i} className={`grid grid-cols-3 ${i < features.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/50' : ''}`}>
                            <div className="px-6 py-3.5">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{feature.name}</span>
                            </div>
                            <div className="px-4 py-3.5 flex items-center justify-center border-l border-slate-100 dark:border-slate-800/50">
                                {typeof feature.free === 'boolean' ? (
                                    feature.free ? (
                                        <Check className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <X className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                    )
                                ) : (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{feature.free}</span>
                                )}
                            </div>
                            <div className="px-4 py-3.5 flex items-center justify-center border-l border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/5">
                                {typeof feature.basic === 'boolean' ? (
                                    feature.basic ? (
                                        <Check className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <X className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                    )
                                ) : (
                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{feature.basic}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div className="mt-12">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-6">자주 묻는 질문</h2>
                    <div className="space-y-3">
                        {[
                            { q: '언제든 취소할 수 있나요?', a: '네, 원클릭으로 즉시 취소 가능합니다. 취소 후에도 결제 기간이 끝날 때까지 이용할 수 있습니다.' },
                            { q: '어떤 결제 수단을 지원하나요?', a: '신용카드, 체크카드, 카카오페이, 네이버페이를 지원합니다.' },
                            { q: '무료 체험이 있나요?', a: '가입 시 14일간 Basic 전체 기능을 무료로 체험할 수 있습니다. 체험 종료 후 자동으로 Free로 전환됩니다.' },
                        ].map(({ q, a }, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">{q}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
