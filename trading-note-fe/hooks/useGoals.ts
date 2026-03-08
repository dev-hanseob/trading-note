'use client';

import { useState, useEffect } from 'react';

export interface Goal {
  id: string;
  type: 'monthly' | 'yearly';
  targetAmount: number;
  targetPercent: number;
  period: string; // '2025-01' or '2025'
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_GOALS: Goal[] = [
  {
    id: 'monthly-current',
    type: 'monthly',
    targetAmount: 1000000, // 100만원
    targetPercent: 10, // 10%
    period: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'yearly-current',
    type: 'yearly',
    targetAmount: 15000000, // 1500만원
    targetPercent: 150, // 150%
    period: String(new Date().getFullYear()),
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [isLoading, setIsLoading] = useState(false);

  // 로컬 스토리지에서 목표 불러오기
  useEffect(() => {
    const savedGoals = localStorage.getItem('trading-goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (error) {

        setGoals(DEFAULT_GOALS);
      }
    }
  }, []);

  // 목표 저장
  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem('trading-goals', JSON.stringify(newGoals));
  };

  // 목표 업데이트
  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    );
    saveGoals(updatedGoals);
  };

  // 새 목표 추가
  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    saveGoals([...goals, newGoal]);
  };

  // 목표 삭제
  const deleteGoal = (goalId: string) => {
    const filteredGoals = goals.filter(goal => goal.id !== goalId);
    saveGoals(filteredGoals);
  };

  return {
    goals,
    isLoading,
    updateGoal,
    addGoal,
    deleteGoal
  };
}
