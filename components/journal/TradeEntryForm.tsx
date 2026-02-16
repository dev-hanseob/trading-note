'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crosshair, Shield, LineChart, FileText, ChevronDown,
    Upload, CheckSquare, Square, ArrowRight, Brain,
    TrendingUp, TrendingDown, X, ImageIcon, AlertCircle,
    Calculator, Tag
} from 'lucide-react';
import { createJournal, uploadChart } from '@/lib/api/journal';
import { AssetType, TradeType, PositionType } from '@/type/domain/journal.enum';

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

interface ChecklistItem {
    id: string;
    label: string;
    checked: boolean;
}

const defaultChecklist: ChecklistItem[] = [
    { id: 'htf', label: '상위 타임프레임 추세 확인했는가?', checked: false },
    { id: 'sl', label: '손절 레벨을 정했는가?', checked: false },
    { id: 'fomo', label: 'FOMO로 진입하는 것은 아닌가?', checked: false },
    { id: 'rr', label: 'R:R 비율이 적절한가?', checked: false },
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

export default function TradeEntryForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // -- 기본 정보 --
    const [assetType, setAssetType] = useState<AssetType>(AssetType.CRYPTO);
    const [assetPair, setAssetPair] = useState('');
    const [tradeType, setTradeType] = useState<TradeType>(TradeType.FUTURE);
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

    // -- 차트 업로드 --
    const [chartFile, setChartFile] = useState<File | null>(null);
    const [chartPreview, setChartPreview] = useState<string | null>(null);
    const [chartUrl, setChartUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // -- 심리 & 전략 --
    const [emotion, setEmotion] = useState<string | null>(null);
    const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

    // -- 체크리스트 & 노트 --
    const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
    const [narrative, setNarrative] = useState('');

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

    const toggleChecklist = (id: string) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    // -- Chart Upload --
    const handleFileSelect = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) return; // 5MB limit

        setChartFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setChartPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        // Upload immediately
        setIsUploading(true);
        try {
            const url = await uploadChart(file);
            setChartUrl(url);
        } catch (err) {
            console.error('Chart upload failed:', err);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const removeChart = () => {
        setChartFile(null);
        setChartPreview(null);
        setChartUrl(null);
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
            if (checklist.filter(c => c.checked).length > 0) {
                extraMemo.checklist = checklist.filter(c => c.checked).map(c => c.label);
            }

            const memoContent = narrative
                ? (Object.keys(extraMemo).length > 0
                    ? `${narrative}\n\n---\n${JSON.stringify(extraMemo)}`
                    : narrative)
                : (Object.keys(extraMemo).length > 0
                    ? JSON.stringify(extraMemo)
                    : '');

            await createJournal({
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
                chartScreenshotUrl: chartUrl || undefined,
                timeframes: selectedTimeframes.length > 0 ? selectedTimeframes.join(',') : undefined,
                keyLevels: keyLevels || undefined,
                emotion: emotion || undefined,
                narrative: narrative || undefined,
                exitPrice: isClosed ? (calcs.exit || undefined) : undefined,
            });

            router.push('/journal');
        } catch (error) {
            console.error('Failed to create journal:', error);
            setErrors({ submit: '저장 중 오류가 발생했습니다. 다시 시도해주세요.' });
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
                                onClick={() => setTradeType(TradeType.FUTURE)}
                                className={`flex-1 h-11 rounded-lg text-sm font-bold transition-all ${
                                    tradeType === TradeType.FUTURE
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

                    {/* 화폐 & 상태 */}
                    <div className="flex gap-4">
                        <div className="flex-1">
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
                        <div className="flex-1 flex items-end">
                            <label className="flex items-center gap-3 cursor-pointer h-11 w-full">
                                <div
                                    onClick={() => setIsClosed(!isClosed)}
                                    className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${isClosed ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isClosed ? 'left-[22px]' : 'left-0.5'}`} />
                                </div>
                                <span className="text-sm text-slate-500 font-medium">종료된 거래</span>
                            </label>
                        </div>
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
                    {tradeType === TradeType.FUTURE && (
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
            </div>

            {/* ============================================== */}
            {/* Section 3: 거래 결과 (종료된 경우)                */}
            {/* ============================================== */}
            <AnimatePresence>
                {isClosed && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={sectionCard}
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <ArrowRight className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">거래 결과</h2>
                        </div>
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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ============================================== */}
            {/* Section 4: 차트 & 분석                           */}
            {/* ============================================== */}
            <div className={sectionCard}>
                <div className="flex items-center gap-2 mb-6">
                    <LineChart className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">차트 & 분석</h2>
                </div>

                {/* Chart Upload */}
                {chartPreview ? (
                    <div className="relative mb-6 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                        <img src={chartPreview} alt="차트 스크린샷" className="w-full max-h-64 object-contain bg-slate-900" />
                        <button
                            type="button"
                            onClick={removeChart}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="flex items-center gap-2 text-white text-sm font-medium">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    업로드 중...
                                </div>
                            </div>
                        )}
                        {chartUrl && !isUploading && (
                            <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                업로드 완료
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center mb-6 hover:border-emerald-600 transition-all cursor-pointer group"
                    >
                        <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-emerald-400 transition-colors" />
                        <p className="text-sm text-slate-500 font-medium">차트 스크린샷을 드래그하거나 클릭하여 업로드</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP (최대 5MB)</p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                    }}
                />

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

                {/* Checklist */}
                <div>
                    <label className={labelCls}>진입 체크리스트</label>
                    <div className="space-y-2">
                        {checklist.map(item => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleChecklist(item.id)}
                                className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                            >
                                {item.checked ? (
                                    <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                                ) : (
                                    <Square className="w-5 h-5 text-slate-500 shrink-0" />
                                )}
                                <span className={`text-sm ${item.checked ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500'}`}>{item.label}</span>
                            </button>
                        ))}
                    </div>
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
                        '거래 기록 저장'
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
