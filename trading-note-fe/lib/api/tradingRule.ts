import apiClient from './client';
import {
    TradingRule,
    TradingRuleRequest,
    TradingRuleStatsResponse,
    RulePerformanceResponse,
    RuleAnalyticsResponse,
} from '@/type/domain/tradingRule';

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

export async function getTradingRuleStats(): Promise<TradingRuleStatsResponse> {
  const { data } = await apiClient.get<TradingRuleStatsResponse>('/trading-rules/stats');
  return data;
}

export async function getTradingRulePerformance(id: number): Promise<RulePerformanceResponse> {
  const { data } = await apiClient.get<RulePerformanceResponse>(`/trading-rules/${id}/performance`);
  return data;
}

export async function getJournalAnalyticsByRules(): Promise<RuleAnalyticsResponse> {
  const { data } = await apiClient.get<RuleAnalyticsResponse>('/journals/analytics/by-rules');
  return data;
}
