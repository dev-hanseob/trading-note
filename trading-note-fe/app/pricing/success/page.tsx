'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { confirmBilling } from '@/lib/api/subscription';
import { useToast } from '@/components/Toast';
import type { BillingCycle } from '@/type/domain/subscription';

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const authKey = searchParams.get('authKey');
        const cycle = (searchParams.get('cycle') as BillingCycle) || 'MONTHLY';

        if (!authKey) {
            setError('Invalid payment callback: missing authKey');
            setIsProcessing(false);
            return;
        }

        async function activateSubscription() {
            try {
                await confirmBilling(authKey!, cycle);
                setIsProcessing(false);
                showToast('구독이 시작되었습니다!', 'success');
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } catch (err: unknown) {
                setIsProcessing(false);
                setError(err instanceof Error ? err.message : 'Payment confirmation failed');
            }
        }

        activateSubscription();
    }, [searchParams, router, showToast]);

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
                <div className="max-w-sm w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-red-500">!</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        결제 처리 중 오류가 발생했습니다
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/pricing')}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition-colors"
                    >
                        다시 시도하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-sm w-full text-center">
                {isProcessing ? (
                    <>
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            결제를 처리하고 있습니다
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">잠시만 기다려주세요...</p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            구독이 시작되었습니다!
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Basic 플랜의 모든 기능을 이용할 수 있습니다.
                            <br />잠시 후 대시보드로 이동합니다.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
