import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import Header from '@/components/Header';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/lib/query-client';

export const metadata: Metadata = {
    title: 'Trabit - 트래빗',
    description: '매매를 습관으로, 습관을 수익으로',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" suppressHydrationWarning className="overflow-x-hidden">
        <body
            className={`
                ${GeistSans.variable}
                ${GeistMono.variable}
                font-sans antialiased
                bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100
                m-0 p-0 overflow-x-hidden
            `}
        >
        <ThemeProvider attribute="class" defaultTheme="dark">
        <QueryProvider>
        <AuthProvider>
        <ToastProvider>
        <Header />
        <div id="modal-root" />
        <div className="w-full">
            {children}
        </div>
        </ToastProvider>
        </AuthProvider>
        </QueryProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
