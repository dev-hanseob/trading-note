'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import TradeSidebar from '@/components/journal/TradeSidebar';
import TradeEntryForm from '@/components/journal/TradeEntryForm';

export default function NewJournalPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [chartPreview, setChartPreview] = useState<string | null>(null);

    return (
        <div className="flex h-[calc(100vh-64px)]">
            {/* Sidebar - hidden on mobile */}
            <div className="hidden lg:block">
                <TradeSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    pinnedChart={chartPreview}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <Link href="/journal" className="hover:text-emerald-600 transition-colors">매매일지</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-slate-200 font-medium">새 거래 기록</span>
                    </div>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-white">새 거래 기록</h1>
                        <p className="text-slate-500 mt-1">거래 셋업과 분석을 기록하세요</p>
                    </div>

                    {/* Form */}
                    <TradeEntryForm onChartPreviewChange={setChartPreview} />
                </div>
            </div>
        </div>
    );
}
