'use client';

import { LineChart } from 'lucide-react';
import ChartUploadSection from './ChartUploadSection';

const timeframeOptions = ['5m', '15m', '1H', '4H', '1D'];

interface ChartAnalysisSectionProps {
    // Chart upload props
    chartPreviews: string[];
    setChartPreviews: React.Dispatch<React.SetStateAction<string[]>>;
    chartUrls: string[];
    setChartUrls: React.Dispatch<React.SetStateAction<string[]>>;
    uploadingCount: number;
    setUploadingCount: React.Dispatch<React.SetStateAction<number>>;
    showFullChart: boolean;
    setShowFullChart: React.Dispatch<React.SetStateAction<boolean>>;
    fullChartIndex: number;
    setFullChartIndex: React.Dispatch<React.SetStateAction<number>>;
    isChartVisible: boolean;
    chartSectionRef: React.RefObject<HTMLDivElement | null>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onChartPreviewsChange?: (previews: string[]) => void;
    // Analysis props
    selectedTimeframes: string[];
    toggleTimeframe: (tf: string) => void;
    keyLevels: string;
    setKeyLevels: React.Dispatch<React.SetStateAction<string>>;
    sectionCard: string;
    labelCls: string;
    inputCls: string;
}

export default function ChartAnalysisSection({
    chartPreviews,
    setChartPreviews,
    chartUrls,
    setChartUrls,
    uploadingCount,
    setUploadingCount,
    showFullChart,
    setShowFullChart,
    fullChartIndex,
    setFullChartIndex,
    isChartVisible,
    chartSectionRef,
    fileInputRef,
    onChartPreviewsChange,
    selectedTimeframes,
    toggleTimeframe,
    keyLevels,
    setKeyLevels,
    sectionCard,
    labelCls,
    inputCls,
}: ChartAnalysisSectionProps) {
    return (
        <div className={sectionCard}>
            <div className="flex items-center gap-2 mb-6">
                <LineChart className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">차트 & 분석</h2>
            </div>

            <ChartUploadSection
                chartPreviews={chartPreviews}
                setChartPreviews={setChartPreviews}
                chartUrls={chartUrls}
                setChartUrls={setChartUrls}
                uploadingCount={uploadingCount}
                setUploadingCount={setUploadingCount}
                showFullChart={showFullChart}
                setShowFullChart={setShowFullChart}
                fullChartIndex={fullChartIndex}
                setFullChartIndex={setFullChartIndex}
                isChartVisible={isChartVisible}
                chartSectionRef={chartSectionRef}
                fileInputRef={fileInputRef}
                onChartPreviewsChange={onChartPreviewsChange}
            />

            <div className="space-y-4">
                {/* Timeframes */}
                <div>
                    <label className={labelCls}>타임프레임</label>
                    <div className="flex flex-wrap gap-2">
                        {timeframeOptions.map(tf => (
                            <button
                                key={tf}
                                type="button"
                                onClick={() => toggleTimeframe(tf)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                    selectedTimeframes.includes(tf)
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Levels */}
                <div>
                    <label className={labelCls}>주요 가격대</label>
                    <input
                        type="text"
                        placeholder="예: 지지: 96,000 / 저항: 100,000"
                        value={keyLevels}
                        onChange={(e) => setKeyLevels(e.target.value)}
                        className={inputCls}
                    />
                </div>
            </div>
        </div>
    );
}
