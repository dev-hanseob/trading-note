'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, BookOpen, BarChart3, Plus } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: '/dashboard', label: '대시보드', icon: BarChart3 },
        { href: '/journal', label: '매매일지', icon: BookOpen },
    ];

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="w-full max-w-[1600px] mx-auto">
                <div className="flex items-center justify-between px-4 sm:px-6 h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                                <path d="M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10l4-4V5a2 2 0 0 0-2-2H6z" fill="currentColor" fillOpacity="0.9" />
                                <path d="M8 13l2 2 2-3 2 1.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                            <span className="hidden sm:inline">Trading Note</span>
                            <span className="sm:hidden">TN</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    isActive(href)
                                        ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/journal/new"
                            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-md transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            새 거래
                        </Link>

                        <ThemeToggle />

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/50">
                        <div className="px-4 py-3 space-y-1">
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                                        isActive(href)
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </Link>
                            ))}
                            <Link
                                href="/journal/new"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 mt-2 bg-emerald-600 text-white font-medium rounded-md"
                            >
                                <Plus className="w-5 h-5" />
                                새 거래 기록
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
