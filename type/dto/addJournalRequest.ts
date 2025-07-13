import {AssetType, PositionType, TradeType} from "@/type/domain/journal.enum";
import {Journal} from "@/type/domain/journal";

export interface addJournalRequest {
    assetType: AssetType;
    symbol: string;
    tradeType: TradeType
    position?: PositionType | null
    currency: string;
    quantity: string;
    buyPrice: number;
    leverage?: string;
    investment: number;
    profit: number;
    roi: number;
    memo: string;
    tradedAt: string;
}

export interface updateJournalRequest {
    assetType: AssetType | null;
    symbol: string | null
    tradeType: TradeType | null
    position?: PositionType | null
    currency: string | null;
    quantity: string | null;
    buyPrice: number | null;
    leverage?: string | null;
    investment: number | null;
    profit: number | null;
    roi: number | null;
    memo: string | null;
    tradedAt: string | null;
}

export interface GetJournalsParams {
    page: number;
    pageSize: number;
}

export interface GetJournalsResponse {
    total: number;
    page: number;
    pageSize: number;
    journals: Journal[];
}