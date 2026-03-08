'use client';

import {
    Crosshair, TrendingUp, TrendingDown, AlertCircle,
} from 'lucide-react';
import { AssetType, TradeType } from '@/type/domain/journal.enum';

interface FormErrors {
    symbol?: string;
    entryPrice?: string;
    submit?: string;
}

interface BasicTradeInfoSectionProps {
    assetType: AssetType;
    setAssetType: (v: AssetType) => void;
    assetPair: string;
    setAssetPair: (v: string) => void;
    tradeDate: string;
    setTradeDate: (v: string) => void;
    tradeType: TradeType;
    setTradeType: (v: TradeType) => void;
    tradePosition: 'LONG' | 'SHORT';
    setTradePosition: (v: 'LONG' | 'SHORT') => void;
    currency: string;
    setCurrency: (v: string) => void;
    errors: FormErrors;
    setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
    sectionCard: string;
    labelCls: string;
    inputCls: string;
    inputErrorCls: string;
}

export default function BasicTradeInfoSection({
    assetType, setAssetType,
    assetPair, setAssetPair,
    tradeDate, setTradeDate,
    tradeType, setTradeType,
    tradePosition, setTradePosition,
    currency, setCurrency,
    errors, setErrors,
    sectionCard, labelCls, inputCls, inputErrorCls,
}: BasicTradeInfoSectionProps) {
    return (
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
    );
}
