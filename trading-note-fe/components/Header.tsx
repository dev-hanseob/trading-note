'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, BookOpen, BarChart3, LogIn, LogOut, Settings, LineChart, User, ChevronDown } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsUserMenuOpen(false);
        await logout();
        router.push('/');
    };

    const navLinks = [
        { href: '/dashboard', label: '대시보드', icon: BarChart3 },
        { href: '/journal', label: '매매일지', icon: BookOpen },
        { href: '/analytics', label: '분석', icon: LineChart },
        { href: '/settings', label: '설정', icon: Settings },
    ];

    const isLanding = pathname === '/';
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
                            <span className="hidden sm:inline">Trabit</span>
                            <span className="sm:hidden">Trabit</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    {isAuthenticated && (
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
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {!isLoading && !isAuthenticated && (
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                로그인
                            </Link>
                        )}

                        {isAuthenticated && user && (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                >
                                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                                        <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="hidden sm:inline max-w-[120px] truncate">
                                        {user.name || user.email?.split('@')[0] || ''}
                                    </span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50">
                                        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                {user.name || user.email?.split('@')[0] || ''}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <Link
                                            href="/settings"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            설정
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            로그아웃
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <ThemeToggle />

                        {isAuthenticated && (
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            >
                                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile menu */}
                {isAuthenticated && isMobileMenuOpen && (
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
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
