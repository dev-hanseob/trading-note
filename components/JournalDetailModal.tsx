'use client';

import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {
    X, Edit, Trash2, Copy, TrendingUp, TrendingDown, 
    Calendar, DollarSign, BarChart3, Target, Clock,
    Activity, Zap, Award, AlertCircle, Check
} from 'lucide-react';
import {Journal} from "@/type/domain/journal";
import {TradeType, TradeTypeLabel, PositionTypeLabel} from "@/type/domain/journal.enum";
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';

interface Props {
    journal: Journal;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    totalSeed?: number;
}

export default function JournalDetailModal({ journal, onClose, onEdit, onDelete, totalSeed = 0 }: Props) {
    const [showCopyToast, setShowCopyToast] = useState(false);
    const [copiedText, setCopiedText] = useState('');
    
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        document.body.classList.add('modal-open');
        window.addEventListener('keydown', handleEsc);
        
        return () => {
            document.body.classList.remove('modal-open');
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    // 거래 중요도 계산
    const getImportanceLevel = (): 'high' | 'medium' | 'normal' => {
        const profitRatio = Math.abs(journal.profit) / Math.max(journal.investment, 1);
        const roiAbs = Math.abs(journal.roi);
        
        if (profitRatio > 0.3 || roiAbs > 20) return 'high';
        if (profitRatio > 0.1 || roiAbs > 5) return 'medium';
        return 'normal';
    };

    // 상대적 시간 표시
    const getRelativeTime = () => {
        try {
            return formatDistanceToNow(new Date(journal.tradedAt), { addSuffix: true, locale: ko });
        } catch {
            return journal.tradedAt;
        }
    };

    // 시드 대비 비율
    const getSeedRatio = () => {
        if (totalSeed <= 0) return 0;
        return (journal.investment / totalSeed) * 100;
    };

    const importance = getImportanceLevel();
    const isProfit = journal.profit > 0;
    const profitColor = isProfit ? 'emerald' : 'red';
    const seedRatio = getSeedRatio();

    const modalContent = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                style={{ zIndex: 999999, willChange: 'opacity' }}
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
                    style={{ willChange: 'transform, opacity' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 헤더 */}
                    <div className={`relative px-6 py-5 bg-gradient-to-r ${
                        importance === 'high' 
                            ? isProfit 
                                ? 'from-emerald-600 via-teal-600 to-cyan-700' 
                                : 'from-rose-600 via-red-600 to-pink-700'
                            : importance === 'medium'
                            ? isProfit 
                                ? 'from-emerald-500 via-teal-500 to-green-600' 
                                : 'from-rose-500 via-red-500 to-pink-600'
                            : isProfit 
                                ? 'from-slate-600 via-emerald-500 to-teal-600' 
                                : 'from-slate-600 via-rose-500 to-red-600'
                    } text-white`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                                    {isProfit ? (
                                        <TrendingUp className="w-6 h-6" />
                                    ) : (
                                        <TrendingDown className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{journal.symbol}</h2>
                                    <p className="text-white/80 text-sm">{TradeTypeLabel[journal.tradeType]} 거래</p>
                                </div>
                                {importance === 'high' && (
                                    <div className="px-3 py-1 bg-white/25 rounded-full backdrop-blur-sm border border-white/20">
                                        <span className="text-sm font-semibold flex items-center gap-1">
                                            {isProfit ? <Zap className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            {isProfit ? '대박' : '주의'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onEdit}
                                    className="p-2 bg-white/15 hover:bg-white/25 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="p-2 bg-white/15 hover:bg-white/25 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-white/15 hover:bg-white/25 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        {/* 메인 손익 표시 */}
                        <div className="mt-6 text-center">
                            <div className="text-3xl sm:text-4xl font-bold mb-2">
                                {journal.profit > 0 ? '+' : ''}{journal.profit.toLocaleString()}원
                            </div>
                            <div className="text-lg opacity-90">
                                수익률: {journal.roi > 0 ? '+' : ''}{journal.roi.toFixed(2)}%
                            </div>
                        </div>
                    </div>

                    {/* 본문 */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {/* 핵심 지표 카드들 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* 투자 정보 */}
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                                        <DollarSign className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">투자 규모</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">시드 대비 {seedRatio.toFixed(1)}%</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">투자금</span>
                                        <span className="font-medium">{journal.investment.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">단가</span>
                                        <span className="font-medium">{journal.buyPrice.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">수량</span>
                                        <span className="font-medium">{journal.quantity}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 거래 정보 */}
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl p-4 border border-violet-200 dark:border-violet-700 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                                        <BarChart3 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">거래 상세</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{journal.assetType}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">시장</span>
                                        <span className="font-medium">{TradeTypeLabel[journal.tradeType]}</span>
                                    </div>
                                    {journal.tradeType === TradeType.FUTURE && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">포지션</span>
                                                <span className="font-medium">{journal.position ? PositionTypeLabel[journal.position] : '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">레버리지</span>
                                                <span className="font-medium">{journal.leverage ? `${journal.leverage}배` : '-'}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">화폐</span>
                                        <span className="font-medium">{journal.currency}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 시간 정보 */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">거래 시점</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{getRelativeTime()}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">날짜</span>
                                        <span className="font-medium">{journal.tradedAt}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 수익률 시각화 */}
                        <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800/50 dark:to-gray-800/50 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                수익률 분석
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">투자 대비 수익률</span>
                                        <span className={`font-bold ${
                                            journal.roi >= 0 ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                            {journal.roi > 0 ? '+' : ''}{journal.roi.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner">
                                        <div 
                                            className={`h-3 rounded-full shadow-sm ${
                                                journal.roi >= 0 
                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                                                    : 'bg-gradient-to-r from-rose-500 to-red-600'
                                            }`}
                                            style={{ 
                                                width: `${Math.min(Math.abs(journal.roi) * 3, 100)}%`,
                                                marginLeft: journal.roi < 0 ? 'auto' : '0'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                
                                {seedRatio > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">시드 투입 비율</span>
                                            <span className="font-bold text-blue-600">
                                                {seedRatio.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner">
                                            <div 
                                                className="h-2 rounded-full bg-gradient-to-r from-slate-500 to-blue-600 shadow-sm"
                                                style={{ width: `${Math.min(seedRatio, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 메모 */}
                        {journal.memo && (
                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl p-6 border border-amber-200 dark:border-amber-700 shadow-sm">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    트레이딩 메모
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {journal.memo}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 하단 액션 버튼들 */}
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={async () => {
                                    const textToCopy = `${journal.symbol} | ${journal.profit > 0 ? '+' : ''}${journal.profit.toLocaleString()}원 (${journal.roi > 0 ? '+' : ''}${journal.roi.toFixed(2)}%)`;
                                    try {
                                        await navigator.clipboard.writeText(textToCopy);
                                        setCopiedText(textToCopy);
                                        setShowCopyToast(true);
                                        setTimeout(() => setShowCopyToast(false), 3000);
                                    } catch (err) {
                                        console.error('복사 실패:', err);
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                                결과 복사
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={onEdit}
                                    className="btn-trendy-secondary flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    수정
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="btn-trendy-danger flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 복사 완료 토스트 */}
                    <AnimatePresence>
                        {showCopyToast && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50"
                            >
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm border border-emerald-500/20">
                                    <div className="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                                        <Check className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm mb-1">클립보드에 복사되었습니다</p>
                                        <p className="text-emerald-100 text-xs truncate">
                                            {copiedText}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    if (typeof window === 'undefined') return null;
    return createPortal(modalContent, document.body);
}