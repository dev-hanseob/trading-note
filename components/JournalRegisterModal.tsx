'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    onClose: () => void;
}

export default function JournalRegisterModal({ onClose }: Props) {
    const [step, setStep] = useState<'assetType' | 'form'>('assetType');
    const [assetType, setAssetType] = useState<'코인' | '주식' | null>(null);
    const [currency, setCurrency] = useState<'KRW' | 'USD' | 'USDT' | 'USDC'>('KRW');

    const [date, setDate] = useState('');
    const [symbol, setSymbol] = useState('');
    const [type, setType] = useState('현물');
    const [position, setPosition] = useState('롱');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [leverage, setLeverage] = useState('');
    const [investment, setInvestment] = useState('');
    const [profit, setProfit] = useState('');
    const [roi, setRoi] = useState('');
    const [memo, setMemo] = useState('');
    const [activeCalculation, setActiveCalculation] = useState<'roi' | 'profit' | null>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEsc);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    useEffect(() => {
        if (activeCalculation !== 'roi') return;
        const parsedInvestment = parseFloat(investment);
        const parsedProfit = parseFloat(profit.replace(/[^\d.-]/g, ''));

        if (!isNaN(parsedInvestment) && !isNaN(parsedProfit) && parsedInvestment !== 0) {
            const calculatedRoi = (parsedProfit / parsedInvestment) * 100;
            const formatted = calculatedRoi.toFixed(2);
            if (roi !== formatted) {
                setRoi(formatted);
            }
        }
    }, [investment, profit, activeCalculation]);

    useEffect(() => {
        if (activeCalculation !== 'profit') return;
        const parsedInvestment = parseFloat(investment);
        const parsedRoi = parseFloat(roi);

        if (!isNaN(parsedInvestment) && !isNaN(parsedRoi)) {
            const calculatedProfit = (parsedRoi / 100) * parsedInvestment;
            const formatted = calculatedProfit >= 0 ? `+${Math.round(calculatedProfit)}` : `${Math.round(calculatedProfit)}`;
            if (profit !== formatted) {
                setProfit(formatted);
            }
        }
    }, [roi, investment, activeCalculation]);

    const handleSubmit = () => {
        const data = {
            assetType,
            currency,
            date,
            symbol,
            type,
            position: type === '선물' ? position : '',
            quantity,
            price,
            leverage: type === '선물' ? leverage : '',
            investment,
            profit,
            roi,
            memo,
        };
        console.log('📝 등록할 데이터:', data);
        onClose();
    };

    const modalContent = (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-neutral-900 p-6 rounded-lg w-full max-w-md shadow-lg space-y-4 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">매매일지 등록</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">X</button>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'assetType' && (
                            <motion.div
                                key="asset-type"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-center mb-6">자산 종류 선택</p>
                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={() => {
                                                setAssetType('코인');
                                                setStep('form');
                                            }}
                                            className="text-lg py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
                                        >
                                            코인
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAssetType('주식');
                                                setStep('form');
                                            }}
                                            className="text-lg py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
                                        >
                                            주식
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'form' && (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-neutral-800 rounded-lg shadow-sm">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">선택한 자산 종류</span>
                                <span className={`px-2 py-1 rounded-full text-white text-sm font-semibold ${ assetType === '코인' ? 'bg-blue-500' : 'bg-green-500' }`}>
                                    {assetType}
                                </span>
                            </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">화폐 단위</label>
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as any)}
                            className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:text-white"
                          >
                            <option value="KRW">KRW (₩)</option>
                            <option value="USD">USD ($)</option>
                            <option value="USDT">USDT</option>
                            <option value="USDC">USDC</option>
                          </select>
                        </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">날짜</label>
                                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                                               className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:text-white" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">종목</label>
                                        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="예: BTC/USDT"
                                               className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:text-white" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">유형</label>
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:text-white"
                                        >
                                            <option value="현물">현물</option>
                                            <option value="선물">선물</option>
                                        </select>
                                    </div>

                                    {type === '선물' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">포지션</label>
                                                <select
                                                    value={position}
                                                    onChange={(e) => setPosition(e.target.value)}
                                                    className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:text-white"
                                                >
                                                    <option value="롱">롱</option>
                                                    <option value="숏">숏</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">레버리지 (배)</label>
                                                <input type="number" value={leverage} onChange={(e) => setLeverage(e.target.value)} placeholder="예: 10"
                                                       className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:text-white" />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-1">수량</label>
                                        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="예: 0.5"
                                               className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:text-white" />
                                    </div>

                                    <div>
                                    <label className="block text-sm font-medium mb-1">단가 ({currency})</label>
                                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="예: 32000000"
                                               className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:text-white" />
                                    </div>

                                    <div>
                                    <label className="block text-sm font-medium mb-1">투자금 ({currency})</label>
                                        <input type="number" value={investment} onChange={(e) => setInvestment(e.target.value)} placeholder="예: 1000000"
                                               className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:text-white" />
                                    </div>

                                    <div>
                                    <label className="block text-sm font-medium mb-1">손익 ({currency})</label>
                                        <input type="text" value={profit} onChange={(e) => {
                                            setActiveCalculation('roi');
                                            setProfit(e.target.value);
                                        }} placeholder="예: +100000"
                                               className={`w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 ${parseFloat(profit) >= 0 ? 'text-emerald-500' : 'text-rose-500'} dark:text-white`} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">수익률 (%)</label>
                                        <input type="number" step="0.01" value={roi} onChange={(e) => {
                                            setActiveCalculation('profit');
                                            setRoi(e.target.value);
                                        }} placeholder="예: 3.25"
                                               className={`w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 ${parseFloat(roi) >= 0 ? 'text-emerald-500' : 'text-rose-500'} dark:text-white`} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">메모</label>
                                        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} placeholder="메모를 입력하세요"
                                                  className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:text-white" />
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-2">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-neutral-800"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                    >
                                        저장
                                    </button>
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
