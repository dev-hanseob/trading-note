'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Target, Calendar, TrendingUp, Save } from 'lucide-react';
import { useGoals, Goal } from '@/hooks/useGoals';

interface GoalSettingModalProps {
  isOpen: boolean;
  handleClose: () => void;
}

export default function GoalSettingModal({ isOpen, handleClose }: GoalSettingModalProps) {
  const { goals, updateGoal, addGoal } = useGoals();
  const [monthlyTarget, setMonthlyTarget] = useState({ amount: '', percent: '' });
  const [yearlyTarget, setYearlyTarget] = useState({ amount: '', percent: '' });

  // 현재 목표 불러오기
  useEffect(() => {
    if (isOpen) {
      const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
      const currentYear = String(new Date().getFullYear());
      
      const monthlyGoal = goals.find(g => g.type === 'monthly' && g.period === currentMonth && g.isActive);
      const yearlyGoal = goals.find(g => g.type === 'yearly' && g.period === currentYear && g.isActive);

      setMonthlyTarget({
        amount: monthlyGoal?.targetAmount.toString() || '1000000',
        percent: monthlyGoal?.targetPercent.toString() || '10'
      });

      setYearlyTarget({
        amount: yearlyGoal?.targetAmount.toString() || '15000000',
        percent: yearlyGoal?.targetPercent.toString() || '150'
      });
    }
  }, [isOpen, goals]);

  const handleSave = () => {
    const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
    const currentYear = String(new Date().getFullYear());

    // 월간 목표 저장
    if (monthlyTarget.amount && monthlyTarget.percent) {
      const existingMonthlyGoal = goals.find(g => g.type === 'monthly' && g.period === currentMonth && g.isActive);
      
      if (existingMonthlyGoal) {
        updateGoal(existingMonthlyGoal.id, {
          targetAmount: parseFloat(monthlyTarget.amount),
          targetPercent: parseFloat(monthlyTarget.percent)
        });
      } else {
        addGoal({
          type: 'monthly',
          targetAmount: parseFloat(monthlyTarget.amount),
          targetPercent: parseFloat(monthlyTarget.percent),
          period: currentMonth,
          isActive: true
        });
      }
    }

    // 연간 목표 저장
    if (yearlyTarget.amount && yearlyTarget.percent) {
      const existingYearlyGoal = goals.find(g => g.type === 'yearly' && g.period === currentYear && g.isActive);
      
      if (existingYearlyGoal) {
        updateGoal(existingYearlyGoal.id, {
          targetAmount: parseFloat(yearlyTarget.amount),
          targetPercent: parseFloat(yearlyTarget.percent)
        });
      } else {
        addGoal({
          type: 'yearly',
          targetAmount: parseFloat(yearlyTarget.amount),
          targetPercent: parseFloat(yearlyTarget.percent),
          period: currentYear,
          isActive: true
        });
      }
    }

    handleClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target size={20} />
            목표 설정
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* 월간 목표 */}
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-blue-500" />
              이번 달 목표 ({new Date().getMonth() + 1}월)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  목표 금액 (원)
                </label>
                <input
                  type="number"
                  value={monthlyTarget.amount}
                  onChange={(e) => setMonthlyTarget(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  목표 수익률 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={monthlyTarget.percent}
                  onChange={(e) => setMonthlyTarget(prev => ({ ...prev, percent: e.target.value }))}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          {/* 연간 목표 */}
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-purple-500" />
              올해 목표 ({new Date().getFullYear()}년)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  목표 금액 (원)
                </label>
                <input
                  type="number"
                  value={yearlyTarget.amount}
                  onChange={(e) => setYearlyTarget(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                  placeholder="15000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  목표 수익률 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={yearlyTarget.percent}
                  onChange={(e) => setYearlyTarget(prev => ({ ...prev, percent: e.target.value }))}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                  placeholder="150"
                />
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 현실적인 목표를 설정하세요. 너무 높은 목표는 스트레스가 될 수 있어요.
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} />
              저장
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
