export interface TradingRule {
  id: number;
  label: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TradingRuleRequest {
  label: string;
  displayOrder: number;
  isActive: boolean;
}

export interface TradingRuleStatsResponse {
  totalJournals: number;
  journalsWithRules: number;
  overallComplianceRate: number;
  monthlyComplianceRates: { month: string; rate: number; journalCount: number }[];
  ruleStats: {
    ruleId: number;
    label: string;
    checkCount: number;
    totalJournals: number;
    checkRate: number;
    isActive: boolean;
  }[];
}

export interface TradeStats {
  tradeCount: number;
  winCount: number;
  winRate: number;
  totalProfit: number;
  avgProfit: number;
  avgRoi: number;
}

export interface RulePerformanceResponse {
  ruleId: number;
  label: string;
  checkedStats: TradeStats;
  uncheckedStats: TradeStats;
}

export interface RulePerformance {
  ruleId: number;
  label: string;
  avgProfit: number;
  winRate: number;
  tradeCount: number;
}

export interface IgnoredRule {
  ruleId: number;
  label: string;
  ignoreRate: number;
  missedProfit: number;
}

export interface EmotionCompliance {
  emotion: string;
  avgComplianceRate: number;
  avgProfit: number;
}

export interface RuleAnalyticsResponse {
  topPerformingRules: RulePerformance[];
  mostIgnoredRules: IgnoredRule[];
  complianceByEmotion: EmotionCompliance[];
}
