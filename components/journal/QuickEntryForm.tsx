'use client';

import { AlertCircle } from 'lucide-react';
import { AssetType, PositionType, TradeType, EmotionType, EmotionTypeLabel, EmotionTypeColor } from '@/type/domain/journal.enum';
import { Journal } from '@/type/domain/journal';
import { TradingRule } from '@/type/domain/tradingRule';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { formatNumberInput } from '@/lib/utils/format';
import RiskWarningBanner from '@/components/RiskWarningBanner';
import { UseJournalFormReturn } from './useJournalForm';

interface QuickEntryFormProps {
    form: UseJournalFormReturn;
    editTarget?: Journal;
    recentJournals: Journal[];
    onClose: () => void;
}

export default function QuickEntryForm({ form, editTarget, recentJournals, onClose }: QuickEntryFormProps) {
    const {
        assetType, setAssetType,
        currency, setCurrency,
        date, setDate,
        symbol, setSymbol,
        tradeType, setTradeType,
        position, setPosition,
        quantity, setQuantity,
        priceDisplay, setPriceDisplay,
        investmentDisplay, setInvestmentDisplay,
        profitDisplay, setProfitDisplay,
        leverage, setLeverage,
        roi, setRoi,
        memo, setMemo,
        emotion, setEmotion,
        tradingRules,
        checkedRuleIds,
        toggleRule,
        setActiveCalculation,
        errors,
        getProfit,
    } = form;

    return (
        <div className="space-y-4">
            {/* Risk Warning Banner */}
            {!editTarget && recentJournals.length > 0 && (
                <div className="mb-4">
                    <RiskWarningBanner journals={recentJournals} />
                </div>
            )}

            {/* Asset Type Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setAssetType(AssetType.CRYPTO)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        assetType === AssetType.CRYPTO ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                >
                    암호화폐
                </button>
                <button
                    onClick={() => setAssetType(AssetType.STOCK)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        assetType === AssetType.STOCK ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                >
                    주식
                </button>
            </div>

            {/* Date + Symbol row */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">거래일</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">종목</label>
                    <input
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        placeholder={assetType === AssetType.CRYPTO ? 'BTC' : '삼성전자'}
                        className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Trade Type + Currency */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">시장</label>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => { setTradeType(TradeType.SPOT); setPosition(null); }}
                            className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                                tradeType === TradeType.SPOT ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' : 'bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                            }`}
                        >
                            현물
                        </button>
                        <button
                            onClick={() => setTradeType(TradeType.FUTURES)}
                            className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                                tradeType === TradeType.FUTURES ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' : 'bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                            }`}
                        >
                            선물
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">화폐</label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                        <option value="KRW">KRW</option>
                        <option value="USD">USD</option>
                        <option value="USDT">USDT</option>
                        <option value="USDC">USDC</option>
                    </select>
                </div>
            </div>

            {/* Position + Leverage (only for futures) */}
            {tradeType === TradeType.FUTURES && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">포지션</label>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setPosition(PositionType.LONG)}
                                className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                                    position === PositionType.LONG ? 'bg-emerald-600 text-white' : 'bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                                }`}
                            >
                                LONG
                            </button>
                            <button
                                onClick={() => setPosition(PositionType.SHORT)}
                                className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                                    position === PositionType.SHORT ? 'bg-red-600 text-white' : 'bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                                }`}
                            >
                                SHORT
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">레버리지</label>
                        <input
                            type="number"
                            value={leverage}
                            onChange={(e) => setLeverage(e.target.value)}
                            placeholder="10"
                            className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* Quantity + Price */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">수량</label>
                    <input
                        type="number"
                        step="any"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="0.5"
                        className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">단가</label>
                    <input
                        type="text"
                        value={priceDisplay}
                        onChange={(e) => setPriceDisplay(formatNumberInput(e.target.value))}
                        placeholder="50,000"
                        className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white text-right placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors tabular-nums"
                    />
                </div>
            </div>

            {/* Investment */}
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">투자금 ({currency})</label>
                <input
                    type="text"
                    value={investmentDisplay}
                    onChange={(e) => setInvestmentDisplay(formatNumberInput(e.target.value))}
                    placeholder="1,000,000"
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white text-right placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors tabular-nums"
                />
            </div>

            {/* Profit + ROI */}
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">손익 ({currency})</label>
                    <input
                        type="text"
                        value={profitDisplay}
                        onChange={(e) => {
                            setActiveCalculation('roi');
                            setProfitDisplay(formatNumberInput(e.target.value));
                        }}
                        placeholder="+100,000"
                        className={`w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-lg text-sm text-right font-medium tabular-nums focus:outline-none transition-colors ${
                            getProfit() > 0 ? 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400' : getProfit() < 0 ? 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400' : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                        }`}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">ROI %</label>
                    <input
                        type="number"
                        step="0.01"
                        value={roi}
                        onChange={(e) => {
                            setActiveCalculation('profit');
                            setRoi(Number(e.target.value));
                        }}
                        placeholder="3.2"
                        className={`w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-lg text-sm text-right font-medium tabular-nums focus:outline-none transition-colors ${
                            roi > 0 ? 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400' : roi < 0 ? 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400' : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                        }`}
                    />
                </div>
            </div>

            {/* Memo */}
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">메모 (선택)</label>
                <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    rows={2}
                    placeholder="간단한 메모..."
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                />
            </div>

            {/* Emotion Picker */}
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    지금 감정 상태 (선택)
                </label>
                <div className="flex flex-wrap gap-2">
                    {Object.values(EmotionType).map((type) => {
                        const isSelected = emotion === type;
                        const colors = EmotionTypeColor[type];
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setEmotion(isSelected ? null : type)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                    isSelected
                                        ? `${colors.bg} ${colors.text} ${colors.border}`
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                {EmotionTypeLabel[type]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Rules Checklist */}
            <RulesChecklistSection
                tradingRules={tradingRules}
                checkedRuleIds={checkedRuleIds}
                toggleRule={toggleRule}
                onClose={onClose}
            />

            {/* Submit Error */}
            {errors.submit && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.submit}
                    </p>
                </div>
            )}
        </div>
    );
}

function RulesChecklistSection({
    tradingRules,
    checkedRuleIds,
    toggleRule,
    onClose,
}: {
    tradingRules: TradingRule[];
    checkedRuleIds: Set<number>;
    toggleRule: (id: number) => void;
    onClose: () => void;
}) {
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
