'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, Loader2, X, Info } from 'lucide-react';
import { createCredentialApi } from '@/lib/api/exchange';
import type { ExchangeName, CreateCredentialRequest } from '@/type/domain/exchange';
import { useToast } from '@/components/Toast';

interface AddCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EXCHANGE_OPTIONS: { name: ExchangeName; label: string; accent: string; selectedBg: string; selectedBorder: string }[] = [
  {
    name: 'BITGET',
    label: 'Bitget',
    accent: 'text-cyan-400',
    selectedBg: 'bg-cyan-600/20 dark:bg-cyan-500/20',
    selectedBorder: 'border-cyan-500',
  },
  {
    name: 'BINANCE',
    label: 'Binance',
    accent: 'text-yellow-400',
    selectedBg: 'bg-yellow-600/20 dark:bg-yellow-500/20',
    selectedBorder: 'border-yellow-500',
  },
  {
    name: 'BYBIT',
    label: 'Bybit',
    accent: 'text-orange-400',
    selectedBg: 'bg-orange-600/20 dark:bg-orange-500/20',
    selectedBorder: 'border-orange-500',
  },
  {
    name: 'UPBIT',
    label: 'Upbit',
    accent: 'text-blue-400',
    selectedBg: 'bg-blue-600/20 dark:bg-blue-500/20',
    selectedBorder: 'border-blue-500',
  },
];

export default function AddCredentialModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCredentialModalProps) {
  const { showToast } = useToast();

  const [selectedExchange, setSelectedExchange] = useState<ExchangeName | null>(null);
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset all state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedExchange(null);
      setLabel('');
      setApiKey('');
      setSecretKey('');
      setPassphrase('');
      setShowSecret(false);
      setShowPassphrase(false);
      setIsSubmitting(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!selectedExchange) {
      setError('거래소를 선택해주세요.');
      return;
    }
    if (!label.trim()) {
      setError('별칭을 입력해주세요.');
      return;
    }
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요.');
      return;
    }
    if (!secretKey.trim()) {
      setError('Secret 키를 입력해주세요.');
      return;
    }
    if (selectedExchange === 'BITGET' && !passphrase.trim()) {
      setError('Passphrase를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const request: CreateCredentialRequest = {
        exchangeName: selectedExchange,
        apiKey: apiKey.trim(),
        secretKey: secretKey.trim(),
        label: label.trim(),
        ...(selectedExchange === 'BITGET' && passphrase.trim()
          ? { passphrase: passphrase.trim() }
          : {}),
      };

      await createCredentialApi(request);
      showToast('API 키가 등록되었습니다.', 'success');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'API 키 등록에 실패했습니다.';
      showToast(message, 'error');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedExchange, label, apiKey, secretKey, passphrase, showToast, onSuccess, onClose]);

  // ESC key and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isSubmitting) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const inputClassName =
    'w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500';
  const labelClassName = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 999999 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Key size={20} />
            API 키 등록
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Step 1: Exchange Selection */}
          <div>
            <label className={labelClassName}>거래소 선택</label>
            <div className="grid grid-cols-2 gap-2">
              {EXCHANGE_OPTIONS.map((exchange) => {
                const isSelected = selectedExchange === exchange.name;
                return (
                  <button
                    key={exchange.name}
                    type="button"
                    onClick={() => {
                      setSelectedExchange(exchange.name);
                      setError('');
                    }}
                    disabled={isSubmitting}
                    className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? `${exchange.selectedBg} ${exchange.selectedBorder} ${exchange.accent}`
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {exchange.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: API Key Form (shown after exchange selected) */}
          {selectedExchange && (
            <>
              {/* Label */}
              <div>
                <label className={labelClassName}>별칭</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    setError('');
                  }}
                  disabled={isSubmitting}
                  className={inputClassName}
                  placeholder="메인 계정"
                />
              </div>

              {/* API Key */}
              <div>
                <label className={labelClassName}>API 키</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError('');
                  }}
                  disabled={isSubmitting}
                  className={inputClassName}
                  placeholder="API 키를 입력하세요"
                />
              </div>

              {/* Secret Key */}
              <div>
                <label className={labelClassName}>Secret 키</label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={secretKey}
                    onChange={(e) => {
                      setSecretKey(e.target.value);
                      setError('');
                    }}
                    disabled={isSubmitting}
                    className={`${inputClassName} pr-10`}
                    placeholder="Secret 키를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Passphrase (only for Bitget) */}
              {selectedExchange === 'BITGET' && (
                <div>
                  <label className={labelClassName}>Passphrase</label>
                  <div className="relative">
                    <input
                      type={showPassphrase ? 'text' : 'password'}
                      value={passphrase}
                      onChange={(e) => {
                        setPassphrase(e.target.value);
                        setError('');
                      }}
                      disabled={isSubmitting}
                      className={`${inputClassName} pr-10`}
                      placeholder="Passphrase를 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassphrase(!showPassphrase)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      tabIndex={-1}
                    >
                      {showPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 flex gap-2">
                <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p>API 키는 AES-256 암호화되어 안전하게 저장됩니다.</p>
                  <p>거래 조회 권한만 부여하세요. 출금 권한은 절대 부여하지 마세요.</p>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedExchange}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  등록 중...
                </>
              ) : (
                '등록'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
