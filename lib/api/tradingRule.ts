import apiClient from './client';
import { TradingRule, TradingRuleRequest } from '@/type/domain/tradingRule';

export async function getTradingRules(): Promise<TradingRule[]> {
  const { data } = await apiClient.get<TradingRule[]>('/trading-rules');
  return data;
}

export async function createTradingRule(request: TradingRuleRequest): Promise<TradingRule> {
  const { data } = await apiClient.post<TradingRule>('/trading-rules', request);
  return data;
}

export async function updateTradingRule(id: number, request: TradingRuleRequest): Promise<TradingRule> {
  const { data } = await apiClient.put<TradingRule>(`/trading-rules/${id}`, request);
  return data;
}

export async function deleteTradingRule(id: number): Promise<void> {
  await apiClient.delete(`/trading-rules/${id}`);
}

export async function seedDefaultRules(): Promise<TradingRule[]> {
  const { data } = await apiClient.post<TradingRule[]>('/trading-rules/seed-defaults');
  return data;
}
