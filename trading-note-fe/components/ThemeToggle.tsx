'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className="relative p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 transition-all duration-300 overflow-hidden"
                aria-label="Toggle theme"
            >
                <div className="w-5 h-5" />
            </button>
        );
    }

    const isDark = resolvedTheme === 'dark';

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all duration-300 group overflow-hidden"
            title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
            {/* Background animation */}
            <div className={`absolute inset-0 bg-gradient-to-r transition-all duration-500 ${
                !isDark
                    ? 'from-yellow-400/20 to-orange-400/20 translate-x-full'
                    : 'from-blue-500/20 to-purple-500/20 translate-x-0'
            }`}></div>

            {/* Icon container */}
            <div className="relative w-5 h-5 flex items-center justify-center">
                {/* Light mode icon */}
                <Sun className={`absolute w-5 h-5 text-yellow-600 dark:text-yellow-500 transition-all duration-300 ${
                    !isDark
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 rotate-90 scale-75'
                }`} />

                {/* Dark mode icon */}
                <Moon className={`absolute w-5 h-5 text-blue-600 dark:text-blue-400 transition-all duration-300 ${
                    isDark
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 -rotate-90 scale-75'
                }`} />
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 dark:group-hover:bg-white/5 transition-all duration-300 rounded-xl"></div>
        </button>
    );
}
