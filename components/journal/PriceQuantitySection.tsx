'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, AlertCircle, Calculator,
} from 'lucide-react';
import { TradeType } from '@/type/domain/journal.enum';
import TradeResultSection from './TradeResultSection';

const leverageOptions = ['1', '2', '3', '5', '10', '20', '50', '100'];

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

interface FormErrors {
    symbol?: string;
    entryPrice?: string;
    submit?: string;
}

interface PriceQuantitySectionProps {
    entryPrice: string;
    setEntryPrice: (v: string) => void;
    positionSize: string;
    setPositionSize: (v: string) => void;
    leverage: string;
    setLeverage: (v: string) => void;
    stopLoss: string;
    setStopLoss: (v: string) => void;
    takeProfit: string;
    setTakeProfit: (v: string) => void;
    tradeType: TradeType;
    errors: FormErrors;
    setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
    calcs: Calculations;
    // Trade status & result
    isClosed: boolean;
    handleToggleClosed: (closed: boolean) => void;
    exitPrice: string;
    setExitPrice: (v: string) => void;
    profitAmount: string;
    setProfitAmount: (v: string) => void;
    roiAmount: string;
    setRoiAmount: (v: string) => void;
    resultSectionRef: React.RefObject<HTMLDivElement | null>;
    highlightResult: boolean;
    sectionCard: string;
    labelCls: string;
    inputCls: string;
    inputErrorCls: string;
}

export default function PriceQuantitySection({
    entryPrice, setEntryPrice,
    positionSize, setPositionSize,
    leverage, setLeverage,
    stopLoss, setStopLoss,
    takeProfit, setTakeProfit,
    tradeType,
    errors, setErrors,
    calcs,
    isClosed, handleToggleClosed,
    exitPrice, setExitPrice,
    profitAmount, setProfitAmount,
    roiAmount, setRoiAmount,
    resultSectionRef, highlightResult,
    sectionCard, labelCls, inputCls, inputErrorCls,
}: PriceQuantitySectionProps) {
    return (
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

            {/* Trade Status & Result */}
            <TradeResultSection
                isClosed={isClosed}
                handleToggleClosed={handleToggleClosed}
                exitPrice={exitPrice}
                setExitPrice={setExitPrice}
                profitAmount={profitAmount}
                setProfitAmount={setProfitAmount}
                roiAmount={roiAmount}
                setRoiAmount={setRoiAmount}
                calcs={calcs}
                resultSectionRef={resultSectionRef}
                highlightResult={highlightResult}
                labelCls={labelCls}
                inputCls={inputCls}
            />
        </div>
    );
}
