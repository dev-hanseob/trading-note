import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from 'next-themes';

const manrope = Manrope({ variable: '--font-manrope', subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Trading Note',
    description: '매매일지를 기록하고 분석해보자!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" suppressHydrationWarning className="overflow-x-hidden">
        <body
            className={`
                ${manrope.variable}
                font-sans antialiased
                bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100
                m-0 p-0 overflow-x-hidden
            `}
        >
        <ThemeProvider attribute="class" defaultTheme="dark">
        <ToastProvider>
        <Header />
        <div id="modal-root" />
        <div className="w-full">
            {children}
        </div>
        </ToastProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
