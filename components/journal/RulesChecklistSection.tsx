'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import { TradingRule } from '@/type/domain/tradingRule';

interface RulesChecklistSectionProps {
    tradingRules: TradingRule[];
    checkedRuleIds: Set<number>;
    toggleRule: (id: number) => void;
    onClose: () => void;
}

export default function RulesChecklistSection({
    tradingRules,
    checkedRuleIds,
    toggleRule,
    onClose,
}: RulesChecklistSectionProps) {
    if (tradingRules.length === 0) {
        return (
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    매매 원칙 체크 (선택)
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-1">설정된 매매 원칙이 없습니다</p>
                    <Link
                        href="/settings"
                        className="text-xs text-emerald-500 hover:text-emerald-400 underline"
                        onClick={onClose}
                    >
                        설정에서 원칙 추가하기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                매매 원칙 체크 (선택)
                {checkedRuleIds.size > 0 && (
                    <span className="ml-2 text-emerald-500">
                        {checkedRuleIds.size}/{tradingRules.length}
                    </span>
                )}
            </label>
            <div className="space-y-1.5">
                {tradingRules.map(rule => (
                    <button
                        key={rule.id}
                        type="button"
                        onClick={() => toggleRule(rule.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors border ${
                            checkedRuleIds.has(rule.id)
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            checkedRuleIds.has(rule.id)
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-slate-300 dark:border-slate-600'
                        }`}>
                            {checkedRuleIds.has(rule.id) && (
                                <Check className="w-3 h-3 text-white" />
                            )}
                        </div>
                        {rule.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
