'use client';

import { EmotionType, EmotionTypeLabel, EmotionTypeColor } from '@/type/domain/journal.enum';

interface EmotionPickerProps {
    emotion: EmotionType | null;
    setEmotion: (v: EmotionType | null) => void;
}

export default function EmotionPicker({ emotion, setEmotion }: EmotionPickerProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                지금 감정 상태 (선택)
            </label>
            <div className="flex flex-wrap gap-2">
                {Object.values(EmotionType).map((type) => {
                    const isSelected = emotion === type;
                    const colors = EmotionTypeColor[type];
                    return (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setEmotion(isSelected ? null : type)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                isSelected
                                    ? `${colors.bg} ${colors.text} ${colors.border}`
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            {EmotionTypeLabel[type]}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
