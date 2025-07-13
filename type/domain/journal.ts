import {AssetType, PositionType, TradeType} from "@/type/domain/journal.enum";

export interface Journal {
    id: number;
    assetType: AssetType;
    tradedAt: string;
    symbol: string;
    tradeType: TradeType
    position?: PositionType
    currency: string;
    quantity: string;
    buyPrice: number;
    leverage?: number;
    investment: number;
    profit: number;
    roi: number;
    memo: string;
}