'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getClientKey } from '@/lib/api/subscription';
import type { BillingCycle } from '@/type/domain/subscription';

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const widgetRef = useRef<HTMLDivElement>(null);

    const cycle = (searchParams.get('cycle') as BillingCycle) || 'MONTHLY';
    const isYearly = cycle === 'YEARLY';
    const amount = isYearly ? 124800 : 14900;
    const monthlyAmount = isYearly ? 10400 : 14900;

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        let mounted = true;

        async function initToss() {
            try {
                const clientKey = await getClientKey();
                const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
                const tossPayments = await loadTossPayments(clientKey);

                if (!mounted) return;

                const payment = tossPayments.payment({
                    customerKey: user!.id,
                });

                if (widgetRef.current) {
                    widgetRef.current.innerHTML = '';
                }

                setIsLoading(false);

                const btn = document.getElementById('toss-pay-button');
                if (btn) {
                    btn.onclick = async () => {
                        try {
                            await payment.requestBillingAuth({
                                method: 'CARD',
                                successUrl: `${window.location.origin}/pricing/success?cycle=${cycle}`,
                                failUrl: `${window.location.origin}/pricing/fail`,
                                customerEmail: user!.email,
                                customerName: user!.name || user!.email,
                            });
                        } catch (err: unknown) {
                            if (err instanceof Error) {
                                setError(err.message);
                            }
                        }
                    };
                }
            } catch (err: unknown) {
                if (mounted) {
                    setIsLoading(false);
                    setError(err instanceof Error ? err.message : 'Failed to load payment widget');
                }
            }
        }

        initToss();

        return () => {
            mounted = false;
        };
    }, [user, router, cycle]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-12">
                <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    요금제로 돌아가기
                </Link>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    결제 정보 입력
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                    Trabit Basic 구독을 시작합니다.
                </p>

                {/* Order Summary */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">주문 요약</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">플랜</span>
                            <span className="text-slate-900 dark:text-white font-medium">
                                Basic ({isYearly ? '연간' : '월간'})
                            </span>
                        </div>
                        {isYearly && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">월 환산 금액</span>
                                <span className="text-slate-900 dark:text-white tabular-nums">
                                    {monthlyAmount.toLocaleString()}원/월
                                </span>
                            </div>
                        )}
                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {isYearly ? '연간 결제 금액' : '월 결제 금액'}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {amount.toLocaleString()}원
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Widget Area */}
                <div ref={widgetRef} className="mb-6" />

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-sm text-red-500 dark:text-red-400">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                        <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">결제 모듈 로딩 중...</span>
                    </div>
                ) : (
                    <button
                        id="toss-pay-button"
                        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <CreditCard className="w-4 h-4" />
                        {amount.toLocaleString()}원 결제하기
                    </button>
                )}

                <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-4 leading-relaxed">
                    결제 후 매월 자동 갱신됩니다. 언제든 설정에서 취소할 수 있으며,
                    <br />취소 후에도 결제 기간이 끝날 때까지 이용할 수 있습니다.
                </p>
            </div>
        </div>
    );
}
