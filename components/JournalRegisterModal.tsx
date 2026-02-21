'use client';

import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {Listbox} from '@headlessui/react';
import {
    Bitcoin, TrendingUp, TrendingDown, Calendar, Hash, Coins, DollarSign, 
    Target, BarChart3, FileText, Check, ArrowLeft, ArrowRight,
    AlertCircle, HelpCircle, Smartphone, Laptop
} from 'lucide-react';
import {createJournal, updateJournal} from '@/lib/api/journal';
import {getTradingRules} from '@/lib/api/tradingRule';
import {AssetType, PositionType, TradeType, TradeTypeLabel, PositionTypeLabel, EmotionType, EmotionTypeLabel, EmotionTypeColor} from "@/type/domain/journal.enum";
import {addJournalRequest} from "@/type/dto/addJournalRequest";
import {Journal} from "@/type/domain/journal";
import {TradingRule} from '@/type/domain/tradingRule';
import RiskWarningBanner from "@/components/RiskWarningBanner";
import Link from 'next/link';

interface Props {
    onClose: () => void;
    onSuccessAction: (data: Journal) => void;
    editTarget?: Journal;
    recentJournals?: Journal[];
}

type WizardStep = 'asset' | 'basic' | 'trading' | 'profit' | 'review';

export default function JournalRegisterModal({ onClose, onSuccessAction, editTarget, recentJournals = [] }: Props) {
    const [currentStep, setCurrentStep] = useState<WizardStep>('asset');
    const [isQuickMode, setIsQuickMode] = useState(!editTarget); // Quick mode by default for new entries
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
    const steps: { key: WizardStep; title: string; icon: any; description: string }[] = [
        { key: 'asset', title: '자산 선택', icon: Bitcoin, description: '거래한 자산 유형을 선택하세요' },
        { key: 'basic', title: '기본 정보', icon: Calendar, description: '거래 날짜와 종목을 입력하세요' },
        { key: 'trading', title: '거래 상세', icon: Coins, description: '거래 수량과 가격을 입력하세요' },
        { key: 'profit', title: '손익 정보', icon: TrendingUp, description: '손익과 수익률을 입력하세요' },
        { key: 'review', title: '검토', icon: Check, description: '입력한 정보를 확인하세요' }
    ];
    
    const currentStepIndex = steps.findIndex(step => step.key === currentStep);
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;
    
    // 숫자 포맷팅 함수
    const formatNumber = (value: string | number): string => {
        if (typeof value === 'number') value = value.toString();
        // 숫자만 추출
        const numberOnly = value.replace(/[^\d-]/g, '');
        // 음수 처리
        if (numberOnly.startsWith('-')) {
            return '-' + numberOnly.substring(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        // 양수 처리
        return numberOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // 쉼표 제거하고 숫자로 변환
    const parseNumber = (value: string): number => {
        return parseFloat(value.replace(/,/g, '')) || 0;
    };

    // 실제 숫자 값 계산 함수 (표시용 문자열에서 숫자 추출)
    const getPrice = (): number => parseNumber(priceDisplay);
    const getInvestment = (): number => parseNumber(investmentDisplay);
    const getProfit = (): number => parseNumber(profitDisplay);
    
    // Initialize form data based on edit target
    useEffect(() => {
        if (!editTarget) {
            // Reset for new entry
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
        // Edit mode initialization
        setCurrentStep('review');
        setAssetType(editTarget.assetType);
        setCurrency(editTarget.currency as 'KRW' | 'USD' | 'USDT' | 'USDC');
        setDate(editTarget.tradedAt ? editTarget.tradedAt.slice(0, 10) : '');
        setSymbol(editTarget.symbol || '');
        setTradeType(editTarget.tradeType);
        setPosition(editTarget.position ?? null);
        setQuantity(editTarget.quantity || '');
        setPriceDisplay(formatNumber(editTarget.buyPrice || 0));
        setLeverage(editTarget.leverage ? String(editTarget.leverage) : '');
        setInvestmentDisplay(formatNumber(editTarget.investment || 0));
        setProfitDisplay(formatNumber(editTarget.profit || 0));
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

    useEffect(() => {
        getTradingRules()
            .then(rules => setTradingRules(Array.isArray(rules) ? rules.filter(r => r.isActive) : []))
            .catch(err => console.error('Failed to load trading rules:', err));
    }, []);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        // 터치 이벤트 방지 함수 (모바일 스크롤 방지)
        const preventTouch = (e: TouchEvent) => {
            // 모달 내부 스크롤 가능한 영역은 제외
            const target = e.target as Element;
            const modalContent = target.closest('.modal-content-scrollable');
            if (!modalContent) {
                e.preventDefault();
            }
        };
        
        // 현재 스크롤 위치 저장
        const scrollY = window.scrollY;
        const body = document.body;
        const html = document.documentElement;
        
        // 모달이 열릴 때 body 스크롤 방지
        body.classList.add('modal-open');
        body.style.top = `-${scrollY}px`;
        html.style.scrollBehavior = 'auto';
        
        // 터치 이벤트 리스너 추가 (passive: false로 preventDefault 가능하게)
        document.addEventListener('touchmove', preventTouch, { passive: false });
        window.addEventListener('keydown', handleEsc);
        
        return () => {
            // 모달이 닫힐 때 body 스크롤 복원
            body.classList.remove('modal-open');
            body.style.top = '';
            html.style.scrollBehavior = '';
            window.scrollTo(0, scrollY);
            
            document.removeEventListener('touchmove', preventTouch);
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    // ROI 계산 (profit이 변경될 때)
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

    // Profit 계산 (ROI가 변경될 때)
    useEffect(() => {
        if (activeCalculation !== 'profit') return;
        const investment = getInvestment();
        
        const calculatedProfit = (roi / 100) * investment;
        const rounded = Math.round(calculatedProfit);
        setProfitDisplay(formatNumber(rounded));
    }, [roi, investmentDisplay, activeCalculation]);
    
    // Validation functions
    const validateCurrentStep = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        switch (currentStep) {
            case 'asset':
                // Asset type is always selected by default
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
                // Profit can be negative, so just check if it's a valid number
                break;
            case 'review':
                // All validation should be complete by now
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Navigation functions
    const goToNextStep = () => {
        if (!validateCurrentStep()) return;
        
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setCurrentStep(steps[nextIndex].key);
        }
    };
    
    const goToPreviousStep = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(steps[prevIndex].key);
        }
    };
    
    const canProceed = (): boolean => {
        switch (currentStep) {
            case 'asset': return true; // Always can proceed from asset selection
            case 'basic': return !!date && symbol.trim().length > 0;
            case 'trading': return !!quantity && parseFloat(quantity) > 0 && getPrice() > 0 && getInvestment() > 0;
            case 'profit': return true; // Can proceed even with 0 profit
            case 'review': return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
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
            assetType: assetType,
            symbol,
            tradeType: tradeType,
            position: position,
            currency: currency,
            quantity,
            buyPrice: getPrice(),
            leverage: tradeType == TradeType.FUTURES ? leverage : undefined,
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
        } catch (error) {
            console.error('❌ 등록 실패:', error);
            setErrors({ submit: '저장 중 오류가 발생했습니다. 다시 시도해주세요.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Progress bar component
    const ProgressBar = () => (
        <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
                {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const StepIcon = step.icon;

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

    // Reusable emotion picker section
    const EmotionPicker = () => (
        <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                지금 감정 상태 (선택)
            </label>
            <div className="flex flex-wrap gap-2">
                {Object.values(EmotionType).map((type) => {
                    const isSelected = emotion === type;
                    const colors = EmotionTypeColor[type];
                    return (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setEmotion(isSelected ? null : type)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                isSelected
                                    ? `${colors.bg} ${colors.text} ${colors.border}`
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            {EmotionTypeLabel[type]}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const RulesChecklist = () => {
        if (tradingRules.length === 0) {
            return (
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                        매매 원칙 체크 (선택)
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-sm text-slate-400 dark:text-slate-500 mb-1">설정된 매매 원칙이 없습니다</p>
                        <Link
                            href="/settings"
                            className="text-xs text-emerald-500 hover:text-emerald-400 underline"
                            onClick={onClose}
                        >
                            설정에서 원칙 추가하기
                        </Link>
                    </div>
                </div>
            );
        }

        const toggleRule = (id: number) => {
            setCheckedRuleIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            });
        };

        return (
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    매매 원칙 체크 (선택)
                    {checkedRuleIds.size > 0 && (
                        <span className="ml-2 text-emerald-500">
                            {checkedRuleIds.size}/{tradingRules.length}
                        </span>
                    )}
                </label>
                <div className="space-y-1.5">
                    {tradingRules.map(rule => (
                        <button
                            key={rule.id}
                            type="button"
                            onClick={() => toggleRule(rule.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors border ${
                                checkedRuleIds.has(rule.id)
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                checkedRuleIds.has(rule.id)
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : 'border-slate-300 dark:border-slate-600'
                            }`}>
                                {checkedRuleIds.has(rule.id) && (
                                    <Check className="w-3 h-3 text-white" />
                                )}
                            </div>
                            {rule.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const modalContent = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
                style={{ zIndex: 999999 }}
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
                <motion.div
                    initial={{ scale: 0.97, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.97, opacity: 0, y: 10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-2xl h-[95vh] sm:max-h-[90vh] sm:h-auto flex flex-col border border-slate-200 dark:border-slate-800 mx-2 sm:mx-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                {editTarget ? '매매일지 수정' : '새 거래 등록'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {!editTarget && (
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => setIsQuickMode(false)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                !isQuickMode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                              }`}
                            >
                              상세 입력
                            </button>
                            <button
                              onClick={() => setIsQuickMode(true)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                isQuickMode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                              }`}
                            >
                              퀵 엔트리
                            </button>
                          </div>
                        )}
                        {!isQuickMode && (
                          <div>
                            <h3 className="font-medium text-sm text-emerald-500">{steps[currentStepIndex].title}</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{steps[currentStepIndex].description}</p>
                          </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 modal-content-scrollable">
                      {/* Risk Warning Banner */}
                      {!editTarget && recentJournals.length > 0 && (
                        <div className="mb-4">
                          <RiskWarningBanner journals={recentJournals} />
                        </div>
                      )}

                      {isQuickMode ? (
                        <div className="space-y-4">
                          {/* Asset Type Toggle */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => setAssetType(AssetType.CRYPTO)}
                              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                assetType === AssetType.CRYPTO ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                              }`}
                            >
                              암호화폐
                            </button>
                            <button
                              onClick={() => setAssetType(AssetType.STOCK)}
                              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                assetType === AssetType.STOCK ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                              }`}
                            >
                              주식
                            </button>
                          </div>

                          {/* Date + Symbol row */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">거래일</label>
                              <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">종목</label>
                              <input
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                placeholder={assetType === AssetType.CRYPTO ? 'BTC' : '삼성전자'}
                                className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                              />
                            </div>
                          </div>

                          {/* Trade Type + Currency */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">시장</label>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => { setTradeType(TradeType.SPOT); setPosition(null); }}
                                  className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                                    tradeType === TradeType.SPOT ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' : 'bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                                  }`}
                                >
                                  현물
                                </button>
                                <button
                                  onClick={() => setTradeType(TradeType.FUTURES)}
                                  className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                                    tradeType === TradeType.FUTURES ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' : 'bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                                  }`}
                                >
                                  선물
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">화폐</label>
                              <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as any)}
                                className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                              >
                                <option value="KRW">KRW</option>
                                <option value="USD">USD</option>
                                <option value="USDT">USDT</option>
                                <option value="USDC">USDC</option>
                              </select>
                            </div>
                          </div>

                          {/* Position + Leverage (only for futures) */}
                          {tradeType === TradeType.FUTURES && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">포지션</label>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => setPosition(PositionType.LONG)}
                                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                                      position === PositionType.LONG ? 'bg-emerald-600 text-white' : 'bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                                    }`}
                                  >
                                    LONG
                                  </button>
                                  <button
                                    onClick={() => setPosition(PositionType.SHORT)}
                                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                                      position === PositionType.SHORT ? 'bg-red-600 text-white' : 'bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                                    }`}
                                  >
                                    SHORT
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">레버리지</label>
                                <input
                                  type="number"
                                  value={leverage}
                                  onChange={(e) => setLeverage(e.target.value)}
                                  placeholder="10"
                                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                                />
                              </div>
                            </div>
                          )}

                          {/* Quantity + Price */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">수량</label>
                              <input
                                type="number"
                                step="any"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="0.5"
                                className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">단가</label>
                              <input
                                type="text"
                                value={priceDisplay}
                                onChange={(e) => setPriceDisplay(formatNumber(e.target.value))}
                                placeholder="50,000"
                                className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white text-right placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors tabular-nums"
                              />
                            </div>
                          </div>

                          {/* Investment */}
                          <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">투자금 ({currency})</label>
                            <input
                              type="text"
                              value={investmentDisplay}
                              onChange={(e) => setInvestmentDisplay(formatNumber(e.target.value))}
                              placeholder="1,000,000"
                              className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white text-right placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors tabular-nums"
                            />
                          </div>

                          {/* Profit + ROI */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">손익 ({currency})</label>
                              <input
                                type="text"
                                value={profitDisplay}
                                onChange={(e) => {
                                  setActiveCalculation('roi');
                                  setProfitDisplay(formatNumber(e.target.value));
                                }}
                                placeholder="+100,000"
                                className={`w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-lg text-sm text-right font-medium tabular-nums focus:outline-none transition-colors ${
                                  getProfit() > 0 ? 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400' : getProfit() < 0 ? 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400' : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">ROI %</label>
                              <input
                                type="number"
                                step="0.01"
                                value={roi}
                                onChange={(e) => {
                                  setActiveCalculation('profit');
                                  setRoi(Number(e.target.value));
                                }}
                                placeholder="3.2"
                                className={`w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-lg text-sm text-right font-medium tabular-nums focus:outline-none transition-colors ${
                                  roi > 0 ? 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400' : roi < 0 ? 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400' : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Memo */}
                          <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">메모 (선택)</label>
                            <textarea
                              value={memo}
                              onChange={(e) => setMemo(e.target.value)}
                              rows={2}
                              placeholder="간단한 메모..."
                              className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                            />
                          </div>

                          {/* Emotion Picker */}
                          <EmotionPicker />
                          <RulesChecklist />

                          {/* Submit Error */}
                          {errors.submit && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {errors.submit}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                        <ProgressBar />
                        
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
                                        <div className="text-6xl mb-4">🎯</div>
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
                                                    setPriceDisplay(formatNumber(e.target.value));
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
                                                    setInvestmentDisplay(formatNumber(e.target.value));
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
                                                        className="w-full px-4 py-3 border border-slate-700 rounded-xl text-sm bg-slate-800 text-white focus:border-emerald-500 transition-colors"
                                                    />
                                                    <div className="mt-2 p-3 bg-yellow-900/20 rounded-lg">
                                                        <p className="text-sm text-yellow-400 flex items-center gap-2">
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
                                                    setProfitDisplay(formatNumber(e.target.value));
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
                                        <EmotionPicker />
                                        <RulesChecklist />
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
                      )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="p-4 sm:p-6 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                      {isQuickMode ? (
                        <div className="flex justify-end items-center gap-2 sm:gap-3">
                          <button onClick={onClose} className="px-3 sm:px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors text-sm">
                            취소
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !symbol.trim() || !date}
                            className={`btn-trendy-primary flex items-center gap-2 text-sm px-4 sm:px-6 py-2 sm:py-3 ${
                              (isSubmitting || !symbol.trim() || !date) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                저장 중...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                {editTarget ? '수정 완료' : '저장'}
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                            <button
                                onClick={goToPreviousStep}
                                disabled={isFirstStep}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all text-sm sm:text-base ${
                                    isFirstStep
                                        ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                        : 'text-slate-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">이전</span>
                            </button>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-3 sm:px-4 py-2 text-slate-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors text-sm sm:text-base"
                                >
                                    취소
                                </button>

                                {isLastStep ? (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className={`btn-trendy-primary flex items-center gap-2 text-sm sm:text-base px-3 sm:px-6 py-2 sm:py-3 ${
                                            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span className="hidden sm:inline">저장 중...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span className="hidden sm:inline">{editTarget ? '수정 완료' : '등록 완료'}</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={goToNextStep}
                                        disabled={!canProceed()}
                                        className={`btn-trendy-primary flex items-center gap-2 text-sm sm:text-base px-3 sm:px-6 py-2 sm:py-3 ${
                                            !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <span className="hidden sm:inline">다음</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                      )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    if (typeof window === 'undefined') return null;
    return createPortal(modalContent, document.body);
}