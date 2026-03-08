'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Journal } from '@/type/domain/journal';
import { useJournalForm } from '@/components/journal/useJournalForm';
import QuickEntryForm from '@/components/journal/QuickEntryForm';
import DetailEntryForm from '@/components/journal/DetailEntryForm';

interface Props {
    onClose: () => void;
    onSuccessAction: (data: Journal) => void;
    editTarget?: Journal;
    recentJournals?: Journal[];
}

export default function JournalRegisterModal({ onClose, onSuccessAction, editTarget, recentJournals = [] }: Props) {
    const form = useJournalForm({ editTarget, onSuccessAction, onClose });

    const {
        isQuickMode, setIsQuickMode,
        isSubmitting,
        steps, currentStepIndex,
        isFirstStep, isLastStep,
        goToNextStep, goToPreviousStep, canProceed,
        handleSubmit,
        symbol, date,
    } = form;

    // Modal lifecycle: ESC key, scroll lock, touch prevention
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const preventTouch = (e: TouchEvent) => {
            const target = e.target as Element;
            const modalContent = target.closest('.modal-content-scrollable');
            if (!modalContent) {
                e.preventDefault();
            }
        };

        const scrollY = window.scrollY;
        const body = document.body;
        const html = document.documentElement;

        body.classList.add('modal-open');
        body.style.top = `-${scrollY}px`;
        html.style.scrollBehavior = 'auto';

        document.addEventListener('touchmove', preventTouch, { passive: false });
        window.addEventListener('keydown', handleEsc);

        return () => {
            body.classList.remove('modal-open');
            body.style.top = '';
            html.style.scrollBehavior = '';
            window.scrollTo(0, scrollY);

            document.removeEventListener('touchmove', preventTouch);
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

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
                        {isQuickMode ? (
                            <QuickEntryForm
                                form={form}
                                editTarget={editTarget}
                                recentJournals={recentJournals}
                                onClose={onClose}
                            />
                        ) : (
                            <DetailEntryForm
                                form={form}
                                editTarget={editTarget}
                                recentJournals={recentJournals}
                                onClose={onClose}
                            />
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
