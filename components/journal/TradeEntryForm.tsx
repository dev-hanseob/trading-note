'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crosshair, Shield, FileText,
    ArrowRight,
    TrendingUp, TrendingDown, AlertCircle,
    Calculator,
} from 'lucide-react';
import { createJournal, updateJournal } from '@/lib/api/journal';
import { AssetType, TradeType, PositionType } from '@/type/domain/journal.enum';
import { getTradingRules } from '@/lib/api/tradingRule';
import { TradingRule } from '@/type/domain/tradingRule';
import { Journal } from '@/type/domain/journal';
import ChartAnalysisSection from './ChartAnalysisSection';
import PsychologyStrategySection from './PsychologyStrategySection';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const leverageOptions = ['1', '2', '3', '5', '10', '20', '50', '100'];

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
            <div className={sectionCard}>
                <div className="flex items-center gap-2 mb-6">
                    <Crosshair className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">거래 기본 정보</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>자산 유형</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setAssetType(AssetType.CRYPTO)}
                                className={`flex-1 h-11 rounded-lg text-sm font-bold transition-all ${
                                    assetType === AssetType.CRYPTO
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:border-emerald-600'
                                }`}
                            >
                                암호화폐
                            </button>
                            <button
                                type="button"
                                onClick={() => setAssetType(AssetType.STOCK)}
                                className={`flex-1 h-11 rounded-lg text-sm font-bold transition-all ${
                                    assetType === AssetType.STOCK
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:border-emerald-600'
                                }`}
                            >
                                주식
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>종목명 <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            placeholder={assetType === AssetType.CRYPTO ? '예: BTC/USDT' : '예: 삼성전자'}
                            value={assetPair}
                            onChange={(e) => { setAssetPair(e.target.value); if (errors.symbol) setErrors(prev => ({ ...prev, symbol: undefined })); }}
                            className={errors.symbol ? inputErrorCls : inputCls}
                        />
                        {errors.symbol && (
                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.symbol}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelCls}>거래일</label>
                        <input
                            type="date"
                            value={tradeDate}
                            onChange={(e) => setTradeDate(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label className={labelCls}>거래 유형</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setTradeType(TradeType.SPOT)}
                                className={`flex-1 h-11 rounded-lg text-sm font-bold transition-all ${
                                    tradeType === TradeType.SPOT
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-600'
                                }`}
                            >
                                현물
                            </button>
                            <button
                                type="button"
                                onClick={() => setTradeType(TradeType.FUTURES)}
                                className={`flex-1 h-11 rounded-lg text-sm font-bold transition-all ${
                                    tradeType === TradeType.FUTURES
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-600'
                                }`}
                            >
                                선물
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>포지션</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setTradePosition('LONG')}
                                className={`flex-1 h-11 rounded-lg text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                                    tradePosition === 'LONG'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400 hover:border-emerald-600'
                                }`}
                            >
                                <TrendingUp className="w-4 h-4" />
                                LONG
                            </button>
                            <button
                                type="button"
                                onClick={() => setTradePosition('SHORT')}
                                className={`flex-1 h-11 rounded-lg text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                                    tradePosition === 'SHORT'
                                        ? 'bg-rose-500 text-white shadow-lg shadow-red-900/30'
                                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400 hover:border-red-600'
                                }`}
                            >
                                <TrendingDown className="w-4 h-4" />
                                SHORT
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>화폐</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className={`${inputCls} appearance-none`}
                        >
                            <option value="KRW">KRW</option>
                            <option value="USD">USD</option>
                            <option value="USDT">USDT</option>
                            <option value="USDC">USDC</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 2: Price & Quantity */}
            <div className={sectionCard}>
                <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">가격 & 수량</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelCls}>진입가 <span className="text-red-400">*</span></label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={entryPrice}
                            onChange={(e) => { setEntryPrice(e.target.value); if (errors.entryPrice) setErrors(prev => ({ ...prev, entryPrice: undefined })); }}
                            className={errors.entryPrice ? inputErrorCls : inputCls}
                        />
                        {errors.entryPrice && (
                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.entryPrice}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className={labelCls}>수량</label>
                        <input type="number" placeholder="0.00" value={positionSize} onChange={(e) => setPositionSize(e.target.value)} className={inputCls} />
                    </div>
                    {tradeType === TradeType.FUTURES && (
                        <div>
                            <label className={labelCls}>레버리지</label>
                            <select value={leverage} onChange={(e) => setLeverage(e.target.value)} className={`${inputCls} appearance-none`}>
                                {leverageOptions.map(l => <option key={l} value={l}>{l}x</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Calculator className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">리스크 관리</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>손절가 (SL)</label>
                            <input type="number" placeholder="0.00" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>익절가 (TP)</label>
                            <input type="number" placeholder="0.00" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className={inputCls} />
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {(calcs.investment > 0 || calcs.maxLoss > 0 || calcs.riskReward > 0) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                                <div>
                                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">투자금</div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {calcs.investment > 0 ? calcs.investment.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '---'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">최대 손실</div>
                                    <div className="text-sm font-bold text-red-400">
                                        {calcs.maxLoss > 0 ? `-${calcs.maxLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '---'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">최대 수익</div>
                                    <div className="text-sm font-bold text-emerald-400">
                                        {calcs.maxProfit > 0 ? `+${calcs.maxProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '---'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">R:R 비율</div>
                                    <div className={`text-sm font-bold ${calcs.riskReward >= 2 ? 'text-emerald-400' : calcs.riskReward >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
                                        {calcs.riskReward > 0 ? `1:${calcs.riskReward.toFixed(2)}` : '---'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                거래 상태
                            </span>
                        </div>
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => handleToggleClosed(false)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                    !isClosed
                                        ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-500'
                                }`}
                            >
                                진행중
                            </button>
                            <button
                                type="button"
                                onClick={() => handleToggleClosed(true)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                    isClosed
                                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-900/30'
                                        : 'text-slate-400 hover:text-slate-500'
                                }`}
                            >
                                종료
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isClosed && (
                            <motion.div
                                ref={resultSectionRef}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="overflow-hidden"
                            >
                                <div className={`p-4 rounded-xl border transition-all duration-500 ${
                                    highlightResult
                                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800/40'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                                }`}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={labelCls}>청산가</label>
                                            <input type="number" placeholder="0.00" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>실현 손익</label>
                                            <input type="number" placeholder="자동 계산 또는 직접 입력" value={profitAmount} onChange={(e) => setProfitAmount(e.target.value)} className={inputCls} />
                                            {calcs.pnl !== 0 && !profitAmount && (
                                                <p className="mt-1 text-xs text-slate-400">
                                                    자동 계산: <span className={calcs.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>{calcs.pnl >= 0 ? '+' : ''}{calcs.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={labelCls}>ROI (%)</label>
                                            <input type="number" placeholder="자동 계산 또는 직접 입력" value={roiAmount} onChange={(e) => setRoiAmount(e.target.value)} className={inputCls} />
                                            {calcs.roi !== 0 && !roiAmount && (
                                                <p className="mt-1 text-xs text-slate-400">
                                                    자동 계산: <span className={calcs.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}>{calcs.roi >= 0 ? '+' : ''}{calcs.roi.toFixed(2)}%</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

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
