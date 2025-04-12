'use client';

import ThemeToggle from './ThemeToggle';

export default function Header() {
    return (
        <header className="w-full border-b bg-white dark:bg-neutral-900 dark:border-neutral-800">
            <div className="w-full max-w-[1680px] mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                {/* 좌측 로고 */}
                <div className="text-xl sm:text-2xl font-extrabold text-blue-600 tracking-tight">
                    Trading Note
                </div>

                {/* 중앙 메뉴 - 중간 사이즈 이상에서만 표시 */}
                <nav className="hidden md:flex gap-6 lg:gap-8 text-[14px] lg:text-[15px] font-medium text-gray-800 dark:text-gray-200">
                    <a href="#" className="hover:text-blue-600">매매일지</a>
                    <a href="#" className="hover:text-blue-600">지표</a>
                    {/*<a href="#" className="hover:text-blue-600">차트리포트</a>
                    <a href="#" className="hover:text-blue-600">전략노트</a>
                    <a href="#" className="hover:text-blue-600">커뮤니티</a>
                    <a href="#" className="hover:text-blue-600">설정</a>*/}
                </nav>

                {/* 우측 버튼 - 작은 화면에서는 크기 조절 */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <button className="hidden sm:inline-block px-3 sm:px-4 py-[5px] sm:py-[6px] text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-neutral-700">
                        로그인
                    </button>

                    {/*<button className="p-2 text-base sm:text-lg">🌐</button>*/}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}