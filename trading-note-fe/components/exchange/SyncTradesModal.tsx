'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { RefreshCw, X, Loader2, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { syncTradesApi } from '@/lib/api/exchange';
import { useToast } from '@/components/Toast';
import type { ExchangeCredential, SyncResult } from '@/type/domain/exchange';

interface SyncTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential: ExchangeCredential | null;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return formatDate(date);
}

function getDefaultEndDate(): string {
  return formatDate(new Date());
}

export default function SyncTradesModal({
  isOpen,
  onClose,
  credential,
}: SyncTradesModalProps) {
  const { showToast } = useToast();

  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartDate(getDefaultStartDate());
      setEndDate(getDefaultEndDate());
      setIsSyncing(false);
      setResult(null);
    }
  }, [isOpen]);

  // ESC key handler & body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isSyncing) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isSyncing, onClose]);

  const handleQuickSelect = useCallback((days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    setStartDate(formatDate(date));
  }, []);

  const handleSync = useCallback(async () => {
    if (!credential) return;

    setIsSyncing(true);
    try {
      const syncResult = await syncTradesApi({
        credentialId: credential.id,
        startDate,
        endDate,
      });
      setResult(syncResult);
      showToast('동기화가 완료되었습니다', 'success');
    } catch {
      showToast('동기화 중 오류가 발생했습니다', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [credential, startDate, endDate, showToast]);

  if (!isOpen || !credential) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 999999 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <RefreshCw size={20} />
            거래내역 동기화
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            disabled={isSyncing}
          >
            <X size={20} />
          </button>
        </div>

        {/* Result State */}
        {result ? (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                {result.failed === 0 ? (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={20} className="text-amber-500" />
                )}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.failed === 0 ? '동기화 완료' : '동기화 완료 (일부 실패)'}
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">가져온 거래</span>
                  <span className="tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                    {result.imported}건
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">건너뛴 거래</span>
                  <span className="tabular-nums font-medium text-slate-600 dark:text-slate-400">
                    {result.skipped}건
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">실패</span>
                  <span className="tabular-nums font-medium text-red-600 dark:text-red-400">
                    {result.failed}건
                  </span>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-3 max-h-32 overflow-y-auto bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
                    {result.errors.map((error, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button onClick={onClose} className="btn-primary w-full">
              확인
            </button>
          </div>
        ) : (
          /* Date Selection State */
          <div className="space-y-4">
            {/* Credential badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-700 dark:text-slate-300">
              <RefreshCw size={14} />
              {credential.exchangeName} - {credential.label}
            </div>

            {/* Date range inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    시작일
                  </span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isSyncing}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    종료일
                  </span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isSyncing}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Quick select buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect(7)}
                disabled={isSyncing}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                최근 7일
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(30)}
                disabled={isSyncing}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                최근 30일
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(90)}
                disabled={isSyncing}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                최근 90일
              </button>
            </div>

            {/* Info box */}
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                동기화는 거래소에서 체결된 거래내역을 가져옵니다. 이미 가져온 거래는 자동으로 건너뜁니다.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSyncing}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    거래내역을 가져오는 중...
                  </>
                ) : (
                  '동기화 시작'
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
