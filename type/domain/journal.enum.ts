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

export enum EmotionType {
    CALM = 'CALM',
    CONFIDENT = 'CONFIDENT',
    FOMO = 'FOMO',
    REVENGE = 'REVENGE',
    ANXIOUS = 'ANXIOUS',
    TIRED = 'TIRED',
}

export const EmotionTypeLabel: Record<EmotionType, string> = {
    [EmotionType.CALM]: '침착',
    [EmotionType.CONFIDENT]: '자신감',
    [EmotionType.FOMO]: 'FOMO',
    [EmotionType.REVENGE]: '분노',
    [EmotionType.ANXIOUS]: '불안',
    [EmotionType.TIRED]: '피로',
};

export const EmotionTypeIcon: Record<EmotionType, string> = {
    [EmotionType.CALM]: 'calm',
    [EmotionType.CONFIDENT]: 'confident',
    [EmotionType.FOMO]: 'fomo',
    [EmotionType.REVENGE]: 'revenge',
    [EmotionType.ANXIOUS]: 'anxious',
    [EmotionType.TIRED]: 'tired',
};

export const EmotionTypeColor: Record<EmotionType, { bg: string; text: string; border: string }> = {
    [EmotionType.CALM]: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    [EmotionType.CONFIDENT]: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    [EmotionType.FOMO]: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
    [EmotionType.REVENGE]: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
    [EmotionType.ANXIOUS]: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    [EmotionType.TIRED]: { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' },
};