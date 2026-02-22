'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, AlertCircle } from 'lucide-react';
import { createJournal, updateJournal } from '@/lib/api/journal';
import { AssetType, TradeType, PositionType } from '@/type/domain/journal.enum';
import { getTradingRules } from '@/lib/api/tradingRule';
import { TradingRule } from '@/type/domain/tradingRule';
import { Journal } from '@/type/domain/journal';
import BasicTradeInfoSection from './BasicTradeInfoSection';
import PriceQuantitySection from './PriceQuantitySection';
import ChartAnalysisSection from './ChartAnalysisSection';
import PsychologyStrategySection from './PsychologyStrategySection';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FormErrors {
    symbol?: string;
    entryPrice?: string;
    submit?: string;
}

interface TradeEntryFormProps {
    onChartPreviewsChange?: (previews: string[]) => void;
    editTarget?: Journal | null;
}

/* ------------------------------------------------------------------ */
/*  Shared style constants                                             */
/* ------------------------------------------------------------------ */

const sectionCard = 'bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800';
const labelCls = 'text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block';
const inputCls = 'w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-sm h-11 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all';
const inputErrorCls = 'w-full bg-slate-100 dark:bg-slate-800 border border-red-300 dark:border-red-700 text-slate-900 dark:text-white rounded-lg text-sm h-11 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TradeEntryForm({ onChartPreviewsChange, editTarget }: TradeEntryFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // -- Basic info --
    const [assetType, setAssetType] = useState<AssetType>(AssetType.CRYPTO);
    const [assetPair, setAssetPair] = useState('');
    const [tradeType, setTradeType] = useState<TradeType>(TradeType.FUTURES);
    const [tradePosition, setTradePosition] = useState<'LONG' | 'SHORT'>('LONG');
    const [tradeDate, setTradeDate] = useState(new Date().toISOString().split('T')[0]);
    const [currency, setCurrency] = useState<string>('USDT');
    const [isClosed, setIsClosed] = useState(false);

    // -- Price & quantity --
    const [entryPrice, setEntryPrice] = useState('');
    const [exitPrice, setExitPrice] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [takeProfit, setTakeProfit] = useState('');
    const [positionSize, setPositionSize] = useState('');
    const [leverage, setLeverage] = useState('1');

    // -- Result (closed) --
    const [profitAmount, setProfitAmount] = useState('');
    const [roiAmount, setRoiAmount] = useState('');

    // -- Analysis --
    const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>([]);
    const [keyLevels, setKeyLevels] = useState('');

    // -- Chart upload --
    const [chartPreviews, setChartPreviews] = useState<string[]>([]);
    const [chartUrls, setChartUrls] = useState<string[]>([]);
    const [uploadingCount, setUploadingCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chartSectionRef = useRef<HTMLDivElement>(null);
    const resultSectionRef = useRef<HTMLDivElement>(null);
    const [highlightResult, setHighlightResult] = useState(false);
    const [isChartVisible, setIsChartVisible] = useState(true);
    const [showFullChart, setShowFullChart] = useState(false);
    const [fullChartIndex, setFullChartIndex] = useState(0);

    // -- Psychology & strategy --
    const [emotion, setEmotion] = useState<string | null>(null);
    const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

    // -- Trading rules checklist --
    const [tradingRules, setTradingRules] = useState<TradingRule[]>([]);
    const [checkedRuleIds, setCheckedRuleIds] = useState<Set<number>>(new Set());
    const [narrative, setNarrative] = useState('');

    /* ---------------------------------------------------------------- */
    /*  Load trading rules                                               */
    /* ---------------------------------------------------------------- */

    useEffect(() => {
        getTradingRules()
            .then(rules => setTradingRules(Array.isArray(rules) ? rules.filter(r => r.isActive).sort((a, b) => a.displayOrder - b.displayOrder) : []))
            .catch(() => {});
    }, []);

    /* ---------------------------------------------------------------- */
    /*  Prefill form fields when editing                                  */
    /* ---------------------------------------------------------------- */

    useEffect(() => {
        if (!editTarget) return;

        setAssetType(editTarget.assetType);
        setAssetPair(editTarget.symbol);
        setTradeType(editTarget.tradeType);
        setTradePosition(editTarget.position === PositionType.SHORT ? 'SHORT' : 'LONG');
        setTradeDate(editTarget.tradedAt ? editTarget.tradedAt.split('T')[0] : new Date().toISOString().split('T')[0]);
        setCurrency(editTarget.currency || 'USDT');

        if (editTarget.entryPrice) setEntryPrice(String(editTarget.entryPrice));
        else if (editTarget.buyPrice) setEntryPrice(String(editTarget.buyPrice));
        if (editTarget.exitPrice) setExitPrice(String(editTarget.exitPrice));
        if (editTarget.stopLoss) setStopLoss(String(editTarget.stopLoss));
        if (editTarget.takeProfitPrice ?? editTarget.takeProfit) setTakeProfit(String(editTarget.takeProfitPrice ?? editTarget.takeProfit));
        if (editTarget.positionSize) setPositionSize(String(editTarget.positionSize));
        else if (editTarget.quantity) setPositionSize(editTarget.quantity);
        if (editTarget.leverage) setLeverage(String(editTarget.leverage));

        const closed = editTarget.tradeStatus === 'CLOSED';
        setIsClosed(closed);
        if (closed && editTarget.profit) setProfitAmount(String(editTarget.profit));
        if (closed && editTarget.roi) setRoiAmount(String(editTarget.roi));

        if (editTarget.timeframes) setSelectedTimeframes(editTarget.timeframes.split(',').map(s => s.trim()));
        if (editTarget.keyLevels) setKeyLevels(editTarget.keyLevels);

        if (editTarget.chartScreenshotUrl) {
            const urls = editTarget.chartScreenshotUrl.split(',').filter(Boolean);
            setChartPreviews(urls);
            setChartUrls(urls);
            onChartPreviewsChange?.(urls);
        }

        if (editTarget.emotion) setEmotion(editTarget.emotion);

        if (editTarget.memo) {
            try {
                const parts = editTarget.memo.split('\n\n---\n');
                if (parts.length > 1) {
                    const extra = JSON.parse(parts[parts.length - 1]);
                    if (Array.isArray(extra.strategies)) setSelectedStrategies(extra.strategies);
                    setNarrative(parts.slice(0, -1).join('\n\n---\n'));
                } else {
                    try {
                        const parsed = JSON.parse(editTarget.memo);
                        if (Array.isArray(parsed.strategies)) setSelectedStrategies(parsed.strategies);
                    } catch {
                        setNarrative(editTarget.memo);
                    }
                }
            } catch {
                setNarrative(editTarget.memo);
            }
        }

        if (editTarget.narrative) setNarrative(editTarget.narrative);

        if (editTarget.checkedRuleIds) {
            const ids = editTarget.checkedRuleIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            setCheckedRuleIds(new Set(ids));
        }
    }, [editTarget, onChartPreviewsChange]);

    /* ---------------------------------------------------------------- */
    /*  Chart visibility observer                                        */
    /* ---------------------------------------------------------------- */

    useEffect(() => {
        const el = chartSectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsChartVisible(entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    /* ---------------------------------------------------------------- */
    /*  Calculations                                                     */
    /* ---------------------------------------------------------------- */

    const calcs = useMemo(() => {
        const entry = parseFloat(entryPrice) || 0;
        const sl = parseFloat(stopLoss) || 0;
        const tp = parseFloat(takeProfit) || 0;
        const size = parseFloat(positionSize) || 0;
        const lev = parseInt(leverage) || 1;
        const exit = parseFloat(exitPrice) || 0;

        const investment = entry * size;
        const maxLoss = entry && sl && size ? Math.abs(entry - sl) * size * lev : 0;
        const riskReward = entry && sl && tp && (entry !== sl) ? Math.abs(tp - entry) / Math.abs(entry - sl) : 0;

        let pnl = 0;
        let roi = 0;
        if (isClosed && entry && exit && size) {
            if (tradePosition === 'LONG') {
                pnl = (exit - entry) * size * lev;
            } else {
                pnl = (entry - exit) * size * lev;
            }
            roi = investment > 0 ? (pnl / investment) * 100 : 0;
        }

        const maxProfit = entry && tp && size ? Math.abs(tp - entry) * size * lev : 0;

        return { entry, sl, tp, size, lev, exit, investment, maxLoss, riskReward, pnl, roi, maxProfit };
    }, [entryPrice, stopLoss, takeProfit, positionSize, leverage, exitPrice, isClosed, tradePosition]);

    /* ---------------------------------------------------------------- */
    /*  Handlers                                                         */
    /* ---------------------------------------------------------------- */

    const handleToggleClosed = (closed: boolean) => {
        setIsClosed(closed);
        if (closed) {
            setTimeout(() => {
                resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                setHighlightResult(true);
                setTimeout(() => setHighlightResult(false), 1500);
            }, 250);
        }
    };

    const toggleTimeframe = (tf: string) => {
        setSelectedTimeframes(prev =>
            prev.includes(tf) ? prev.filter(t => t !== tf) : [...prev, tf]
        );
    };

    const toggleStrategy = (s: string) => {
        setSelectedStrategies(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    const toggleRule = (id: number) => {
        setCheckedRuleIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!assetPair.trim()) newErrors.symbol = '종목명을 입력해주세요';
        if (!entryPrice || parseFloat(entryPrice) <= 0) newErrors.entryPrice = '진입가를 입력해주세요';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePublish = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            const extraMemo: Record<string, unknown> = {};
            if (selectedStrategies.length > 0) extraMemo.strategies = selectedStrategies;

            const memoContent = narrative
                ? (Object.keys(extraMemo).length > 0
                    ? `${narrative}\n\n---\n${JSON.stringify(extraMemo)}`
                    : narrative)
                : (Object.keys(extraMemo).length > 0
                    ? JSON.stringify(extraMemo)
                    : '');

            const requestData = {
                assetType,
                symbol: assetPair,
                tradeType,
                position: tradePosition === 'LONG' ? PositionType.LONG : PositionType.SHORT,
                currency,
                quantity: positionSize || '0',
                buyPrice: calcs.entry,
                leverage,
                investment: calcs.investment || 0,
                profit: isClosed ? (parseFloat(profitAmount) || calcs.pnl || 0) : 0,
                roi: isClosed ? (parseFloat(roiAmount) || calcs.roi || 0) : 0,
                memo: memoContent,
                tradedAt: tradeDate,
                tradeStatus: isClosed ? 'CLOSED' : 'OPEN',
                entryPrice: calcs.entry || undefined,
                stopLoss: calcs.sl || undefined,
                takeProfitPrice: calcs.tp || undefined,
                positionSize: calcs.size || undefined,
                chartScreenshotUrl: chartUrls.length > 0 ? chartUrls.join(',') : undefined,
                timeframes: selectedTimeframes.length > 0 ? selectedTimeframes.join(',') : undefined,
                keyLevels: keyLevels || undefined,
                emotion: emotion || undefined,
                narrative: narrative || undefined,
                exitPrice: isClosed ? (calcs.exit || undefined) : undefined,
                checkedRuleIds: checkedRuleIds.size > 0 ? Array.from(checkedRuleIds).join(',') : undefined,
            };

            if (editTarget) {
                await updateJournal(editTarget.id, requestData);
            } else {
                await createJournal(requestData);
            }

            router.push('/journal');
        } catch {
            setErrors({ submit: editTarget ? '수정 중 오류가 발생했습니다. 다시 시도해주세요.' : '저장 중 오류가 발생했습니다. 다시 시도해주세요.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /*  Render                                                           */
    /* ---------------------------------------------------------------- */

    return (
        <div className="space-y-6">
            {/* Section 1: Basic Trade Info */}
            <BasicTradeInfoSection
                assetType={assetType} setAssetType={setAssetType}
                assetPair={assetPair} setAssetPair={setAssetPair}
                tradeDate={tradeDate} setTradeDate={setTradeDate}
                tradeType={tradeType} setTradeType={setTradeType}
                tradePosition={tradePosition} setTradePosition={setTradePosition}
                currency={currency} setCurrency={setCurrency}
                errors={errors} setErrors={setErrors}
                sectionCard={sectionCard} labelCls={labelCls}
                inputCls={inputCls} inputErrorCls={inputErrorCls}
            />

            {/* Section 2: Price & Quantity */}
            <PriceQuantitySection
                entryPrice={entryPrice} setEntryPrice={setEntryPrice}
                positionSize={positionSize} setPositionSize={setPositionSize}
                leverage={leverage} setLeverage={setLeverage}
                stopLoss={stopLoss} setStopLoss={setStopLoss}
                takeProfit={takeProfit} setTakeProfit={setTakeProfit}
                tradeType={tradeType}
                errors={errors} setErrors={setErrors}
                calcs={calcs}
                isClosed={isClosed} handleToggleClosed={handleToggleClosed}
                exitPrice={exitPrice} setExitPrice={setExitPrice}
                profitAmount={profitAmount} setProfitAmount={setProfitAmount}
                roiAmount={roiAmount} setRoiAmount={setRoiAmount}
                resultSectionRef={resultSectionRef} highlightResult={highlightResult}
                sectionCard={sectionCard} labelCls={labelCls}
                inputCls={inputCls} inputErrorCls={inputErrorCls}
            />

            {/* Section 3: Chart & Analysis */}
            <ChartAnalysisSection
                chartPreviews={chartPreviews}
                setChartPreviews={setChartPreviews}
                chartUrls={chartUrls}
                setChartUrls={setChartUrls}
                uploadingCount={uploadingCount}
                setUploadingCount={setUploadingCount}
                showFullChart={showFullChart}
                setShowFullChart={setShowFullChart}
                fullChartIndex={fullChartIndex}
                setFullChartIndex={setFullChartIndex}
                isChartVisible={isChartVisible}
                chartSectionRef={chartSectionRef}
                fileInputRef={fileInputRef}
                onChartPreviewsChange={onChartPreviewsChange}
                selectedTimeframes={selectedTimeframes}
                toggleTimeframe={toggleTimeframe}
                keyLevels={keyLevels}
                setKeyLevels={setKeyLevels}
                sectionCard={sectionCard}
                labelCls={labelCls}
                inputCls={inputCls}
            />

            {/* Section 4: Psychology & Strategy */}
            <PsychologyStrategySection
                emotion={emotion}
                setEmotion={setEmotion}
                selectedStrategies={selectedStrategies}
                toggleStrategy={toggleStrategy}
                tradingRules={tradingRules}
                checkedRuleIds={checkedRuleIds}
                toggleRule={toggleRule}
                sectionCard={sectionCard}
                labelCls={labelCls}
            />

            {/* Section 5: Trading Note */}
            <div className={sectionCard}>
                <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">트레이딩 노트</h2>
                </div>
                <textarea
                    placeholder="거래 근거, 시장 상황, 반성점 등을 자유롭게 작성하세요..."
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    rows={5}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-sm p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                />
            </div>

            {/* Submit Error */}
            {errors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.submit}
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pb-8">
                <button
                    type="button"
                    onClick={() => router.push('/journal')}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold rounded-xl px-6 py-3 transition-all"
                >
                    취소
                </button>
                <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSubmitting || !assetPair}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-xl shadow-emerald-900/30 px-8 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            저장 중...
                        </>
                    ) : (
                        editTarget ? '거래 수정 저장' : '거래 기록 저장'
                    )}
                </button>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 px-4 py-3 lg:hidden z-40">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{assetPair || '---'}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            tradePosition === 'LONG' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                            {tradePosition}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {calcs.riskReward > 0 && (
                            <span className="text-xs font-semibold text-slate-500">R:R 1:{calcs.riskReward.toFixed(1)}</span>
                        )}
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={isSubmitting || !assetPair}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg px-4 py-2 text-sm transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </div>
            </div>

            {/* spacer for mobile bottom bar */}
            <div className="h-16 lg:hidden" />
        </div>
    );
}
