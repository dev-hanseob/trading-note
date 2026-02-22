'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crosshair, Shield, LineChart, FileText, ChevronDown,
    Upload, CheckSquare, Square, ArrowRight, Brain,
    TrendingUp, TrendingDown, X, ImageIcon, AlertCircle,
    Calculator, Tag, Settings
} from 'lucide-react';
import { createJournal, updateJournal, uploadChart } from '@/lib/api/journal';
import { AssetType, TradeType, PositionType } from '@/type/domain/journal.enum';
import { getTradingRules } from '@/lib/api/tradingRule';
import { TradingRule } from '@/type/domain/tradingRule';
import { Journal } from '@/type/domain/journal';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const timeframeOptions = ['5m', '15m', '1H', '4H', '1D'];
const leverageOptions = ['1', '2', '3', '5', '10', '20', '50', '100'];

const strategyPresets = [
    '브레이크아웃', '추세추종', '눌림목', '지지/저항',
    '스캘핑', '역추세', '뉴스', '패턴', '갭',
];

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


/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

interface FormErrors {
    symbol?: string;
    entryPrice?: string;
    submit?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface TradeEntryFormProps {
    onChartPreviewsChange?: (previews: string[]) => void;
    editTarget?: Journal | null;
}

export default function TradeEntryForm({ onChartPreviewsChange, editTarget }: TradeEntryFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // -- 기본 정보 --
    const [assetType, setAssetType] = useState<AssetType>(AssetType.CRYPTO);
    const [assetPair, setAssetPair] = useState('');
    const [tradeType, setTradeType] = useState<TradeType>(TradeType.FUTURES);
    const [tradePosition, setTradePosition] = useState<'LONG' | 'SHORT'>('LONG');
    const [tradeDate, setTradeDate] = useState(new Date().toISOString().split('T')[0]);
    const [currency, setCurrency] = useState<string>('USDT');
    const [isClosed, setIsClosed] = useState(false);

    // -- 가격 & 수량 --
    const [entryPrice, setEntryPrice] = useState('');
    const [exitPrice, setExitPrice] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [takeProfit, setTakeProfit] = useState('');
    const [positionSize, setPositionSize] = useState('');
    const [leverage, setLeverage] = useState('1');

    // -- 결과 (종료 시) --
    const [profitAmount, setProfitAmount] = useState('');
    const [roiAmount, setRoiAmount] = useState('');

    // -- 분석 --
    const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>([]);
    const [keyLevels, setKeyLevels] = useState('');

    // -- 차트 업로드 (다중) --
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

    // -- 심리 & 전략 --
    const [emotion, setEmotion] = useState<string | null>(null);
    const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

    // -- 매매원칙 체크리스트 --
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

        // Parse strategies from memo
        if (editTarget.memo) {
            try {
                const parts = editTarget.memo.split('\n\n---\n');
                if (parts.length > 1) {
                    const extra = JSON.parse(parts[parts.length - 1]);
                    if (Array.isArray(extra.strategies)) setSelectedStrategies(extra.strategies);
                    setNarrative(parts.slice(0, -1).join('\n\n---\n'));
                } else {
                    // Try direct JSON parse
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
    /*  Chart visibility observer (mobile mini preview)                   */
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

        // P&L when closed
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

        // Max possible profit (to TP)
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

    // -- Chart Upload (multiple) --
    const handleFilesSelect = useCallback(async (files: File[]) => {
        const validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
        if (validFiles.length === 0) return;

        // Add previews immediately via FileReader
        const newPreviews: string[] = [];
        for (const file of validFiles) {
            const preview = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });
            newPreviews.push(preview);
        }

        setChartPreviews(prev => {
            const updated = [...prev, ...newPreviews];
            onChartPreviewsChange?.(updated);
            return updated;
        });

        // Upload each file
        setUploadingCount(prev => prev + validFiles.length);
        for (const file of validFiles) {
            try {
                const url = await uploadChart(file);
                setChartUrls(prev => [...prev, url]);
            } catch (err) {
                // upload failure handled silently - preview remains without URL
            } finally {
                setUploadingCount(prev => prev - 1);
            }
        }
    }, [onChartPreviewsChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) handleFilesSelect(files);
    }, [handleFilesSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const removeChart = (index: number) => {
        setChartPreviews(prev => {
            const updated = prev.filter((_, i) => i !== index);
            onChartPreviewsChange?.(updated);
            return updated;
        });
        setChartUrls(prev => prev.filter((_, i) => i !== index));
    };

    const removeAllCharts = () => {
        setChartPreviews([]);
        setChartUrls([]);
        onChartPreviewsChange?.([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // -- Validate --
    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!assetPair.trim()) newErrors.symbol = '종목명을 입력해주세요';
        if (!entryPrice || parseFloat(entryPrice) <= 0) newErrors.entryPrice = '진입가를 입력해주세요';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // -- Submit --
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
                // Extended backend fields
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
        } catch (error) {
            // error handled via setErrors below
            setErrors({ submit: editTarget ? '수정 중 오류가 발생했습니다. 다시 시도해주세요.' : '저장 중 오류가 발생했습니다. 다시 시도해주세요.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /*  Section styles                                                   */
    /* ---------------------------------------------------------------- */

    const sectionCard = 'bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800';
    const labelCls = 'text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block';
    const inputCls = 'w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-sm h-11 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all';
    const inputErrorCls = 'w-full bg-slate-100 dark:bg-slate-800 border border-red-300 dark:border-red-700 text-slate-900 dark:text-white rounded-lg text-sm h-11 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all';

    /* ---------------------------------------------------------------- */
    /*  Render                                                           */
    /* ---------------------------------------------------------------- */

    return (
        <div className="space-y-6">
            {/* Mobile mini preview bar - shown when chart scrolls out of viewport */}
            {chartPreviews.length > 0 && !isChartVisible && (
                <div
                    className="fixed top-14 left-0 right-0 z-30 lg:hidden cursor-pointer"
                    onClick={() => { setFullChartIndex(0); setShowFullChart(true); }}
                >
                    <div className="mx-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center gap-3 shadow-lg">
                        <img
                            src={chartPreviews[0]}
                            alt="차트 미리보기"
                            className="w-16 h-10 object-cover rounded-lg border border-slate-300 dark:border-slate-600"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                차트 스크린샷 {chartPreviews.length > 1 && `(${chartPreviews.length})`}
                            </p>
                            <p className="text-[10px] text-slate-400">탭하여 전체화면으로 보기</p>
                        </div>
                        <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                </div>
            )}

            {/* Fullscreen chart overlay */}
            {showFullChart && chartPreviews.length > 0 && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowFullChart(false)}
                >
                    <img src={chartPreviews[fullChartIndex]} alt="차트" className="max-w-full max-h-full object-contain" />
                    {chartPreviews.length > 1 && (
                        <>
                            <button
                                type="button"
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                                onClick={(e) => { e.stopPropagation(); setFullChartIndex(i => (i - 1 + chartPreviews.length) % chartPreviews.length); }}
                            >
                                <ChevronDown className="w-5 h-5 rotate-90" />
                            </button>
                            <button
                                type="button"
                                className="absolute right-14 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                                onClick={(e) => { e.stopPropagation(); setFullChartIndex(i => (i + 1) % chartPreviews.length); }}
                            >
                                <ChevronDown className="w-5 h-5 -rotate-90" />
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                        onClick={() => setShowFullChart(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* ============================================== */}
            {/* Section 1: 거래 기본 정보                        */}
            {/* ============================================== */}
            <div className={sectionCard}>
                <div className="flex items-center gap-2 mb-6">
                    <Crosshair className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">거래 기본 정보</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 자산 유형 */}
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

                    {/* 종목 */}
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

                    {/* 거래일 */}
                    <div>
                        <label className={labelCls}>거래일</label>
                        <input
                            type="date"
                            value={tradeDate}
                            onChange={(e) => setTradeDate(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    {/* 거래 유형 */}
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

                    {/* 포지션 LONG / SHORT */}
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

                    {/* 화폐 */}
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

            {/* ============================================== */}
            {/* Section 2: 가격 & 수량                           */}
            {/* ============================================== */}
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

                {/* 리스크 관리 */}
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

                {/* 실시간 계산 결과 */}
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

                {/* 거래 종료 */}
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

            {/* ============================================== */}
            {/* Section 3: 차트 & 분석                           */}
            {/* ============================================== */}
            <div className={sectionCard}>
                <div className="flex items-center gap-2 mb-6">
                    <LineChart className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">차트 & 분석</h2>
                </div>

                {/* Chart Upload (multiple) */}
                <div ref={chartSectionRef}>
                {chartPreviews.length > 0 && (
                    <div className="mb-4 space-y-3">
                        {/* Image grid */}
                        <div className={`grid gap-3 ${chartPreviews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {chartPreviews.map((preview, i) => (
                                <div key={i} className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group">
                                    <img
                                        src={preview}
                                        alt={`차트 ${i + 1}`}
                                        className="w-full max-h-48 object-contain bg-slate-100 dark:bg-slate-900 cursor-pointer"
                                        onClick={() => { setFullChartIndex(i); setShowFullChart(true); }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeChart(i)}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    {i < chartUrls.length && (
                                        <div className="absolute bottom-1.5 left-1.5 bg-emerald-500/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                            {i + 1}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Upload status + actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {uploadingCount > 0 && (
                                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                        {uploadingCount}개 업로드 중...
                                    </span>
                                )}
                                {uploadingCount === 0 && chartUrls.length > 0 && (
                                    <span className="text-xs text-emerald-500 font-medium">{chartUrls.length}개 업로드 완료</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors"
                                >
                                    + 추가
                                </button>
                                <button
                                    type="button"
                                    onClick={removeAllCharts}
                                    className="text-xs text-slate-400 hover:text-red-400 font-medium transition-colors"
                                >
                                    전체 삭제
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {chartPreviews.length === 0 && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center mb-6 hover:border-emerald-600 transition-all cursor-pointer group"
                    >
                        <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-emerald-400 transition-colors" />
                        <p className="text-sm text-slate-500 font-medium">차트 스크린샷을 드래그하거나 클릭하여 업로드</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP (최대 5MB) - 여러 장 선택 가능</p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) handleFilesSelect(files);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                />
                </div>

                <div className="space-y-4">
                    {/* Timeframes */}
                    <div>
                        <label className={labelCls}>타임프레임</label>
                        <div className="flex flex-wrap gap-2">
                            {timeframeOptions.map(tf => (
                                <button
                                    key={tf}
                                    type="button"
                                    onClick={() => toggleTimeframe(tf)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                        selectedTimeframes.includes(tf)
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                                            : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Key Levels */}
                    <div>
                        <label className={labelCls}>주요 가격대</label>
                        <input
                            type="text"
                            placeholder="예: 지지: 96,000 / 저항: 100,000"
                            value={keyLevels}
                            onChange={(e) => setKeyLevels(e.target.value)}
                            className={inputCls}
                        />
                    </div>
                </div>
            </div>

            {/* ============================================== */}
            {/* Section 5: 심리 & 전략                           */}
            {/* ============================================== */}
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

            {/* ============================================== */}
            {/* Section 6: 트레이딩 노트                         */}
            {/* ============================================== */}
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

            {/* ============================================== */}
            {/* Submit Error                                     */}
            {/* ============================================== */}
            {errors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.submit}
                    </p>
                </div>
            )}

            {/* ============================================== */}
            {/* Action Buttons                                   */}
            {/* ============================================== */}
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

            {/* ============================================== */}
            {/* Mobile Bottom Bar                                */}
            {/* ============================================== */}
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
