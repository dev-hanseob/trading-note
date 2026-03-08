import client from './client';
import type { SubscriptionResponse, PaymentHistoryResponse, BillingCycle } from '@/type/domain/subscription';

export async function getSubscription(): Promise<SubscriptionResponse> {
  const res = await client.get('/subscription');
  return res.data;
}

export async function confirmBilling(
  authKey: string,
  billingCycle: BillingCycle
): Promise<{ message: string; tier: string; status: string; currentPeriodEnd: string | null }> {
  const res = await client.post('/subscription/billing', { authKey, billingCycle });
  return res.data;
}

export async function cancelSubscription(reason?: string): Promise<void> {
  await client.post('/subscription/cancel', { reason });
}

export async function reactivateSubscription(): Promise<void> {
  await client.post('/subscription/reactivate');
}

export async function getPaymentHistory(
  page: number = 1,
  pageSize: number = 10
): Promise<PaymentHistoryResponse> {
  const res = await client.get('/subscription/payments', { params: { page, pageSize } });
  return res.data;
}

export async function getClientKey(): Promise<string> {
  const res = await client.get('/subscription/client-key');
  return res.data.clientKey;
}
