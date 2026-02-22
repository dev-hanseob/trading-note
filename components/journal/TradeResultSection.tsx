'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Calculations {
    entry: number;
    sl: number;
    tp: number;
    size: number;
    lev: number;
    exit: number;
    investment: number;
    maxLoss: number;
    riskReward: number;
    pnl: number;
    roi: number;
    maxProfit: number;
}

interface TradeResultSectionProps {
    isClosed: boolean;
    handleToggleClosed: (closed: boolean) => void;
    exitPrice: string;
    setExitPrice: (v: string) => void;
    profitAmount: string;
    setProfitAmount: (v: string) => void;
    roiAmount: string;
    setRoiAmount: (v: string) => void;
    calcs: Calculations;
    resultSectionRef: React.RefObject<HTMLDivElement | null>;
    highlightResult: boolean;
    labelCls: string;
    inputCls: string;
}

export default function TradeResultSection({
    isClosed, handleToggleClosed,
    exitPrice, setExitPrice,
    profitAmount, setProfitAmount,
    roiAmount, setRoiAmount,
    calcs,
    resultSectionRef, highlightResult,
    labelCls, inputCls,
}: TradeResultSectionProps) {
    return (
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
    );
}
