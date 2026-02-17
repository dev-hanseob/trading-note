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
