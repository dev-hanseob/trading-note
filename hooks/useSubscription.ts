import { useEffect, useState, useCallback } from 'react';
import { getSubscription } from '@/lib/api/subscription';
import type { SubscriptionResponse, PlanTier } from '@/type/domain/subscription';
import { differenceInDays, parseISO } from 'date-fns';

export type { PlanTier };

export interface SubscriptionInfo {
  tier: PlanTier;
  effectiveTier: PlanTier;
  status: string;
  tradeLimit: number | null;
  tradesUsed: number;
  tradesRemaining: number;
  usagePercent: number;
  dataRetentionDays: number;
  isTrialActive: boolean;
  trialDaysLeft: number;
  billingCycle: string | null;
  amount: number | null;
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
  isLoading: boolean;
  mutate: () => void;
}

const FREE_TRADE_LIMIT = 30;
const FREE_RETENTION_DAYS = 30;

export function useSubscription(): SubscriptionInfo {
  const [data, setData] = useState<SubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getSubscription();
      setData(res);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  if (!data) {
    return {
      tier: 'FREE',
      effectiveTier: 'FREE',
      status: 'EXPIRED',
      tradeLimit: FREE_TRADE_LIMIT,
      tradesUsed: 0,
      tradesRemaining: FREE_TRADE_LIMIT,
      usagePercent: 0,
      dataRetentionDays: FREE_RETENTION_DAYS,
      isTrialActive: false,
      trialDaysLeft: 0,
      billingCycle: null,
      amount: null,
      currentPeriodEnd: null,
      cancelledAt: null,
      isLoading,
      mutate: fetchSubscription,
    };
  }

  const effectiveTier = data.effectiveTier;
  const tradeLimit = data.tradeLimit;
  const tradesUsed = data.tradesUsed;
  const tradesRemaining = tradeLimit != null ? Math.max(tradeLimit - tradesUsed, 0) : Infinity;
  const usagePercent = tradeLimit != null && tradeLimit > 0
    ? Math.round((tradesUsed / tradeLimit) * 100)
    : 0;
  const dataRetentionDays = effectiveTier === 'FREE' ? FREE_RETENTION_DAYS : 0;

  const isTrialActive = data.status === 'TRIALING';
  let trialDaysLeft = 0;
  if (isTrialActive && data.trialEndDate) {
    trialDaysLeft = Math.max(0, differenceInDays(parseISO(data.trialEndDate), new Date()));
  }

  return {
    tier: data.tier,
    effectiveTier,
    status: data.status,
    tradeLimit,
    tradesUsed,
    tradesRemaining,
    usagePercent,
    dataRetentionDays,
    isTrialActive,
    trialDaysLeft,
    billingCycle: data.billingCycle,
    amount: data.amount,
    currentPeriodEnd: data.currentPeriodEnd,
    cancelledAt: data.cancelledAt,
    isLoading,
    mutate: fetchSubscription,
  };
}
