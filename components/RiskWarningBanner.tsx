'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Shield, Clock, X } from 'lucide-react';
import { Journal } from '@/type/domain/journal';

interface Props {
    journals: Journal[];
}

interface Warning {
    id: string;
    type: 'caution' | 'danger';
    icon: typeof AlertTriangle;
    message: string;
}

export default function RiskWarningBanner({ journals }: Props) {
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    const warnings = useMemo(() => {
        if (journals.length === 0) return [];

        const result: Warning[] = [];
        const today = new Date().toISOString().split('T')[0];

        // 1. Consecutive losses detection
        let consecutiveLosses = 0;
        for (const journal of journals) {
            if (journal.profit < 0) {
                consecutiveLosses++;
            } else {
                break;
            }
        }

        if (consecutiveLosses === 2) {
            result.push({
                id: 'consecutive-losses',
                type: 'caution',
                icon: AlertTriangle,
                message: '연속 2건 손실 중입니다. 잠시 쉬어가는 건 어떨까요?',
            });
        } else if (consecutiveLosses >= 3) {
            result.push({
                id: 'consecutive-losses',
                type: 'danger',
                icon: AlertTriangle,
                message: `연속 ${consecutiveLosses}건 손실입니다. 멘탈 리셋이 필요한 시점입니다.`,
            });
        }

        // 2. Revenge trading pattern detection
        const mostRecent = journals[0];
        if (mostRecent) {
            const isToday = mostRecent.tradedAt.slice(0, 10) === today;
            const isSignificantLoss = mostRecent.profit < -100000 || mostRecent.roi < -5;

            if (isToday && isSignificantLoss) {
                const lossAmount = Math.abs(mostRecent.profit).toLocaleString();
                result.push({
                    id: 'revenge-trading',
                    type: 'danger',
                    icon: Shield,
                    message: `직전 거래 ${lossAmount}원 손실. 복수 매매에 주의하세요.`,
                });
            }
        }

        // 3. High frequency trading detection
        const todayTrades = journals.filter(
            (j) => j.tradedAt.slice(0, 10) === today
        );

        if (todayTrades.length >= 5) {
            result.push({
                id: 'high-frequency',
                type: 'caution',
                icon: Clock,
                message: `오늘 ${todayTrades.length}건째 거래입니다. 과매매에 주의하세요.`,
            });
        }

        return result;
    }, [journals]);

    const visibleWarnings = warnings.filter((w) => !dismissed.has(w.id));

    const handleDismiss = (id: string) => {
        setDismissed((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    if (visibleWarnings.length === 0) return null;

    return (
        <div className="space-y-2">
            <AnimatePresence>
                {visibleWarnings.map((warning) => {
                    const Icon = warning.icon;
                    const isDanger = warning.type === 'danger';

                    return (
                        <motion.div
                            key={warning.id}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                                isDanger
                                    ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50'
                                    : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50'
                            }`}
                        >
                            <Icon
                                className={`w-4 h-4 flex-shrink-0 ${
                                    isDanger
                                        ? 'text-red-500 dark:text-red-400'
                                        : 'text-amber-500 dark:text-amber-400'
                                }`}
                            />
                            <span
                                className={`text-sm font-medium flex-1 ${
                                    isDanger
                                        ? 'text-red-700 dark:text-red-300'
                                        : 'text-amber-700 dark:text-amber-300'
                                }`}
                            >
                                {warning.message}
                            </span>
                            <button
                                onClick={() => handleDismiss(warning.id)}
                                className={`flex-shrink-0 p-1 rounded transition-colors ${
                                    isDanger
                                        ? 'text-red-400 hover:text-red-600 hover:bg-red-100 dark:text-red-500 dark:hover:text-red-300 dark:hover:bg-red-900/40'
                                        : 'text-amber-400 hover:text-amber-600 hover:bg-amber-100 dark:text-amber-500 dark:hover:text-amber-300 dark:hover:bg-amber-900/40'
                                }`}
                                aria-label="경고 닫기"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
