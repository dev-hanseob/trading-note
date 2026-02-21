'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';

interface TradeSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    pinnedCharts?: string[];
}

export default function TradeSidebar({ collapsed, onToggle, pinnedCharts = [] }: TradeSidebarProps) {
    const [showFullChart, setShowFullChart] = useState(false);
    const [fullChartIndex, setFullChartIndex] = useState(0);

    const hasCharts = pinnedCharts.length > 0;

    const openFullscreen = (index: number) => {
        setFullChartIndex(index);
        setShowFullChart(true);
    };

    const fullscreenOverlay = showFullChart && hasCharts && (
        <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullChart(false)}
        >
            <img src={pinnedCharts[fullChartIndex]} alt="Chart" className="max-w-full max-h-full object-contain" />
            {pinnedCharts.length > 1 && (
                <>
                    <button
                        type="button"
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                        onClick={(e) => { e.stopPropagation(); setFullChartIndex(i => (i - 1 + pinnedCharts.length) % pinnedCharts.length); }}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        className="absolute right-14 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                        onClick={(e) => { e.stopPropagation(); setFullChartIndex(i => (i + 1) % pinnedCharts.length); }}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {pinnedCharts.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFullChartIndex(i); }}
                                className={`w-2 h-2 rounded-full transition-all ${i === fullChartIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </>
            )}
            <button
                type="button"
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                onClick={() => setShowFullChart(false)}
            >
                <X className="w-6 h-6" />
            </button>
        </div>
    );

    if (collapsed) {
        return (
            <>
                <div className="w-16 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center py-4 shrink-0">
                    <button
                        onClick={onToggle}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    {hasCharts && (
                        <button
                            onClick={() => openFullscreen(0)}
                            className="mt-4 w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-emerald-500 transition-all relative"
                        >
                            <img src={pinnedCharts[0]} alt="Chart" className="w-full h-full object-cover" />
                            {pinnedCharts.length > 1 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {pinnedCharts.length}
                                </span>
                            )}
                        </button>
                    )}
                </div>
                {fullscreenOverlay}
            </>
        );
    }

    return (
        <>
            <div className="w-96 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col shrink-0 h-[calc(100vh-64px)]">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            차트 {hasCharts && <span className="text-slate-400 font-medium ml-1">{pinnedCharts.length}</span>}
                        </h3>
                    </div>
                    <button
                        onClick={onToggle}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                {/* Chart Preview */}
                {hasCharts ? (
                    <div className="p-3 flex-1 overflow-y-auto space-y-3">
                        {pinnedCharts.map((chart, i) => (
                            <div
                                key={i}
                                className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition-all group"
                                onClick={() => openFullscreen(i)}
                            >
                                <img
                                    src={chart}
                                    alt={`Chart ${i + 1}`}
                                    className="w-full object-contain bg-slate-100 dark:bg-slate-900"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                    <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1.5 rounded-full">
                                        전체화면
                                    </span>
                                </div>
                                {pinnedCharts.length > 1 && (
                                    <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {i + 1}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center">
                            <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                                차트 스크린샷 없음
                            </p>
                            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                                폼에서 차트를 업로드하면 여기에 고정됩니다
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {fullscreenOverlay}
        </>
    );
}
