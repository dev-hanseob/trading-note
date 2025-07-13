'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, TrendingUp, User, Settings, BookOpen, BarChart3 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 relative z-50 overflow-x-hidden">
            <div className="w-full max-w-[1600px] mx-auto">
                <div className="flex items-center justify-between px-6 sm:px-4 py-4">
                    {/* 로고 */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                            {/* 배경 패턴 */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                            
                            {/* 메인 아이콘 */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* 노트북/차트 조합 아이콘 */}
                                <svg className="w-6 h-6 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* 노트 배경 */}
                                    <path
                                        d="M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10l4-4V5a2 2 0 0 0-2-2H6z"
                                        fill="currentColor"
                                        fillOpacity="0.9"
                                    />
                                    {/* 차트 라인 */}
                                    <path
                                        d="M8 13l2 2 2-3 2 1.5"
                                        stroke="rgba(255,255,255,0.8)"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                    {/* 상승 화살표 */}
                                    <path
                                        d="M15 9l1.5-1.5L15 6"
                                        stroke="rgba(255,255,255,0.9)"
                                        strokeWidth="1.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                    {/* 노트 라인들 */}
                                    <path
                                        d="M8 17h6M8 19h4"
                                        stroke="rgba(255,255,255,0.6)"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            
                            {/* 호버 효과 */}
                            <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                            <span className="hidden sm:inline">Trading Note</span>
                            <span className="sm:hidden">TN</span>
                        </span>
                    </Link>

                    {/* 데스크톱 메뉴 */}
                    <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
                        <Link 
                            href="/dashboard" 
                            className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
                        >
                            <BarChart3 className="w-4 h-4" />
                            대시보드
                        </Link>
                        <Link 
                            href="/journal" 
                            className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
                        >
                            <BookOpen className="w-4 h-4" />
                            매매일지
                        </Link>
                        
                        <button className="btn-trendy-ghost flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            설정
                        </button>
                    </nav>

                    {/* 우측 버튼들 */}
                    <div className="flex items-center gap-3">
                        {/* 로그인 버튼 - 데스크톱에서만 표시 */}
                        <button className="hidden lg:flex btn-trendy-secondary items-center gap-2">
                            <User className="w-4 h-4" />
                            로그인
                        </button>

                        {/* 회원가입 버튼 - 데스크톱에서만 표시 */}
                        <button className="hidden lg:flex btn-trendy-secondary items-center gap-2">
                            회원가입
                        </button>
                        
                        {/* 테마 토글 - 항상 표시 */}
                        <ThemeToggle />

                        {/* 모바일 메뉴 버튼 */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden btn-trendy-icon"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* 모바일 메뉴 */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                        <div className="px-4 py-4 space-y-2">
                            <Link 
                                href="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                                <BarChart3 className="w-4 h-4" />
                                대시보드
                            </Link>
                            <Link 
                                href="/journal"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                                <BookOpen className="w-4 h-4" />
                                매매일지
                            </Link>
                            
                            <button className="btn-trendy-ghost flex items-center gap-2 w-full justify-start">
                                <Settings className="w-4 h-4" />
                                설정
                            </button>


                            {/* 모바일 로그인/회원가입 버튼들 */}
                            <div className="pt-2 space-y-3">
                                <button className="btn-trendy-secondary w-full flex items-center justify-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span className="truncate">로그인</span>
                                </button>
                                <button className="btn-trendy-primary w-full">
                                    회원가입
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
