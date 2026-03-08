'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, ArrowRight, CreditCard, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { useSubscription } from '@/hooks/useSubscription';
import { cancelSubscription, reactivateSubscription, getPaymentHistory } from '@/lib/api/subscription';
import { getTradingRules } from '@/lib/api/tradingRule';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { PaymentHistoryItem } from '@/type/domain/subscription';

export default function BillingSettingsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [ruleCount, setRuleCount] = useState(0);
    const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isReactivating, setIsReactivating] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const subscription = useSubscription();
    const isBasic = subscription.effectiveTier === 'BASIC';
    const isTrial = subscription.status === 'TRIALING';
    const isCancelled = subscription.status === 'CANCELLED';
    const isActive = subscription.status === 'ACTIVE';

    const currentPlan = isBasic ? 'Basic' : 'Free';
    const planBadge = isTrial ? '체험중' : isCancelled ? '취소예정' : isBasic ? '유료' : '무료';

    useEffect(() => {
        getTradingRules()
            .then(rules => setRuleCount(Array.isArray(rules) ? rules.length : 0))
            .catch(() => {});

        getPaymentHistory(1, 5)
            .then(res => setPayments(res.payments))
            .catch(() => {});
    }, []);

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            await cancelSubscription();
            showToast('구독이 취소되었습니다. 현재 기간이 끝날 때까지 이용할 수 있습니다.', 'success');
            subscription.mutate();
            setShowCancelConfirm(false);
        } catch {
            showToast('구독 취소에 실패했습니다', 'error');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleReactivate = async () => {
        setIsReactivating(true);
        try {
            await reactivateSubscription();
            showToast('구독이 다시 활성화되었습니다', 'success');
            subscription.mutate();
        } catch {
            showToast('구독 재활성화에 실패했습니다', 'error');
        } finally {
            setIsReactivating(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        try {
            return format(parseISO(dateStr), 'yyyy.MM.dd', { locale: ko });
        } catch {
            return '-';
        }
    };

    return (
        <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <Crown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold text-slate-900 dark:text-white">{currentPlan}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    isTrial ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                    isCancelled ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                    isBasic ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                    'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                }`}>{planBadge}</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {isTrial
                                    ? `체험 기간 ${subscription.trialDaysLeft}일 남음`
                                    : subscription.effectiveTier === 'FREE'
                                    ? `월 ${subscription.tradeLimit ?? 30}건 거래 기록 · 기본 대시보드`
                                    : '무제한 거래 기록 · 전체 대시보드 · 전체 분석'}
                            </p>
                            {isActive && subscription.currentPeriodEnd && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                    다음 결제일: {formatDate(subscription.currentPeriodEnd)}
                                    {subscription.amount != null && ` · ${subscription.amount.toLocaleString()}원`}
                                </p>
                            )}
                            {isCancelled && subscription.currentPeriodEnd && (
                                <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
                                    {formatDate(subscription.currentPeriodEnd)}까지 이용 가능
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {isCancelled ? (
                            <button
                                onClick={handleReactivate}
                                disabled={isReactivating}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-medium rounded-lg text-sm transition-colors"
                            >
                                {isReactivating ? '처리 중...' : '구독 재개'}
                            </button>
                        ) : isActive ? (
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="flex items-center gap-1.5 px-4 py-2 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-lg text-sm transition-colors"
                            >
                                구독 취소
                            </button>
                        ) : (
                            <Link
                                href="/pricing"
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors"
                            >
                                업그레이드
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Cancel Confirmation */}
                {showCancelConfirm && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                            구독을 취소하시겠습니까? 현재 결제 기간이 끝날 때까지 Basic 기능을 이용할 수 있으며,
                            이후 Free 플랜으로 전환됩니다.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white font-medium rounded-lg text-sm transition-colors"
                            >
                                {isCancelling ? '처리 중...' : '취소 확인'}
                            </button>
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-lg text-sm transition-colors"
                            >
                                돌아가기
                            </button>
                        </div>
                    </div>
                )}

                {/* Usage Bars */}
                <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-slate-500 dark:text-slate-400">이달 거래 기록</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{subscription.tradesUsed} / {subscription.tradeLimit != null ? `${subscription.tradeLimit}건` : '무제한'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(subscription.usagePercent, 100)}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-slate-500 dark:text-slate-400">매매 원칙</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{ruleCount}개</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: ruleCount > 0 ? '100%' : '0%' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
                        <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">결제 내역</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">최근 결제 기록</p>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {payments.map((payment) => (
                            <div key={payment.orderId} className="px-6 py-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            Basic ({payment.billingCycle === 'MONTHLY' ? '월간' : '연간'})
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(payment.paidAt || payment.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                                        {payment.amount.toLocaleString()}원
                                    </p>
                                    <p className={`text-xs ${
                                        payment.status === 'DONE' ? 'text-emerald-500' :
                                        payment.status === 'FAILED' ? 'text-red-500' :
                                        'text-slate-400'
                                    }`}>
                                        {payment.status === 'DONE' ? '완료' :
                                         payment.status === 'FAILED' ? '실패' :
                                         payment.status === 'CANCELLED' ? '취소' : '대기중'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
