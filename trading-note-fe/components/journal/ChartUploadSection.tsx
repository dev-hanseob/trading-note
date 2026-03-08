'use client';

import { useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, ChevronDown } from 'lucide-react';
import { uploadChart } from '@/lib/api/journal';

interface ChartUploadSectionProps {
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
}

export default function ChartUploadSection({
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
}: ChartUploadSectionProps) {
    const handleFilesSelect = useCallback(async (files: File[]) => {
        const validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
        if (validFiles.length === 0) return;

        const newPreviews: string[] = [];
        for (const file of validFiles) {
            const preview = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });
            newPreviews.push(preview);
        }

        setChartPreviews(prev => {
            const updated = [...prev, ...newPreviews];
            onChartPreviewsChange?.(updated);
            return updated;
        });

        setUploadingCount(prev => prev + validFiles.length);
        for (const file of validFiles) {
            try {
                const url = await uploadChart(file);
                setChartUrls(prev => [...prev, url]);
            } catch {
                // upload failure handled silently - preview remains without URL
            } finally {
                setUploadingCount(prev => prev - 1);
            }
        }
    }, [onChartPreviewsChange, setChartPreviews, setChartUrls, setUploadingCount]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) handleFilesSelect(files);
    }, [handleFilesSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const removeChart = (index: number) => {
        setChartPreviews(prev => {
            const updated = prev.filter((_, i) => i !== index);
            onChartPreviewsChange?.(updated);
            return updated;
        });
        setChartUrls(prev => prev.filter((_, i) => i !== index));
    };

    const removeAllCharts = () => {
        setChartPreviews([]);
        setChartUrls([]);
        onChartPreviewsChange?.([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <>
            {/* Mobile mini preview bar */}
            {chartPreviews.length > 0 && !isChartVisible && (
                <div
                    className="fixed top-14 left-0 right-0 z-30 lg:hidden cursor-pointer"
                    onClick={() => { setFullChartIndex(0); setShowFullChart(true); }}
                >
                    <div className="mx-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center gap-3 shadow-lg">
                        <img
                            src={chartPreviews[0]}
                            alt="Chart preview"
                            className="w-16 h-10 object-cover rounded-lg border border-slate-300 dark:border-slate-600"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Chart screenshot {chartPreviews.length > 1 && `(${chartPreviews.length})`}
                            </p>
                            <p className="text-[10px] text-slate-400">Tap to view fullscreen</p>
                        </div>
                        <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                </div>
            )}

            {/* Fullscreen chart overlay */}
            {showFullChart && chartPreviews.length > 0 && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowFullChart(false)}
                >
                    <img src={chartPreviews[fullChartIndex]} alt="Chart" className="max-w-full max-h-full object-contain" />
                    {chartPreviews.length > 1 && (
                        <>
                            <button
                                type="button"
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                                onClick={(e) => { e.stopPropagation(); setFullChartIndex(i => (i - 1 + chartPreviews.length) % chartPreviews.length); }}
                            >
                                <ChevronDown className="w-5 h-5 rotate-90" />
                            </button>
                            <button
                                type="button"
                                className="absolute right-14 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                                onClick={(e) => { e.stopPropagation(); setFullChartIndex(i => (i + 1) % chartPreviews.length); }}
                            >
                                <ChevronDown className="w-5 h-5 -rotate-90" />
                            </button>
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
            )}

            {/* Chart upload area */}
            <div ref={chartSectionRef}>
                {chartPreviews.length > 0 && (
                    <div className="mb-4 space-y-3">
                        <div className={`grid gap-3 ${chartPreviews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {chartPreviews.map((preview, i) => (
                                <div key={i} className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group">
                                    <img
                                        src={preview}
                                        alt={`Chart ${i + 1}`}
                                        className="w-full max-h-48 object-contain bg-slate-100 dark:bg-slate-900 cursor-pointer"
                                        onClick={() => { setFullChartIndex(i); setShowFullChart(true); }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeChart(i)}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    {i < chartUrls.length && (
                                        <div className="absolute bottom-1.5 left-1.5 bg-emerald-500/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                            {i + 1}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {uploadingCount > 0 && (
                                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                        {uploadingCount} uploading...
                                    </span>
                                )}
                                {uploadingCount === 0 && chartUrls.length > 0 && (
                                    <span className="text-xs text-emerald-500 font-medium">{chartUrls.length} uploaded</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors"
                                >
                                    + Add
                                </button>
                                <button
                                    type="button"
                                    onClick={removeAllCharts}
                                    className="text-xs text-slate-400 hover:text-red-400 font-medium transition-colors"
                                >
                                    Remove all
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {chartPreviews.length === 0 && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center mb-6 hover:border-emerald-600 transition-all cursor-pointer group"
                    >
                        <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-emerald-400 transition-colors" />
                        <p className="text-sm text-slate-500 font-medium">Drag & drop or click to upload chart screenshots</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP (max 5MB) - multiple files</p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) handleFilesSelect(files);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                />
            </div>
        </>
    );
}
