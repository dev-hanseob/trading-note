import {AssetType, PositionType, TradeType} from "@/type/domain/journal.enum";

export interface Journal {
    id: number;
    assetType: AssetType;
    tradedAt: string;
    symbol: string;
    tradeType: TradeType;
    position?: PositionType;
    currency: string;
    quantity: string;
    buyPrice: number;
    leverage?: number;
    investment: number;
    profit: number;
    roi: number;
    memo: string;
    // Extended fields from backend
    tradeStatus?: string;
    entryPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    takeProfitPrice?: number;
    positionSize?: number;
    chartScreenshotUrl?: string | null;
    timeframes?: string;
    setupType?: string;
    keyLevels?: string;
    emotion?: string;
    narrative?: string;
    exitPrice?: number;
    exitDate?: string;
    realizedPnl?: number;
    postTradeAnalysis?: string;
    executionResult?: string;
    checkedRuleIds?: string;
}
