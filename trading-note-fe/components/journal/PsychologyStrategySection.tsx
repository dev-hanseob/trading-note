'use client';

import Link from 'next/link';
import { Brain, CheckSquare, Square, Settings } from 'lucide-react';
import { TradingRule } from '@/type/domain/tradingRule';

interface EmotionOption {
    value: string;
    label: string;
    icon: string;
    activeClasses: string;
    textClass: string;
}

const emotions: EmotionOption[] = [
    { value: 'ANXIOUS',    label: '불안',   icon: '😟', activeClasses: 'border-orange-400 bg-orange-900/20',  textClass: 'text-orange-400' },
    { value: 'FOMO',       label: '공포',   icon: '😰', activeClasses: 'border-red-400 bg-red-900/20',       textClass: 'text-red-400' },
    { value: 'CALM',       label: '평온',   icon: '😐', activeClasses: 'border-slate-400 bg-slate-800',   textClass: 'text-slate-400' },
    { value: 'CONFIDENT',  label: '자신감', icon: '😊', activeClasses: 'border-emerald-400 bg-emerald-900/20', textClass: 'text-emerald-400' },
    { value: 'REVENGE',    label: '탐욕',   icon: '🤑', activeClasses: 'border-amber-400 bg-amber-900/20',   textClass: 'text-amber-400' },
];

const strategyPresets = [
    '브레이크아웃', '추세추종', '눌림목', '지지/저항',
    '스캘핑', '역추세', '뉴스', '패턴', '갭',
];

interface PsychologyStrategySectionProps {
    emotion: string | null;
    setEmotion: React.Dispatch<React.SetStateAction<string | null>>;
    selectedStrategies: string[];
    toggleStrategy: (s: string) => void;
    tradingRules: TradingRule[];
    checkedRuleIds: Set<number>;
    toggleRule: (id: number) => void;
    sectionCard: string;
    labelCls: string;
}

export default function PsychologyStrategySection({
    emotion,
    setEmotion,
    selectedStrategies,
    toggleStrategy,
    tradingRules,
    checkedRuleIds,
    toggleRule,
    sectionCard,
    labelCls,
}: PsychologyStrategySectionProps) {
    return (
        <div className={sectionCard}>
            <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">심리 & 전략</h2>
            </div>

            {/* Emotion Selector */}
            <div className="mb-6">
                <label className={labelCls}>진입 시 감정</label>
                <div className="flex flex-wrap gap-2">
                    {emotions.map(em => (
                        <button
                            key={em.value}
                            type="button"
                            onClick={() => setEmotion(prev => prev === em.value ? null : em.value)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                                emotion === em.value
                                    ? em.activeClasses + ' shadow-sm'
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                            }`}
                        >
                            <span className="text-lg">{em.icon}</span>
                            <span className={`text-sm font-medium ${
                                emotion === em.value ? em.textClass : 'text-slate-400'
                            }`}>
                                {em.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Strategy Tags */}
            <div className="mb-6">
                <label className={labelCls}>전략 태그</label>
                <div className="flex flex-wrap gap-2">
                    {strategyPresets.map(strategy => (
                        <button
                            key={strategy}
                            type="button"
                            onClick={() => toggleStrategy(strategy)}
                            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                                selectedStrategies.includes(strategy)
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {strategy}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trading Rules Checklist */}
            <div>
                <label className={labelCls}>매매원칙 체크리스트</label>
                {tradingRules.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-sm text-slate-400 mb-2">등록된 매매원칙이 없습니다</p>
                        <Link
                            href="/settings"
                            className="inline-flex items-center gap-1.5 text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            설정에서 매매원칙 추가
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tradingRules.map(rule => (
                            <button
                                key={rule.id}
                                type="button"
                                onClick={() => toggleRule(rule.id)}
                                className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                            >
                                {checkedRuleIds.has(rule.id) ? (
                                    <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                                ) : (
                                    <Square className="w-5 h-5 text-slate-500 shrink-0" />
                                )}
                                <span className={`text-sm ${checkedRuleIds.has(rule.id) ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500'}`}>{rule.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
