'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react';

export default function PaymentFailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
        }>
            <FailContent />
        </Suspense>
    );
}

function FailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const errorCode = searchParams.get('code') || '';
    const errorMessage = searchParams.get('message') || '결제 처리 중 문제가 발생했습니다.';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-sm w-full text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    결제에 실패했습니다
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {errorMessage}
                </p>
                {errorCode && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
                        오류 코드: {errorCode}
                    </p>
                )}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => router.push('/pricing')}
                        className="w-full px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition-colors"
                    >
                        다시 시도하기
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full px-6 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm rounded-lg transition-colors"
                    >
                        대시보드로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}
