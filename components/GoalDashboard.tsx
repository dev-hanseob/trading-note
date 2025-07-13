'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar, Settings, Plus } from 'lucide-react';
import { useGoals, Goal } from '@/hooks/useGoals';
import GoalSettingModal from '@/components/GoalSettingModal';

interface GoalDashboardProps {
  currentProfit: number;
  totalSeed: number;
  currentRoi: number;
}

export default function GoalDashboard({ currentProfit, totalSeed, currentRoi }: GoalDashboardProps) {
  const { goals } = useGoals();
  const [showSettings, setShowSettings] = useState(false);

  // 현재 활성 목표들
  const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
  const currentYear = String(new Date().getFullYear());
  
  const monthlyGoal = goals.find(g => g.type === 'monthly' && g.period === currentMonth && g.isActive);
  const yearlyGoal = goals.find(g => g.type === 'yearly' && g.period === currentYear && g.isActive);

  const calculateProgress = (goal: Goal | undefined) => {
    if (!goal) return { amountProgress: 0, percentProgress: 0, remainingAmount: 0, remainingPercent: 0 };
    
    const amountProgress = Math.min((currentProfit / goal.targetAmount) * 100, 100);
    const percentProgress = Math.min((currentRoi / goal.targetPercent) * 100, 100);
    const remainingAmount = Math.max(goal.targetAmount - currentProfit, 0);
    const remainingPercent = Math.max(goal.targetPercent - currentRoi, 0);
    
    return { amountProgress, percentProgress, remainingAmount, remainingPercent };
  };

  const monthlyProgress = calculateProgress(monthlyGoal);
  const yearlyProgress = calculateProgress(yearlyGoal);

  const ProgressCard = ({ 
    title, 
    icon, 
    goal, 
    progress, 
    period 
  }: { 
    title: string;
    icon: React.ReactNode;
    goal: Goal | undefined;
    progress: ReturnType<typeof calculateProgress>;
    period: string;
  }) => {
    if (!goal) return null;

    const isAchieved = progress.amountProgress >= 100 || progress.percentProgress >= 100;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{period}</span>
        </div>

        {/* 목표 정보 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">목표 금액</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {goal.targetAmount.toLocaleString()}원
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">목표 수익률</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {goal.targetPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* 진행률 바 - 금액 기준 */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-300">금액 달성률</span>
            <span className={`font-medium ${isAchieved ? 'text-green-600' : 'text-blue-600'}`}>
              {progress.amountProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress.amountProgress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-2 rounded-full ${
                isAchieved 
                  ? 'bg-green-500' 
                  : progress.amountProgress >= 80 
                    ? 'bg-blue-500' 
                    : 'bg-blue-400'
              }`}
            />
          </div>
        </div>

        {/* 진행률 바 - 수익률 기준 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-300">수익률 달성률</span>
            <span className={`font-medium ${isAchieved ? 'text-green-600' : 'text-purple-600'}`}>
              {progress.percentProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress.percentProgress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className={`h-2 rounded-full ${
                isAchieved 
                  ? 'bg-green-500' 
                  : progress.percentProgress >= 80 
                    ? 'bg-purple-500' 
                    : 'bg-purple-400'
              }`}
            />
          </div>
        </div>

        {/* 남은 목표 */}
        <div className="grid grid-cols-2 gap-4 text-center bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">목표까지</div>
            <div className={`font-medium ${progress.remainingAmount <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {progress.remainingAmount <= 0 
                ? '달성! 🎉' 
                : `${progress.remainingAmount.toLocaleString()}원`
              }
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">수익률까지</div>
            <div className={`font-medium ${progress.remainingPercent <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {progress.remainingPercent <= 0 
                ? '달성! 🎉' 
                : `${progress.remainingPercent.toFixed(1)}%`
              }
            </div>
          </div>
        </div>

        {/* 달성 상태 */}
        {isAchieved && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
            className="mt-3 text-center"
          >
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
              🏆 목표 달성!
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProgressCard
          title="이번 달 목표"
          icon={<Calendar size={16} className="text-blue-500" />}
          goal={monthlyGoal}
          progress={monthlyProgress}
          period={currentMonth}
        />
        
        <ProgressCard
          title="올해 목표"
          icon={<TrendingUp size={16} className="text-purple-500" />}
          goal={yearlyGoal}
          progress={yearlyProgress}
          period={currentYear}
        />
      </div>

      {!monthlyGoal && !yearlyGoal && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            목표를 설정해보세요
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            월간, 연간 목표를 설정하고 진행률을 추적해보세요
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} />
            목표 설정하기
          </button>
        </div>
      )}

      {/* 목표 설정 모달 */}
      <GoalSettingModal 
        isOpen={showSettings}
        handleClose={() => setShowSettings(false)}
      />
    </section>
  );
}
