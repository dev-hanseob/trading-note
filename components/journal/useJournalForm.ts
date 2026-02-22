'use client';

import { useEffect, useState, useCallback } from 'react';
import { createJournal, updateJournal } from '@/lib/api/journal';
import { getTradingRules } from '@/lib/api/tradingRule';
import { AssetType, PositionType, TradeType, EmotionType } from '@/type/domain/journal.enum';
import { addJournalRequest } from '@/type/dto/addJournalRequest';
import { Journal } from '@/type/domain/journal';
import { TradingRule } from '@/type/domain/tradingRule';
import { formatNumberInput, parseNumberInput } from '@/lib/utils/format';

export type WizardStep = 'asset' | 'basic' | 'trading' | 'profit' | 'review';

export interface UseJournalFormOptions {
    editTarget?: Journal;
    onSuccessAction: (data: Journal) => void;
    onClose: () => void;
}

export function useJournalForm({ editTarget, onSuccessAction, onClose }: UseJournalFormOptions) {
    const [currentStep, setCurrentStep] = useState<WizardStep>('asset');
    const [isQuickMode, setIsQuickMode] = useState(!editTarget);

    // Form states
    const [assetType, setAssetType] = useState<AssetType>(AssetType.CRYPTO);
    const [currency, setCurrency] = useState<'KRW' | 'USD' | 'USDT' | 'USDC'>('KRW');
    const [date, setDate] = useState<string>('');
    const [symbol, setSymbol] = useState('');
    const [tradeType, setTradeType] = useState<TradeType>(TradeType.SPOT);
    const [position, setPosition] = useState<PositionType | null>(null);
    const [quantity, setQuantity] = useState('');
    const [priceDisplay, setPriceDisplay] = useState('');
    const [investmentDisplay, setInvestmentDisplay] = useState('');
    const [profitDisplay, setProfitDisplay] = useState('');
    const [leverage, setLeverage] = useState('');
    const [roi, setRoi] = useState(0);
    const [memo, setMemo] = useState('');
    const [activeCalculation, setActiveCalculation] = useState<'roi' | 'profit' | null>(null);
    const [emotion, setEmotion] = useState<EmotionType | null>(null);
    const [tradingRules, setTradingRules] = useState<TradingRule[]>([]);
    const [checkedRuleIds, setCheckedRuleIds] = useState<Set<number>>(new Set());

    // Validation states
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Wizard configuration
    const steps: { key: WizardStep; title: string; description: string }[] = [
        { key: 'asset', title: '자산 선택', description: '거래한 자산 유형을 선택하세요' },
        { key: 'basic', title: '기본 정보', description: '거래 날짜와 종목을 입력하세요' },
        { key: 'trading', title: '거래 상세', description: '거래 수량과 가격을 입력하세요' },
        { key: 'profit', title: '손익 정보', description: '손익과 수익률을 입력하세요' },
        { key: 'review', title: '검토', description: '입력한 정보를 확인하세요' },
    ];

    const currentStepIndex = steps.findIndex(step => step.key === currentStep);
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    // Numeric value getters
    const getPrice = (): number => parseNumberInput(priceDisplay);
    const getInvestment = (): number => parseNumberInput(investmentDisplay);
    const getProfit = (): number => parseNumberInput(profitDisplay);

    // Initialize form data based on edit target
    useEffect(() => {
        if (!editTarget) {
            setCurrentStep('asset');
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
            setAssetType(AssetType.CRYPTO);
            setCurrency('KRW');
            setSymbol('');
            setTradeType(TradeType.SPOT);
            setPosition(null);
            setQuantity('');
            setPriceDisplay('0');
            setLeverage('');
            setInvestmentDisplay('0');
            setProfitDisplay('0');
            setRoi(0);
            setMemo('');
            setEmotion(null);
            setCheckedRuleIds(new Set());
            setActiveCalculation(null);
            setErrors({});
            return;
        }
        setCurrentStep('review');
        setAssetType(editTarget.assetType);
        setCurrency(editTarget.currency as 'KRW' | 'USD' | 'USDT' | 'USDC');
        setDate(editTarget.tradedAt ? editTarget.tradedAt.slice(0, 10) : '');
        setSymbol(editTarget.symbol || '');
        setTradeType(editTarget.tradeType);
        setPosition(editTarget.position ?? null);
        setQuantity(editTarget.quantity || '');
        setPriceDisplay(formatNumberInput(editTarget.buyPrice || 0));
        setLeverage(editTarget.leverage ? String(editTarget.leverage) : '');
        setInvestmentDisplay(formatNumberInput(editTarget.investment || 0));
        setProfitDisplay(formatNumberInput(editTarget.profit || 0));
        setRoi(editTarget.roi || 0);
        setMemo(editTarget.memo || '');
        setEmotion((editTarget.emotion as EmotionType) || null);
        if (editTarget?.checkedRuleIds) {
            const ids = editTarget.checkedRuleIds.split(',').map(Number).filter(n => !isNaN(n));
            setCheckedRuleIds(new Set(ids));
        } else {
            setCheckedRuleIds(new Set());
        }
        setActiveCalculation(null);
        setErrors({});
    }, [editTarget]);

    // Fetch trading rules
    useEffect(() => {
        getTradingRules()
            .then(rules => setTradingRules(Array.isArray(rules) ? rules.filter(r => r.isActive) : []))
            .catch(() => {});
    }, []);

    // ROI calculation (when profit changes)
    useEffect(() => {
        if (activeCalculation !== 'roi') return;
        const investment = getInvestment();
        const profit = getProfit();

        if (investment !== 0) {
            const calculatedRoi = (profit / investment) * 100;
            const formatted = parseFloat(calculatedRoi.toFixed(2));
            if (roi !== formatted) {
                setRoi(formatted);
            }
        }
    }, [investmentDisplay, profitDisplay, activeCalculation]);

    // Profit calculation (when ROI changes)
    useEffect(() => {
        if (activeCalculation !== 'profit') return;
        const investment = getInvestment();

        const calculatedProfit = (roi / 100) * investment;
        const rounded = Math.round(calculatedProfit);
        setProfitDisplay(formatNumberInput(rounded));
    }, [roi, investmentDisplay, activeCalculation]);

    // Validation
    const validateCurrentStep = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        switch (currentStep) {
            case 'asset':
                break;
            case 'basic':
                if (!date) newErrors.date = '날짜를 선택해주세요';
                if (!symbol.trim()) newErrors.symbol = '종목을 입력해주세요';
                break;
            case 'trading':
                if (!quantity || parseFloat(quantity) <= 0) newErrors.quantity = '올바른 수량을 입력해주세요';
                if (getPrice() <= 0) newErrors.price = '올바른 단가를 입력해주세요';
                if (getInvestment() <= 0) newErrors.investment = '올바른 투자금을 입력해주세요';
                if (tradeType === TradeType.FUTURES && !position) newErrors.position = '포지션을 선택해주세요';
                break;
            case 'profit':
                break;
            case 'review':
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [currentStep, date, symbol, quantity, tradeType, position, priceDisplay, investmentDisplay]);

    // Navigation
    const goToNextStep = useCallback(() => {
        if (!validateCurrentStep()) return;
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setCurrentStep(steps[nextIndex].key);
        }
    }, [validateCurrentStep, currentStepIndex, steps]);

    const goToPreviousStep = useCallback(() => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(steps[prevIndex].key);
        }
    }, [currentStepIndex, steps]);

    const canProceed = useCallback((): boolean => {
        switch (currentStep) {
            case 'asset': return true;
            case 'basic': return !!date && symbol.trim().length > 0;
            case 'trading': return !!quantity && parseFloat(quantity) > 0 && getPrice() > 0 && getInvestment() > 0;
            case 'profit': return true;
            case 'review': return true;
            default: return false;
        }
    }, [currentStep, date, symbol, quantity, priceDisplay, investmentDisplay]);

    const toggleRule = useCallback((id: number) => {
        setCheckedRuleIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // Submit
    const handleSubmit = useCallback(async () => {
        if (isQuickMode) {
            const quickErrors: Record<string, string> = {};
            if (!date) quickErrors.date = '날짜를 선택해주세요';
            if (!symbol.trim()) quickErrors.symbol = '종목을 입력해주세요';
            if (quickErrors.date || quickErrors.symbol) {
                setErrors(quickErrors);
                return;
            }
        }
        if (!isQuickMode && !validateCurrentStep()) return;

        setIsSubmitting(true);
        const data: addJournalRequest = {
            assetType,
            symbol,
            tradeType,
            position,
            currency,
            quantity,
            buyPrice: getPrice(),
            leverage: tradeType === TradeType.FUTURES ? leverage : undefined,
            investment: getInvestment(),
            profit: getProfit(),
            roi,
            memo,
            tradedAt: date,
            emotion: emotion || undefined,
            checkedRuleIds: checkedRuleIds.size > 0
                ? Array.from(checkedRuleIds).join(',')
                : undefined,
        };

        try {
            if (editTarget && editTarget.id) {
                const response: Journal = await updateJournal(editTarget.id, data);
                onSuccessAction(response);
            } else {
                const response: Journal = await createJournal(data);
                onSuccessAction(response);
            }
            onClose();
        } catch {
            setErrors({ submit: '저장 중 오류가 발생했습니다. 다시 시도해주세요.' });
        } finally {
            setIsSubmitting(false);
        }
    }, [
        isQuickMode, date, symbol, assetType, tradeType, position, currency, quantity,
        priceDisplay, investmentDisplay, profitDisplay, leverage, roi, memo, emotion,
        checkedRuleIds, editTarget, onSuccessAction, onClose, validateCurrentStep,
    ]);

    return {
        // Mode
        isQuickMode,
        setIsQuickMode,

        // Form values
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
        activeCalculation, setActiveCalculation,

        // Validation
        errors,
        isSubmitting,

        // Wizard
        currentStep, setCurrentStep,
        steps,
        currentStepIndex,
        isFirstStep,
        isLastStep,

        // Computed
        getPrice,
        getInvestment,
        getProfit,

        // Actions
        validateCurrentStep,
        goToNextStep,
        goToPreviousStep,
        canProceed,
        handleSubmit,
    };
}

export type UseJournalFormReturn = ReturnType<typeof useJournalForm>;
