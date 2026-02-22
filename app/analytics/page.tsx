'use client';

import Link from 'next/link';
import { ShieldCheck, Clock, Calendar, PieChart, ArrowRight } from 'lucide-react';

const analyticsItems = [
    {
        href: '/analytics/rules',
        icon: ShieldCheck,
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        title: '매매원칙 분석',
        description: '규칙별 성과와 준수율을 분석합니다',
        available: true,
    },
    {
        href: '/analytics/time',
        icon: Clock,
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        title: '시간대별 분석',
        description: '시간대별 거래 성과를 분석합니다',
        available: true,
    },
    {
        href: '/analytics/day',
        icon: Calendar,
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
        title: '요일별 분석',
        description: '요일별 거래 패턴을 분석합니다',
        available: true,
    },
    {
        href: '/analytics/symbol',
        icon: PieChart,
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        title: '종목별 분석',
        description: '종목별 수익률을 비교합니다',
        available: true,
    },
];

export default function AnalyticsPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <p className="text-xs font-medium text-emerald-500 uppercase tracking-widest mb-1">
                        분석
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        트레이딩 분석
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        매매 데이터를 다양한 관점에서 분석합니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analyticsItems.map((item) => {
                        const Icon = item.icon;
                        const content = (
                            <div className={`flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors group ${
                                item.available
                                    ? 'hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer'
                                    : 'opacity-60'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${item.iconColor}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                                {item.title}
                                            </h2>
                                            {!item.available && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                                                    준비중
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                {item.available && (
                                    <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                                )}
                            </div>
                        );

                        if (item.available) {
                            return (
                                <Link key={item.title} href={item.href}>
                                    {content}
                                </Link>
                            );
                        }
                        return <div key={item.title}>{content}</div>;
                    })}
                </div>
            </div>
        </div>
    );
}
