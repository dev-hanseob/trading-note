'use client';

import {useEffect, useState, useMemo} from 'react';
import {createPortal} from 'react-dom';
import {AnimatePresence, motion} from 'framer-motion';
import Image from 'next/image';
import {
    X, Edit, Trash2, Copy, TrendingUp, TrendingDown,
    ChevronLeft, ChevronRight, Check, ImageIcon
} from 'lucide-react';
import {Journal} from "@/type/domain/journal";
import {TradeType, TradeTypeLabel, PositionTypeLabel, AssetTypeLabel} from "@/type/domain/journal.enum";
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';

interface Props {
    journal: Journal;
    journals?: Journal[];
    currentIndex?: number;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onNavigate?: (journal: Journal) => void;
    totalSeed?: number;
}

// Try to parse memo as structured JSON from TradeEntryForm
interface ParsedMemo {
    isStructured: boolean;
    narrative?: string;
    timeframes?: string[];
    keyLevels?: string;
    riskManagement?: string;
    rawText: string;
}

function parseMemo(memo: string): ParsedMemo {
    if (!memo) return {isStructured: false, rawText: ''};

    try {
        const parsed = JSON.parse(memo);
        if (typeof parsed === 'object' && parsed !== null) {
            return {
                isStructured: true,
                narrative: parsed.narrative || parsed.memo || parsed.notes || '',
                timeframes: parsed.timeframes || [],
                keyLevels: parsed.keyLevels || parsed.key_levels || '',
                riskManagement: parsed.riskManagement || parsed.risk_management || '',
                rawText: memo,
            };
        }
    } catch {
        // Not JSON, treat as plain text
    }

    return {isStructured: false, rawText: memo};
}

function formatTradeDateFull(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}.${m}.${d}`;
    } catch {
        return dateStr;
    }
}

export default function JournalDetailModal({
    journal,
    journals,
    currentIndex,
    onClose,
    onEdit,
    onDelete,
    onNavigate,
    totalSeed = 0
}: Props) {
    const [showCopyToast, setShowCopyToast] = useState(false);
    const [copiedText, setCopiedText] = useState('');
    const [showFullImage, setShowFullImage] = useState(false);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showFullImage) {
                    setShowFullImage(false);
                } else {
                    onClose();
                }
            }
        };

        // Arrow key navigation
        const handleArrowKeys = (e: KeyboardEvent) => {
            if (showFullImage) return;
            if (!journals || !onNavigate || currentIndex === undefined) return;

            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                onNavigate(journals[currentIndex - 1]);
            } else if (e.key === 'ArrowRight' && currentIndex < journals.length - 1) {
                onNavigate(journals[currentIndex + 1]);
            }
        };

        document.body.classList.add('modal-open');
        window.addEventListener('keydown', handleEsc);
        window.addEventListener('keydown', handleArrowKeys);

        return () => {
            document.body.classList.remove('modal-open');
            window.removeEventListener('keydown', handleEsc);
            window.removeEventListener('keydown', handleArrowKeys);
        };
    }, [onClose, journals, onNavigate, currentIndex, showFullImage]);

    const getRelativeTime = () => {
        try {
            return formatDistanceToNow(new Date(journal.tradedAt), {addSuffix: true, locale: ko});
        } catch {
            return journal.tradedAt;
        }
    };

    const seedRatio = useMemo(() => {
        if (totalSeed <= 0) return 0;
        return (journal.investment / totalSeed) * 100;
    }, [totalSeed, journal.investment]);

    const isProfit = journal.profit > 0;
    const isLoss = journal.profit < 0;
    const profitColor = isProfit ? 'emerald' : isLoss ? 'rose' : 'slate';

    const parsedMemo = useMemo(() => parseMemo(journal.memo), [journal.memo]);

    // Calculate R:R if stopLoss and takeProfit are available
    const riskReward = useMemo(() => {
        if (!journal.stopLoss || !journal.takeProfit || !journal.buyPrice) return null;
        const risk = Math.abs(journal.buyPrice - journal.stopLoss);
        const reward = Math.abs(journal.takeProfit - journal.buyPrice);
        if (risk === 0) return null;
        return reward / risk;
    }, [journal.buyPrice, journal.stopLoss, journal.takeProfit]);

    const maxLoss = useMemo(() => {
        if (!journal.stopLoss || !journal.buyPrice) return null;
        const qty = parseFloat(journal.quantity) || 0;
        return Math.abs(journal.buyPrice - journal.stopLoss) * qty;
    }, [journal.buyPrice, journal.stopLoss, journal.quantity]);

    const canGoPrev = journals && currentIndex !== undefined && currentIndex > 0;
    const canGoNext = journals && currentIndex !== undefined && currentIndex < journals.length - 1;

    const handleCopy = async () => {
        const textToCopy = `${journal.symbol} | ${journal.profit > 0 ? '+' : ''}${journal.profit.toLocaleString()}원 (${journal.roi > 0 ? '+' : ''}${journal.roi.toFixed(2)}%)`;
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopiedText(textToCopy);
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 3000);
        } catch (err) {
            console.error('복사 실패:', err);
        }
    };

    const modalContent = (
        <AnimatePresence>
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.15}}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
                style={{zIndex: 999999, willChange: 'opacity'}}
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
                <motion.div
                    initial={{scale: 0.95, opacity: 0, y: 20}}
                    animate={{scale: 1, opacity: 1, y: 0}}
                    exit={{scale: 0.95, opacity: 0, y: 20}}
                    transition={{duration: 0.15, ease: "easeOut"}}
                    className="bg-slate-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
                    style={{willChange: 'transform, opacity'}}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - clean, white, with actions */}
                    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <h2 className="text-xl font-bold text-white truncate">{journal.symbol}</h2>
                                {journal.tradeType === TradeType.FUTURE && journal.position && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                        journal.position === 'LONG'
                                            ? 'bg-emerald-900/30 text-emerald-400'
                                            : 'bg-red-900/30 text-red-400'
                                    }`}>
                                        {PositionTypeLabel[journal.position]}
                                        {journal.leverage && journal.leverage > 1 ? ` ${journal.leverage}x` : ''}
                                    </span>
                                )}
                                {journal.tradeType === TradeType.SPOT && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 shrink-0">
                                        현물
                                    </span>
                                )}
                            </div>
                            <span className="text-sm text-slate-400 shrink-0 hidden sm:inline">
                                {formatTradeDateFull(journal.tradedAt)}
                                <span className="ml-1 text-slate-300">({getRelativeTime()})</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                onClick={onEdit}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                                title="수정"
                            >
                                <Edit size={18}/>
                            </button>
                            <button
                                onClick={onDelete}
                                className="p-2 hover:bg-red-900/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                                title="삭제"
                            >
                                <Trash2 size={18}/>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                                title="닫기"
                            >
                                <X size={18}/>
                            </button>
                        </div>
                    </div>

                    {/* Mobile date (shown only on small screens) */}
                    <div className="px-6 py-2 text-sm text-slate-400 sm:hidden border-b border-slate-800">
                        {formatTradeDateFull(journal.tradedAt)} ({getRelativeTime()})
                    </div>

                    {/* Scrollable body */}
                    <div className="overflow-y-auto flex-1">
                        {/* P&L Hero Section */}
                        <div className={`px-6 py-6 ${
                            isProfit ? 'bg-emerald-900/20' : isLoss ? 'bg-red-900/20' : 'bg-slate-800/50'
                        }`}>
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    {isProfit && <TrendingUp className="w-6 h-6 text-emerald-500"/>}
                                    {isLoss && <TrendingDown className="w-6 h-6 text-red-400"/>}
                                    <span className={`text-3xl sm:text-4xl font-bold ${
                                        isProfit ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-slate-400'
                                    }`}>
                                        {journal.profit > 0 ? '+' : ''}{journal.profit.toLocaleString()}원
                                    </span>
                                </div>
                                <div className={`text-lg font-medium ${
                                    isProfit ? 'text-emerald-500' : isLoss ? 'text-red-400' : 'text-slate-400'
                                }`}>
                                    {journal.roi > 0 ? '+' : ''}{journal.roi.toFixed(2)}%
                                </div>
                            </div>

                            {/* Key metrics grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                    <div className="text-xs text-slate-400 mb-1">진입가</div>
                                    <div className="text-sm font-bold text-white">
                                        {journal.entryPrice
                                            ? journal.entryPrice.toLocaleString() + '원'
                                            : journal.buyPrice.toLocaleString() + '원'}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                    <div className="text-xs text-slate-400 mb-1">청산가</div>
                                    <div className="text-sm font-bold text-white">
                                        {journal.profit !== 0 && journal.buyPrice
                                            ? (() => {
                                                const qty = parseFloat(journal.quantity) || 1;
                                                const exitPrice = journal.buyPrice + (journal.profit / qty);
                                                return exitPrice.toLocaleString() + '원';
                                            })()
                                            : '-'}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                    <div className="text-xs text-slate-400 mb-1">수량</div>
                                    <div className="text-sm font-bold text-white">
                                        {journal.quantity}{journal.assetType === 'STOCK' ? '주' : ''}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                    <div className="text-xs text-slate-400 mb-1">투자금</div>
                                    <div className="text-sm font-bold text-white">
                                        {journal.investment.toLocaleString()}원
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart Screenshot (if available) */}
                        {journal.chartScreenshotUrl && (
                            <div className="px-6 py-5">
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-slate-400"/>
                                    차트 스크린샷
                                </h3>
                                <div
                                    className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-800 cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => setShowFullImage(true)}
                                >
                                    <Image
                                        src={journal.chartScreenshotUrl}
                                        alt={`${journal.symbol} 차트`}
                                        fill
                                        className="object-contain bg-slate-800/50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Trade Analysis Section */}
                        <div className="px-6 py-5 space-y-5">
                            {/* Trade Details */}
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-3">거래 정보</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                        <div className="text-xs text-slate-400 mb-0.5">자산 유형</div>
                                        <div className="text-sm font-medium text-white">
                                            {AssetTypeLabel[journal.assetType] || journal.assetType}
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                        <div className="text-xs text-slate-400 mb-0.5">시장</div>
                                        <div className="text-sm font-medium text-white">
                                            {TradeTypeLabel[journal.tradeType]}
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                        <div className="text-xs text-slate-400 mb-0.5">화폐</div>
                                        <div className="text-sm font-medium text-white">{journal.currency}</div>
                                    </div>
                                    {journal.tradeType === TradeType.FUTURE && (
                                        <>
                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <div className="text-xs text-slate-400 mb-0.5">포지션</div>
                                                <div className="text-sm font-medium text-white">
                                                    {journal.position ? PositionTypeLabel[journal.position] : '-'}
                                                </div>
                                            </div>
                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <div className="text-xs text-slate-400 mb-0.5">레버리지</div>
                                                <div className="text-sm font-medium text-white">
                                                    {journal.leverage ? `${journal.leverage}배` : '-'}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {seedRatio > 0 && (
                                        <div className="bg-slate-800/50 rounded-lg p-3">
                                            <div className="text-xs text-slate-400 mb-0.5">시드 비율</div>
                                            <div className={`text-sm font-medium ${seedRatio > 20 ? 'text-red-400' : 'text-white'}`}>
                                                {seedRatio.toFixed(1)}%
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Risk Management (if stopLoss/takeProfit available) */}
                            {(journal.stopLoss || journal.takeProfit) && (
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-3">리스크 관리</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {journal.stopLoss && (
                                            <div className="bg-red-900/20 rounded-lg p-3">
                                                <div className="text-xs text-red-400 mb-0.5">손절가</div>
                                                <div className="text-sm font-medium text-red-400">
                                                    {journal.stopLoss.toLocaleString()}원
                                                </div>
                                            </div>
                                        )}
                                        {journal.takeProfit && (
                                            <div className="bg-emerald-900/20 rounded-lg p-3">
                                                <div className="text-xs text-emerald-400 mb-0.5">익절가</div>
                                                <div className="text-sm font-medium text-emerald-400">
                                                    {journal.takeProfit.toLocaleString()}원
                                                </div>
                                            </div>
                                        )}
                                        {riskReward !== null && (
                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <div className="text-xs text-slate-400 mb-0.5">R:R</div>
                                                <div className="text-sm font-medium text-white">
                                                    1:{riskReward.toFixed(2)}
                                                </div>
                                            </div>
                                        )}
                                        {maxLoss !== null && (
                                            <div className="bg-red-900/20 rounded-lg p-3">
                                                <div className="text-xs text-red-400 mb-0.5">최대 손실</div>
                                                <div className="text-sm font-medium text-red-400">
                                                    -{maxLoss.toLocaleString()}원
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ROI Progress Bar (Fixed: proper percentage mapping) */}
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-3">수익률 분석</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs text-slate-400">투자 대비 수익률</span>
                                            <span className={`text-sm font-bold ${
                                                isProfit ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-slate-400'
                                            }`}>
                                                {journal.roi > 0 ? '+' : ''}{journal.roi.toFixed(2)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full transition-all ${
                                                    isProfit
                                                        ? 'bg-emerald-500'
                                                        : isLoss
                                                            ? 'bg-red-500'
                                                            : 'bg-slate-600'
                                                }`}
                                                style={{
                                                    width: `${Math.min(Math.abs(journal.roi), 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {seedRatio > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-xs text-slate-400">시드 투입 비율</span>
                                                <span className={`text-sm font-bold ${seedRatio > 20 ? 'text-red-400' : 'text-blue-400'}`}>
                                                    {seedRatio.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-800 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${
                                                        seedRatio > 20 ? 'bg-red-500' : 'bg-blue-400'
                                                    }`}
                                                    style={{width: `${Math.min(seedRatio, 100)}%`}}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Structured memo sections (if parsed from JSON) */}
                            {parsedMemo.isStructured && (
                                <>
                                    {parsedMemo.timeframes && parsedMemo.timeframes.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-white mb-2">타임프레임</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {parsedMemo.timeframes.map((tf, i) => (
                                                    <span key={i}
                                                          className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-medium">
                                                        {tf}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {parsedMemo.keyLevels && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-white mb-2">주요 가격대</h3>
                                            <p className="text-sm text-slate-400">{parsedMemo.keyLevels}</p>
                                        </div>
                                    )}
                                    {parsedMemo.riskManagement && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-white mb-2">리스크 관리 노트</h3>
                                            <p className="text-sm text-slate-400">{parsedMemo.riskManagement}</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Memo / Narrative */}
                            {journal.memo && (
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-3">트레이딩 메모</h3>
                                    <div className="bg-amber-900/20 rounded-xl p-4 border border-amber-800/30">
                                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {parsedMemo.isStructured
                                                ? (parsedMemo.narrative || parsedMemo.rawText)
                                                : parsedMemo.rawText}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="px-6 py-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between shrink-0">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition-colors"
                        >
                            <Copy size={14}/>
                            결과 복사
                        </button>

                        {journals && journals.length > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => canGoPrev && onNavigate?.(journals[currentIndex! - 1])}
                                    disabled={!canGoPrev}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16}/>
                                    이전
                                </button>
                                <span className="text-xs text-slate-400">
                                    {(currentIndex ?? 0) + 1} / {journals.length}
                                </span>
                                <button
                                    onClick={() => canGoNext && onNavigate?.(journals[currentIndex! + 1])}
                                    disabled={!canGoNext}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    다음
                                    <ChevronRight size={16}/>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Copy Toast */}
                    <AnimatePresence>
                        {showCopyToast && (
                            <motion.div
                                initial={{opacity: 0, y: 20, scale: 0.95}}
                                animate={{opacity: 1, y: 0, scale: 1}}
                                exit={{opacity: 0, y: 20, scale: 0.95}}
                                transition={{duration: 0.2, ease: "easeOut"}}
                                className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-50"
                            >
                                <div
                                    className="bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 max-w-xs">
                                    <div
                                        className="w-6 h-6 bg-white/25 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4"/>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm">복사 완료</p>
                                        <p className="text-emerald-100 text-xs truncate">{copiedText}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Full image overlay */}
                <AnimatePresence>
                    {showFullImage && journal.chartScreenshotUrl && (
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
                            style={{zIndex: 1000000}}
                            onClick={() => setShowFullImage(false)}
                        >
                            <button
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                                onClick={() => setShowFullImage(false)}
                            >
                                <X size={24}/>
                            </button>
                            <div className="relative w-full h-full max-w-5xl max-h-[85vh]">
                                <Image
                                    src={journal.chartScreenshotUrl}
                                    alt={`${journal.symbol} 차트`}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );

    if (typeof window === 'undefined') return null;
    return createPortal(modalContent, document.body);
}
