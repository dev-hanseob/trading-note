'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CreditCard, ListChecks } from 'lucide-react';

const tabs = [
    { label: '계정', href: '/settings/account', icon: User },
    { label: '구독 및 결제', href: '/settings/billing', icon: CreditCard },
    { label: '매매 원칙', href: '/settings/rules', icon: ListChecks },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
                {/* Page Header */}
                <div className="mb-6">
                    <p className="text-xs font-medium text-emerald-500 uppercase tracking-widest mb-1">설정</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">설정</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">계정과 앱 설정을 관리합니다.</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mb-6">
                    {tabs.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href || pathname?.startsWith(href + '/');
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                                    isActive
                                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {children}
            </div>
        </div>
    );
}
