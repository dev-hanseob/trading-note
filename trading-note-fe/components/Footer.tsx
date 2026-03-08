'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function Footer() {
    const [showBizInfo, setShowBizInfo] = useState(false);

    return (
        <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Links */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Trabit</span>
                    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                        <Link href="/pricing" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">요금제</Link>
                        <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">이용약관</Link>
                        <Link href="/privacy" className="font-semibold hover:text-slate-700 dark:hover:text-slate-300 transition-colors">개인정보처리방침</Link>
                        <a href="mailto:support@trabit.io" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">문의하기</a>
                    </div>
                </div>

                {/* Business Info Toggle */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <button
                        onClick={() => setShowBizInfo(!showBizInfo)}
                        className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                    >
                        사업자정보 {showBizInfo ? '닫기' : '보기'}
                        <ChevronDown className={`w-3 h-3 transition-transform ${showBizInfo ? 'rotate-180' : ''}`} />
                    </button>

                    {showBizInfo && (
                        <div className="mt-3 text-xs text-slate-400 dark:text-slate-500 leading-relaxed space-y-1">
                            <p>상호: (미등록) | 대표: (미등록)</p>
                            <p>사업자등록번호: (미등록) | 통신판매업 신고번호: (미등록)</p>
                            <p>주소: (미등록)</p>
                            <p>이메일: support@trabit.io</p>
                            <p>호스팅 서비스: Amazon Web Services</p>
                        </div>
                    )}
                </div>

                {/* Copyright */}
                <div className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                    &copy; {new Date().getFullYear()} Trabit. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
