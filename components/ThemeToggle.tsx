'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            setTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            setTheme('light');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        // ✅ 여기서 class 제거 & 추가를 명시적으로 처리
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all duration-300 group overflow-hidden"
            title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
        >
            {/* 배경 애니메이션 */}
            <div className={`absolute inset-0 bg-gradient-to-r transition-all duration-500 ${
                theme === 'light' 
                    ? 'from-yellow-400/20 to-orange-400/20 translate-x-full' 
                    : 'from-blue-500/20 to-purple-500/20 translate-x-0'
            }`}></div>
            
            {/* 아이콘 컨테이너 */}
            <div className="relative w-5 h-5 flex items-center justify-center">
                {/* 라이트 모드 아이콘 */}
                <Sun className={`absolute w-5 h-5 text-yellow-600 dark:text-yellow-500 transition-all duration-300 ${
                    theme === 'light' 
                        ? 'opacity-100 rotate-0 scale-100' 
                        : 'opacity-0 rotate-90 scale-75'
                }`} />
                
                {/* 다크 모드 아이콘 */}
                <Moon className={`absolute w-5 h-5 text-blue-600 dark:text-blue-400 transition-all duration-300 ${
                    theme === 'dark' 
                        ? 'opacity-100 rotate-0 scale-100' 
                        : 'opacity-0 -rotate-90 scale-75'
                }`} />
            </div>
            
            {/* 호버 효과 */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 dark:group-hover:bg-white/5 transition-all duration-300 rounded-xl"></div>
        </button>
    );
}