export type PlanTier = 'FREE' | 'BASIC';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type PaymentStatus = 'PENDING' | 'DONE' | 'FAILED' | 'CANCELLED';

export interface SubscriptionResponse {
  tier: PlanTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle | null;
  amount: number | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndDate: string | null;
  cancelledAt: string | null;
  tradesUsed: number;
  tradeLimit: number | null;
  effectiveTier: PlanTier;
}

export interface PaymentHistoryItem {
  orderId: string;
  amount: number;
  status: PaymentStatus;
  billingCycle: BillingCycle;
  paidAt: string | null;
  failReason: string | null;
  createdAt: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}
