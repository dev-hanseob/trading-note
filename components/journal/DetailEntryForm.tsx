'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Listbox } from '@headlessui/react';
import {
    Bitcoin, TrendingUp, TrendingDown, Calendar, Coins, DollarSign,
    Target, BarChart3, Check, AlertCircle, HelpCircle,
} from 'lucide-react';
import { AssetType, PositionType, TradeType, TradeTypeLabel, PositionTypeLabel, EmotionTypeColor, EmotionTypeLabel } from '@/type/domain/journal.enum';
import { Journal } from '@/type/domain/journal';
import RiskWarningBanner from '@/components/RiskWarningBanner';
import { formatNumberInput } from '@/lib/utils/format';
import EmotionPicker from './EmotionPicker';
import RulesChecklistSection from './RulesChecklistSection';
import { UseJournalFormReturn } from './useJournalForm';

interface DetailEntryFormProps {
    form: UseJournalFormReturn;
    editTarget?: Journal;
    recentJournals: Journal[];
    onClose: () => void;
}

export default function DetailEntryForm({ form, editTarget, recentJournals, onClose }: DetailEntryFormProps) {
    const {
        assetType, setAssetType,
        currency, setCurrency,
        date, setDate,
        symbol, setSymbol,
        tradeType, setTradeType,
        position, setPosition,
        quantity, setQuantity,
        priceDisplay, setPriceDisplay,
        investmentDisplay, setInvestmentDisplay,
        profitDisplay, setProfitDisplay,
        leverage, setLeverage,
        roi, setRoi,
        memo, setMemo,
        emotion, setEmotion,
        tradingRules,
        checkedRuleIds,
        toggleRule,
        setActiveCalculation,
        errors,
        currentStep,
        steps,
        currentStepIndex,
        goToNextStep,
        getProfit,
    } = form;

    return (
        <>
            {/* Risk Warning Banner */}
            {!editTarget && recentJournals.length > 0 && (
                <div className="mb-4">
                    <RiskWarningBanner journals={recentJournals} />
                </div>
            )}

            <ProgressBar steps={steps} currentStepIndex={currentStepIndex} />

            {/* Step Content */}
            <AnimatePresence mode="wait">
                {currentStep === 'asset' && (
                    <motion.div
                        key="asset"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                거래한 자산을 선택해주세요
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                암호화폐와 주식 중 어떤 자산을 거래했나요?
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setAssetType(AssetType.CRYPTO);
                                    goToNextStep();
                                }}
                                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                                    assetType === AssetType.CRYPTO
                                        ? 'border-blue-500 bg-blue-900/20'
                                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-600'
                                }`}
                            >
                                <div className="flex flex-col items-center">
                                    <Bitcoin className="w-12 h-12 mb-3 text-orange-500" />
                                    <h4 className="font-semibold text-lg mb-1">암호화폐</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                        비트코인, 이더리움 등<br />디지털 자산
                                    </p>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setAssetType(AssetType.STOCK);
                                    goToNextStep();
                                }}
                                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                                    assetType === AssetType.STOCK
                                        ? 'border-emerald-500 bg-emerald-900/20'
                                        : 'border-slate-300 dark:border-slate-700 hover:border-emerald-600'
                                }`}
                            >
                                <div className="flex flex-col items-center">
                                    <TrendingUp className="w-12 h-12 mb-3 text-emerald-500" />
                                    <h4 className="font-semibold text-lg mb-1">주식</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                        국내외 주식,<br />ETF 등
                                    </p>
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 'basic' && (
                    <motion.div
                        key="basic"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <Calendar className="w-16 h-16 mx-auto mb-3 text-emerald-500" />
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                거래 기본 정보
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                언제, 어떤 종목을 거래했는지 알려주세요
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    거래 날짜 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white transition-colors ${
                                        errors.date
                                            ? 'border-red-500 focus:border-red-600'
                                            : 'border-slate-700 focus:border-emerald-500'
                                    }`}
                                />
                                {errors.date && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    종목명 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value)}
                                    placeholder={assetType === AssetType.CRYPTO ? "예: BTC, ETH, ADA" : "예: 삼성전자, TSLA, AAPL"}
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white transition-colors ${
                                        errors.symbol
                                            ? 'border-red-500 focus:border-red-600'
                                            : 'border-slate-700 focus:border-emerald-500'
                                    }`}
                                />
                                {errors.symbol && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.symbol}
                                    </p>
                                )}
                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                        <HelpCircle className="w-4 h-4" />
                                        {assetType === AssetType.CRYPTO
                                            ? "암호화폐의 경우 'BTC', 'ETH' 같은 심볼로 입력하세요"
                                            : "주식의 경우 '삼성전자', 'AAPL' 같은 종목명으로 입력하세요"
                                        }
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    시장 타입
                                </label>
                                <Listbox value={tradeType} onChange={setTradeType}>
                                    <div className="relative">
                                        <Listbox.Button className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-left hover:border-emerald-500 transition-colors">
                                            <span className="flex items-center gap-2">
                                                {tradeType === TradeType.SPOT ? (
                                                    <Target className="w-4 h-4 text-blue-500" />
                                                ) : (
                                                    <BarChart3 className="w-4 h-4 text-purple-500" />
                                                )}
                                                {TradeTypeLabel[tradeType]}
                                            </span>
                                        </Listbox.Button>
                                        <Listbox.Options className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-auto">
                                            {Object.values(TradeType).map((option) => (
                                                <Listbox.Option
                                                    key={option}
                                                    value={option}
                                                    className={({ active }) =>
                                                        `cursor-pointer select-none px-4 py-3 flex items-center gap-2 ${
                                                            active ? 'bg-emerald-500 text-white' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                                                        }`
                                                    }
                                                >
                                                    {option === TradeType.SPOT ? (
                                                        <Target className="w-4 h-4" />
                                                    ) : (
                                                        <BarChart3 className="w-4 h-4" />
                                                    )}
                                                    {TradeTypeLabel[option]}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </div>
                                </Listbox>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    화폐 단위
                                </label>
                                <Listbox value={currency} onChange={setCurrency}>
                                    <div className="relative">
                                        <Listbox.Button className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-left hover:border-emerald-500 transition-colors">
                                            <span className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-green-500" />
                                                {currency}
                                            </span>
                                        </Listbox.Button>
                                        <Listbox.Options className="absolute z-50 w-full bottom-full mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-auto">
                                            {['KRW', 'USD', 'USDT', 'USDC'].map((option) => (
                                                <Listbox.Option
                                                    key={option}
                                                    value={option}
                                                    className={({ active }) =>
                                                        `cursor-pointer select-none px-4 py-3 flex items-center gap-2 ${
                                                            active ? 'bg-emerald-500 text-white' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                                                        }`
                                                    }
                                                >
                                                    <DollarSign className="w-4 h-4" />
                                                    {option}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </div>
                                </Listbox>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === 'trading' && (
                    <motion.div
                        key="trading"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <Coins className="w-16 h-16 mx-auto mb-3 text-emerald-500" />
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                거래 상세 정보
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                거래 수량과 가격 정보를 입력해주세요
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    거래 수량 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder={assetType === AssetType.CRYPTO ? "예: 0.5, 1.25" : "예: 10, 100"}
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white transition-colors ${
                                        errors.quantity
                                            ? 'border-red-500 focus:border-red-600'
                                            : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                                    }`}
                                />
                                {errors.quantity && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.quantity}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    단가 ({currency}) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={priceDisplay}
                                    onChange={(e) => {
                                        setPriceDisplay(formatNumberInput(e.target.value));
                                    }}
                                    placeholder="예: 50,000,000"
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white text-right transition-colors ${
                                        errors.price
                                            ? 'border-red-500 focus:border-red-600'
                                            : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                                    }`}
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    총 투자금 ({currency}) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={investmentDisplay}
                                    onChange={(e) => {
                                        setInvestmentDisplay(formatNumberInput(e.target.value));
                                    }}
                                    placeholder="예: 1,000,000"
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white text-right transition-colors ${
                                        errors.investment
                                            ? 'border-red-500 focus:border-red-600'
                                            : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                                    }`}
                                />
                                {errors.investment && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.investment}
                                    </p>
                                )}
                            </div>

                            {tradeType === TradeType.FUTURES && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                            포지션 <span className="text-red-500">*</span>
                                        </label>
                                        <Listbox value={position} onChange={setPosition}>
                                            <div className="relative">
                                                <Listbox.Button className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white text-left transition-colors ${
                                                    errors.position
                                                        ? 'border-red-500'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                                                }`}>
                                                    <span className="flex items-center gap-2">
                                                        {position === PositionType.LONG ? (
                                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                        ) : position === PositionType.SHORT ? (
                                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                                        ) : (
                                                            <Target className="w-4 h-4 text-gray-400" />
                                                        )}
                                                        {position ? PositionTypeLabel[position] : '포지션 선택'}
                                                    </span>
                                                </Listbox.Button>
                                                <Listbox.Options className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-auto">
                                                    {Object.values(PositionType).map((option) => (
                                                        <Listbox.Option
                                                            key={option}
                                                            value={option}
                                                            className={({ active }) =>
                                                                `cursor-pointer select-none px-4 py-3 flex items-center gap-2 ${
                                                                    active ? 'bg-emerald-500 text-white' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                                                                }`
                                                            }
                                                        >
                                                            {option === PositionType.LONG ? (
                                                                <TrendingUp className="w-4 h-4" />
                                                            ) : (
                                                                <TrendingDown className="w-4 h-4" />
                                                            )}
                                                            {PositionTypeLabel[option]}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </div>
                                        </Listbox>
                                        {errors.position && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.position}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                            레버리지 (배)
                                        </label>
                                        <input
                                            type="number"
                                            value={leverage || ''}
                                            onChange={(e) => setLeverage(e.target.value)}
                                            placeholder="예: 10, 20"
                                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 transition-colors"
                                        />
                                        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                높은 레버리지는 높은 위험을 수반합니다
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}

                {currentStep === 'profit' && (
                    <motion.div
                        key="profit"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <TrendingUp className="w-16 h-16 mx-auto mb-3 text-emerald-500" />
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                손익 정보
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                거래 결과를 입력해주세요
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    실현 손익 ({currency})
                                </label>
                                <input
                                    type="text"
                                    value={profitDisplay}
                                    onChange={(e) => {
                                        setActiveCalculation('roi');
                                        setProfitDisplay(formatNumberInput(e.target.value));
                                    }}
                                    placeholder="예: +100,000 또는 -50,000"
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 text-right transition-colors font-medium ${
                                        getProfit() >= 0
                                            ? 'text-emerald-600 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500'
                                            : 'text-red-600 border-red-200 dark:border-red-700 focus:border-red-500'
                                    }`}
                                />
                                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <HelpCircle className="w-4 h-4" />
                                    손실인 경우 마이너스(-) 기호를 포함해서 입력하세요
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">또는</span>
                                <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    수익률 (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={roi}
                                    onChange={(e) => {
                                        setActiveCalculation('profit');
                                        setRoi(Number(e.target.value));
                                    }}
                                    placeholder="예: 3.25 또는 -1.50"
                                    className={`w-full px-4 py-3 border-2 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 text-right transition-colors font-medium ${
                                        roi >= 0
                                            ? 'text-emerald-600 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500'
                                            : 'text-red-600 border-red-200 dark:border-red-700 focus:border-red-500'
                                    }`}
                                />
                            </div>

                            {/* Real-time calculation display */}
                            {(getProfit() !== 0 || roi !== 0) && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">계산 결과</div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">투자금:</span>
                                            <span className="font-medium">{investmentDisplay} {currency}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">손익:</span>
                                            <span className={`font-medium ${getProfit() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {getProfit() > 0 ? '+' : ''}{profitDisplay} {currency}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">수익률:</span>
                                            <span className={`font-medium ${roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {roi > 0 ? '+' : ''}{roi.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    메모 (선택사항)
                                </label>
                                <textarea
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    rows={3}
                                    placeholder="거래에 대한 메모나 분석을 자유롭게 작성하세요"
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 transition-colors resize-none"
                                />
                            </div>

                            {/* Emotion Picker */}
                            <EmotionPicker emotion={emotion} setEmotion={setEmotion} />
                            <RulesChecklistSection
                                tradingRules={tradingRules}
                                checkedRuleIds={checkedRuleIds}
                                toggleRule={toggleRule}
                                onClose={onClose}
                            />
                        </div>
                    </motion.div>
                )}

                {currentStep === 'review' && (
                    <motion.div
                        key="review"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <Check className="w-16 h-16 mx-auto mb-3 text-emerald-500" />
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                정보 확인
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                입력한 내용을 확인하고 저장하세요
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-slate-500 dark:text-slate-400">자산 유형</span>
                                        <p className="text-slate-900 dark:text-white">{assetType === AssetType.CRYPTO ? '암호화폐' : '주식'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-500 dark:text-slate-400">종목</span>
                                        <p className="text-slate-900 dark:text-white">{symbol}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-500 dark:text-slate-400">거래일</span>
                                        <p className="text-slate-900 dark:text-white">{date}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-500 dark:text-slate-400">시장</span>
                                        <p className="text-slate-900 dark:text-white">{TradeTypeLabel[tradeType]}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-500 dark:text-slate-400">수량</span>
                                        <p className="text-slate-900 dark:text-white">{quantity}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-500 dark:text-slate-400">단가</span>
                                        <p className="text-slate-900 dark:text-white">{priceDisplay} {currency}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-500 dark:text-slate-400">투자금</span>
                                        <p className="text-slate-900 dark:text-white">{investmentDisplay} {currency}</p>
                                    </div>
                                    {tradeType === TradeType.FUTURES && position && (
                                        <div>
                                            <span className="font-medium text-slate-500 dark:text-slate-400">포지션</span>
                                            <p className="text-slate-900 dark:text-white">{PositionTypeLabel[position]}</p>
                                        </div>
                                    )}
                                    {tradeType === TradeType.FUTURES && leverage && (
                                        <div>
                                            <span className="font-medium text-slate-500 dark:text-slate-400">레버리지</span>
                                            <p className="text-slate-900 dark:text-white">{leverage}배</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={`p-6 rounded-xl border-2 ${
                                getProfit() >= 0
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}>
                                <div className="text-center">
                                    <div className={`text-3xl font-bold mb-2 ${
                                        getProfit() >= 0 ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                        {getProfit() > 0 ? '+' : ''}{profitDisplay} {currency}
                                    </div>
                                    <div className={`text-lg font-medium ${
                                        roi >= 0 ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                        수익률: {roi > 0 ? '+' : ''}{roi.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            {memo && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">메모</div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{memo}</p>
                                </div>
                            )}

                            {emotion && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">감정 상태</div>
                                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium border ${EmotionTypeColor[emotion].bg} ${EmotionTypeColor[emotion].text} ${EmotionTypeColor[emotion].border}`}>
                                        {EmotionTypeLabel[emotion]}
                                    </span>
                                </div>
                            )}

                            {errors.submit && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.submit}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// --- Sub-components ---

function ProgressBar({ steps, currentStepIndex }: {
    steps: { key: string; title: string; description: string }[];
    currentStepIndex: number;
}) {
    const stepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
        asset: Bitcoin,
        basic: Calendar,
        trading: Coins,
        profit: TrendingUp,
        review: Check,
    };

    return (
        <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
                {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const StepIcon = stepIcons[step.key] || Check;

                    return (
                        <div key={step.key} className="flex flex-col items-center flex-1">
                            <div className={`
                                w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-150 mb-1 sm:mb-2
                                ${isActive
                                    ? 'bg-emerald-600 text-white'
                                    : isCompleted
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-400'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                                }
                            `}>
                                {isCompleted ? (
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                    <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${
                                isActive ? 'text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                            }`}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1">
                <div
                    className="bg-emerald-500 h-1 rounded-full transition-all duration-150"
                    style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                />
            </div>
        </div>
    );
}

