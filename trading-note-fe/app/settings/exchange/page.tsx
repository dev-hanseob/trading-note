'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight, Plus, Key, RefreshCw, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import AddCredentialModal from '@/components/exchange/AddCredentialModal';
import SyncTradesModal from '@/components/exchange/SyncTradesModal';
import type { ExchangeCredential, ExchangeName } from '@/type/domain/exchange';
import {
    getCredentialsApi,
    deleteCredentialApi,
    validateCredentialApi,
} from '@/lib/api/exchange';

const EXCHANGE_DISPLAY: Record<ExchangeName, string> = {
    BITGET: 'Bitget',
    BINANCE: 'Binance',
    BYBIT: 'Bybit',
    UPBIT: 'Upbit',
};

const EXCHANGE_BADGE_COLORS: Record<ExchangeName, string> = {
    BITGET: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    BINANCE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    BYBIT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    UPBIT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function ExchangeSettingsPage() {
    const { showToast } = useToast();

    const [credentials, setCredentials] = useState<ExchangeCredential[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [syncTarget, setSyncTarget] = useState<ExchangeCredential | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ExchangeCredential | null>(null);
    const [validatingId, setValidatingId] = useState<number | null>(null);

    const loadCredentials = useCallback(async () => {
        try {
            const data = await getCredentialsApi();
            setCredentials(data);
        } catch {
            showToast('거래소 목록을 불러오는데 실패했습니다', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadCredentials();
    }, [loadCredentials]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            await deleteCredentialApi(deleteTarget.id);
            showToast('API 키가 삭제되었습니다', 'success');
            setDeleteTarget(null);
            await loadCredentials();
        } catch {
            showToast('API 키 삭제에 실패했습니다', 'error');
        }
    };

    const handleValidate = async (credential: ExchangeCredential) => {
        setValidatingId(credential.id);
        try {
            const result = await validateCredentialApi(credential.id);
            if (result.valid) {
                showToast(`${EXCHANGE_DISPLAY[credential.exchangeName]} 연결이 정상입니다`, 'success');
            } else {
                showToast(`${EXCHANGE_DISPLAY[credential.exchangeName]} 연결에 실패했습니다. API 키를 확인해주세요.`, 'error');
            }
        } catch {
            showToast('연결 테스트에 실패했습니다', 'error');
        } finally {
            setValidatingId(null);
        }
    };

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        loadCredentials();
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                            <ArrowLeftRight className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">거래소 API 연동</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                거래소 API 키를 등록하면 거래내역을 자동으로 가져올 수 있습니다
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        API 키 등록
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 animate-pulse"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                <div className="w-32 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                            <div className="space-y-2">
                                <div className="w-48 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                                <div className="w-36 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && credentials.length === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-16 px-6 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <ArrowLeftRight className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        등록된 거래소가 없습니다
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                        거래소 API 키를 등록하면 거래내역을 자동으로 가져올 수 있습니다.
                    </p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        API 키 등록하기
                    </button>
                </div>
            )}

            {/* Credential Cards */}
            {!isLoading && credentials.length > 0 && (
                <div className="space-y-4">
                    {credentials.map((credential) => (
                        <div
                            key={credential.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                        >
                            <div className="p-6">
                                {/* Top Row: Badge + Label */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                EXCHANGE_BADGE_COLORS[credential.exchangeName]
                                            }`}
                                        >
                                            {EXCHANGE_DISPLAY[credential.exchangeName]}
                                        </span>
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                                            {credential.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                                    <div className="flex items-center gap-2">
                                        <Key className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono truncate">
                                            {credential.apiKey}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        <span className="text-slate-400 dark:text-slate-500">등록일: </span>
                                        {formatDate(credential.createdAt)}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        <span className="text-slate-400 dark:text-slate-500">최근 동기화: </span>
                                        {credential.lastSyncedAt
                                            ? formatDate(credential.lastSyncedAt)
                                            : '동기화 기록 없음'}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => handleValidate(credential)}
                                        disabled={validatingId === credential.id}
                                        className="btn-secondary flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {validatingId === credential.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4" />
                                        )}
                                        연결 테스트
                                    </button>
                                    <button
                                        onClick={() => setSyncTarget(credential)}
                                        className="btn-secondary flex items-center gap-1.5"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        거래내역 동기화
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(credential)}
                                        className="btn-danger flex items-center gap-1.5 ml-auto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <AddCredentialModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

            <SyncTradesModal
                isOpen={syncTarget !== null}
                onClose={() => setSyncTarget(null)}
                credential={syncTarget}
            />

            <ConfirmDialog
                isOpen={deleteTarget !== null}
                title="API 키 삭제"
                message={`"${deleteTarget?.label}" API 키를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
                confirmLabel="삭제"
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
