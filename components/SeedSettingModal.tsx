'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Settings, Loader2 } from 'lucide-react';

interface SeedSettingModalProps {
  isOpen: boolean;
  handleClose: () => void;
  handleSave: (seed: number) => Promise<{ success: boolean; error?: string }>;
  currentSeed: number;
}

export default function SeedSettingModal({ 
  isOpen, 
  handleClose, 
  handleSave,
  currentSeed 
}: SeedSettingModalProps) {
  const [seedValue, setSeedValue] = useState(currentSeed.toString());
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatNumber = (value: string) => {
    // 숫자만 추출
    const numberOnly = value.replace(/[^\d]/g, '');
    // 천 단위 쉼표 추가
    return numberOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseNumber = (value: string) => {
    // 쉼표 제거하고 숫자로 변환
    return parseFloat(value.replace(/,/g, ''));
  };

  const handleSaveInternal = useCallback(async () => {
    const numValue = parseNumber(seedValue);
    
    if (isNaN(numValue) || numValue <= 0) {
      setError('유효한 시드 금액을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await handleSave(numValue);
      if (result.success) {
        handleClose();
      } else {
        setError(result.error || '시드 저장에 실패했습니다.');
      }
    } catch (err) {
      setError('시드 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [seedValue, handleSave, handleClose]);

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 body 스크롤 방지
      document.body.classList.add('modal-open');
      
      // 키보드 이벤트 핸들러
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) {
          handleClose();
        } else if (e.key === 'Enter' && !isLoading) {
          e.preventDefault();
          handleSaveInternal();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      
      // 모달이 열리면 input에 포커스를 주고 커서를 맨 끝으로 이동
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      }, 100);
      
      return () => {
        // 모달이 닫힐 때 body 스크롤 복원 및 이벤트 리스너 정리
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isLoading, handleClose, handleSaveInternal]);

  useEffect(() => {
    // 현재 시드에 천 단위 쉼표 적용
    setSeedValue(formatNumber(currentSeed.toString()));
  }, [currentSeed]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSeedValue(formatNumber(value));
    setError('');
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings size={20} />
            시작 시드 설정
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              시작 시드 금액(원)
            </label>
            <input
              ref={inputRef}
              type="text"
              value={seedValue}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white text-lg text-right disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="1,000,000"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              💡 시드 금액은 수익률 계산의 기준이 됩니다. 변경 시 모든 수익률이 새로운 시드를 기준으로 재계산됩니다.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              onClick={handleSaveInternal}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // React Portal을 사용하여 body에 직접 렌더링
  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
