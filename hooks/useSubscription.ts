import { useMemo } from 'react';

export type PlanTier = 'free' | 'basic';

interface SubscriptionInfo {
  tier: PlanTier;
  tradeLimit: number;        // monthly trade limit (0 = unlimited)
  tradesUsed: number;        // trades used this month
  tradesRemaining: number;
  usagePercent: number;      // 0-100
  dataRetentionDays: number; // 0 = unlimited
  isTrialActive: boolean;
  trialDaysLeft: number;
}

// TODO: Replace with real API call when backend subscription system is ready
export function useSubscription(monthlyTradeCount: number): SubscriptionInfo {
  return useMemo(() => {
    const tier: PlanTier = 'free';
    const tradeLimit = 30;
    const tradesUsed = Math.min(monthlyTradeCount, tradeLimit);
    const tradesRemaining = Math.max(tradeLimit - tradesUsed, 0);
    const usagePercent = tradeLimit > 0 ? Math.round((tradesUsed / tradeLimit) * 100) : 0;

    return {
      tier,
      tradeLimit,
      tradesUsed,
      tradesRemaining,
      usagePercent,
      dataRetentionDays: 30,
      isTrialActive: false,
      trialDaysLeft: 0,
    };
  }, [monthlyTradeCount]);
}
