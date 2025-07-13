// ✅ 1. layout.tsx 수정

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import AdBanner from '@/components/AdBanner';




const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Trading Note',
    description: '매매일지를 기록하고 분석해보자!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" suppressHydrationWarning className="overflow-x-hidden">
        <body
            className={`
                    ${geistSans.variable} 
                    ${geistMono.variable} 
                    font-sans antialiased 
                    bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100
                    m-0 p-0 overflow-x-hidden
                `}
        >
        <Header />

        {/* ✅ 포탈용 컨테이너 추가 */}
        <div id="modal-root"></div>

        {/* 메인 콘텐츠 컨테이너 */}
        <div className="w-full">
            {children}
        </div>
        </body>
        </html>
    );
}
