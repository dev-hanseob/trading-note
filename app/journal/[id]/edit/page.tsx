'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import TradeSidebar from '@/components/journal/TradeSidebar';
import TradeEntryForm from '@/components/journal/TradeEntryForm';
import { getJournal } from '@/lib/api/journal';
import { Journal } from '@/type/domain/journal';

export default function EditJournalPage() {
    const params = useParams();
    const id = Number(params.id);
    const [journal, setJournal] = useState<Journal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [chartPreviews, setChartPreviews] = useState<string[]>([]);

    useEffect(() => {
        if (isNaN(id)) {
            setError(true);
            setLoading(false);
            return;
        }
        getJournal(id)
            .then(j => {
                setJournal(j);
                if (j.chartScreenshotUrl) {
                    setChartPreviews(j.chartScreenshotUrl.split(',').filter(Boolean));
                }
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-64px)]">
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="animate-pulse space-y-6">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64" />
                            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !journal) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        거래를 찾을 수 없습니다
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                        존재하지 않는 거래이거나 삭제된 거래입니다.
                    </p>
                    <Link
                        href="/journal"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors"
                    >
                        매매일지로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)]">
            {/* Sidebar - hidden on mobile */}
            <div className="hidden lg:block">
                <TradeSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    pinnedCharts={chartPreviews}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <Link href="/journal" className="hover:text-emerald-600 transition-colors">매매일지</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-slate-200 font-medium">{journal.symbol} 수정</span>
                    </div>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">거래 수정</h1>
                        <p className="text-slate-500 mt-1">거래 내용을 수정하세요</p>
                    </div>

                    {/* Form */}
                    <TradeEntryForm editTarget={journal} onChartPreviewsChange={setChartPreviews} />
                </div>
            </div>
        </div>
    );
}
