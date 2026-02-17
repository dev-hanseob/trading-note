'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Plus, Trash2, Pencil, ChevronUp, ChevronDown,
    Settings, Check, X, Sparkles, GripVertical, ListChecks
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import {
    getTradingRules,
    createTradingRule,
    updateTradingRule,
    deleteTradingRule,
    seedDefaultRules,
} from '@/lib/api/tradingRule';
import { TradingRule } from '@/type/domain/tradingRule';

export default function SettingsPage() {
    const { showToast } = useToast();

    const [rules, setRules] = useState<TradingRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editLabel, setEditLabel] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<TradingRule | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);

    const fetchRules = useCallback(async () => {
        try {
            const data = await getTradingRules();
            setRules(data.sort((a, b) => a.displayOrder - b.displayOrder));
        } catch (error) {
            console.error('Failed to fetch trading rules:', error);
            showToast('원칙 목록을 불러오지 못했습니다', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    // -- Add rule --
    const handleAdd = async () => {
        const trimmed = newLabel.trim();
        if (!trimmed) return;
        setIsSaving(true);
        try {
            await createTradingRule({
                label: trimmed,
                displayOrder: rules.length + 1,
                isActive: true,
            });
            setNewLabel('');
            setIsAdding(false);
            showToast('매매 원칙이 추가되었습니다', 'success');
            await fetchRules();
        } catch (error) {
            console.error('Failed to create trading rule:', error);
            showToast('원칙 추가에 실패했습니다', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // -- Edit rule --
    const startEditing = (rule: TradingRule) => {
        setEditingId(rule.id);
        setEditLabel(rule.label);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditLabel('');
    };

    const handleEdit = async (rule: TradingRule) => {
        const trimmed = editLabel.trim();
        if (!trimmed || trimmed === rule.label) {
            cancelEditing();
            return;
        }
        setIsSaving(true);
        try {
            await updateTradingRule(rule.id, {
                label: trimmed,
                displayOrder: rule.displayOrder,
                isActive: rule.isActive,
            });
            cancelEditing();
            showToast('매매 원칙이 수정되었습니다', 'success');
            await fetchRules();
        } catch (error) {
            console.error('Failed to update trading rule:', error);
            showToast('원칙 수정에 실패했습니다', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // -- Delete rule --
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsSaving(true);
        try {
            await deleteTradingRule(deleteTarget.id);
            setDeleteTarget(null);
            showToast('매매 원칙이 삭제되었습니다', 'success');
            await fetchRules();
        } catch (error) {
            console.error('Failed to delete trading rule:', error);
            showToast('원칙 삭제에 실패했습니다', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // -- Toggle active/inactive --
    const handleToggle = async (rule: TradingRule) => {
        try {
            await updateTradingRule(rule.id, {
                label: rule.label,
                displayOrder: rule.displayOrder,
                isActive: !rule.isActive,
            });
            await fetchRules();
        } catch (error) {
            console.error('Failed to toggle trading rule:', error);
            showToast('상태 변경에 실패했습니다', 'error');
        }
    };

    // -- Reorder --
    const handleReorder = async (index: number, direction: 'up' | 'down') => {
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= rules.length) return;

        const current = rules[index];
        const target = rules[swapIndex];

        try {
            await Promise.all([
                updateTradingRule(current.id, {
                    label: current.label,
                    displayOrder: target.displayOrder,
                    isActive: current.isActive,
                }),
                updateTradingRule(target.id, {
                    label: target.label,
                    displayOrder: current.displayOrder,
                    isActive: target.isActive,
                }),
            ]);
            await fetchRules();
        } catch (error) {
            console.error('Failed to reorder trading rules:', error);
            showToast('순서 변경에 실패했습니다', 'error');
        }
    };

    // -- Seed defaults --
    const handleSeedDefaults = async () => {
        setIsSeeding(true);
        try {
            await seedDefaultRules();
            showToast('기본 매매 원칙이 추가되었습니다', 'success');
            await fetchRules();
        } catch (error) {
            console.error('Failed to seed default rules:', error);
            showToast('기본 원칙 추가에 실패했습니다', 'error');
        } finally {
            setIsSeeding(false);
        }
    };

    // -- Loading skeleton --
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-48" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-72" />
                        <div className="mt-8 h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <p className="text-xs font-medium text-emerald-500 uppercase tracking-widest mb-1">
                        설정
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        설정
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        매매 원칙과 앱 설정을 관리합니다.
                    </p>
                </div>

                {/* Trading Rules Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {/* Section Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                <ListChecks className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                    매매 원칙
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    거래 시 체크할 원칙을 관리합니다
                                </p>
                            </div>
                        </div>
                        {rules.length > 0 && (
                            <button
                                onClick={() => {
                                    setIsAdding(true);
                                    setNewLabel('');
                                }}
                                disabled={isAdding}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                                원칙 추가
                            </button>
                        )}
                    </div>

                    {/* Rules List */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {rules.length === 0 && !isAdding ? (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center py-16 px-6">
                                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Settings className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                                </div>
                                <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                                    등록된 매매 원칙이 없습니다
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">
                                    매매 원칙을 추가하거나 기본 원칙으로 시작해보세요.
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSeedDefaults}
                                        disabled={isSeeding}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSeeding ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                추가 중...
                                            </span>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                기본 원칙 추가
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAdding(true);
                                            setNewLabel('');
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg text-sm border border-slate-300 dark:border-slate-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        직접 추가
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {rules.map((rule, index) => (
                                    <div
                                        key={rule.id}
                                        className="flex items-center gap-3 px-6 py-3.5 group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        {/* Grip / Order Indicator */}
                                        <div className="flex-shrink-0 text-slate-300 dark:text-slate-600">
                                            <GripVertical className="w-4 h-4" />
                                        </div>

                                        {/* Label or Edit Input */}
                                        <div className="flex-1 min-w-0">
                                            {editingId === rule.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editLabel}
                                                        onChange={(e) => setEditLabel(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleEdit(rule);
                                                            if (e.key === 'Escape') cancelEditing();
                                                        }}
                                                        autoFocus
                                                        className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                                    />
                                                    <button
                                                        onClick={() => handleEdit(rule)}
                                                        disabled={isSaving}
                                                        className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors disabled:opacity-50"
                                                        title="저장"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                                        title="취소"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span
                                                    className={`text-sm ${
                                                        rule.isActive
                                                            ? 'text-slate-900 dark:text-white'
                                                            : 'text-slate-400 dark:text-slate-500 line-through'
                                                    }`}
                                                >
                                                    {rule.label}
                                                </span>
                                            )}
                                        </div>

                                        {/* Active Toggle */}
                                        {editingId !== rule.id && (
                                            <button
                                                onClick={() => handleToggle(rule)}
                                                className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors ${
                                                    rule.isActive
                                                        ? 'bg-emerald-500'
                                                        : 'bg-slate-300 dark:bg-slate-600'
                                                }`}
                                                title={rule.isActive ? '비활성화' : '활성화'}
                                            >
                                                <span
                                                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                                        rule.isActive ? 'translate-x-4' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                        )}

                                        {/* Action Buttons */}
                                        {editingId !== rule.id && (
                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleReorder(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="위로 이동"
                                                >
                                                    <ChevronUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleReorder(index, 'down')}
                                                    disabled={index === rules.length - 1}
                                                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="아래로 이동"
                                                >
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => startEditing(rule)}
                                                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                                    title="수정"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(rule)}
                                                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Add New Rule Inline Input */}
                        {isAdding && (
                            <div className="flex items-center gap-3 px-6 py-3.5 bg-emerald-50/50 dark:bg-emerald-900/10">
                                <div className="flex-shrink-0 text-emerald-400 dark:text-emerald-500">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newLabel}
                                            onChange={(e) => setNewLabel(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAdd();
                                                if (e.key === 'Escape') {
                                                    setIsAdding(false);
                                                    setNewLabel('');
                                                }
                                            }}
                                            autoFocus
                                            placeholder="새 매매 원칙을 입력하세요..."
                                            className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        />
                                        <button
                                            onClick={handleAdd}
                                            disabled={isSaving || !newLabel.trim()}
                                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="저장"
                                        >
                                            {isSaving ? (
                                                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAdding(false);
                                                setNewLabel('');
                                            }}
                                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                            title="취소"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rule Count Footer */}
                    {rules.length > 0 && (
                        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                총 {rules.length}개의 원칙 | 활성 {rules.filter(r => r.isActive).length}개
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="원칙 삭제"
                message="이 매매 원칙을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                confirmLabel="삭제"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                isLoading={isSaving}
            />
        </div>
    );
}
