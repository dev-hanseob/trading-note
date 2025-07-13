export enum AssetType {
    CRYPTO = 'CRYPTO',
    STOCK = 'STOCK',
}

export enum TradeType {
    SPOT = 'SPOT',
    FUTURE = 'FUTURE',
}

export enum PositionType {
    LONG = 'LONG',
    SHORT = 'SHORT',
}

// 한글 라벨 매핑
export const AssetTypeLabel: Record<AssetType, string> = {
    [AssetType.CRYPTO]: '암호화폐',
    [AssetType.STOCK]: '주식',
};

export const TradeTypeLabel: Record<TradeType, string> = {
    [TradeType.SPOT]: '현물',
    [TradeType.FUTURE]: '선물',
};

export const PositionTypeLabel: Record<PositionType, string> = {
    [PositionType.LONG]: '롱',
    [PositionType.SHORT]: '숏',
};