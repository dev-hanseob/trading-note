// ✅ 1. layout.tsx 수정

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Trading Note',
    description: '매매일지를 기록하고 분석해보자!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" suppressHydrationWarning>
        <body
            className={`
                    ${geistSans.variable} 
                    ${geistMono.variable} 
                    font-sans antialiased 
                    bg-background text-foreground
                    m-0 p-0
                `}
        >
        <Header />

        {/* ✅ 포탈용 컨테이너 추가 */}
        <div id="modal-root"></div>

        <div className="flex justify-center w-full px-2 sm:px-4">
            {/* 좌측 광고 공간 */}
            <aside className="hidden 2xl:block w-[160px]" />

            {/* 메인 콘텐츠 */}
            <main className="w-full max-w-[1440px] px-2 sm:px-4 min-h-screen">
                {children}
            </main>

            {/* 우측 광고 공간 */}
            <aside className="hidden 2xl:block w-[160px]" />
        </div>
        </body>
        </html>
    );
}
