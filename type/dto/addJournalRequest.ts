import {AssetType, PositionType, TradeType} from "@/type/domain/journal.enum";
import {Journal} from "@/type/domain/journal";

export interface addJournalRequest {
    assetType: AssetType;
    symbol: string;
    tradeType: TradeType;
    position?: PositionType | null;
    currency: string;
    quantity: string;
    buyPrice: number;
    leverage?: string;
    investment: number;
    profit: number;
    roi: number;
    memo: string;
    tradedAt: string;
    // Extended fields supported by backend
    tradeStatus?: string;
    entryPrice?: number;
    stopLoss?: number;
    takeProfitPrice?: number;
    positionSize?: number;
    chartScreenshotUrl?: string;
    timeframes?: string;
    setupType?: string;
    keyLevels?: string;
    emotion?: string;
    narrative?: string;
    exitPrice?: number;
    checkedRuleIds?: string;
}

export interface GetJournalsParams {
    page: number;
    pageSize: number;
}

export interface GetJournalsResponse {
    total: number;
    page: number;
    pageSize: number;
    items: Journal[];
}
