'use client';

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen, title, message, confirmLabel = '확인', cancelLabel = '취소',
  variant = 'danger', onConfirm, onCancel, isLoading = false
}: Props) {
  if (typeof window === 'undefined') return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          style={{ zIndex: 999999 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  variant === 'danger' ? 'text-red-400' : 'text-amber-400'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-900 dark:text-white font-semibold mb-1">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    처리 중...
                  </span>
                ) : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}