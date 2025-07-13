'use client';

import React from 'react';

interface AdBannerProps {
  position: 'left' | 'right';
}

export default function AdBanner({ position }: AdBannerProps) {
  return (
    <div className="sticky top-4 space-y-4">
      {/* 메인 광고 배너 */}
      <div className="w-full h-[600px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              currentColor 10px,
              currentColor 20px
            )`
          }} />
        </div>
        
        {/* 콘텐츠 */}
        <div className="text-center text-gray-400 dark:text-gray-500 relative z-10">
          <div className="text-3xl mb-4">📢</div>
          <div className="font-medium mb-2 text-lg">광고 영역</div>
          <div className="text-sm opacity-70 mb-2">240 × 600</div>
          <div className="text-xs opacity-50">
            {position === 'left' ? '좌측 배너' : '우측 배너'}
          </div>
          <div className="text-xs opacity-30 mt-2">
            Google Ads, 제휴 배너 등
          </div>
        </div>
      </div>

      {/* 작은 광고 배너 */}
      <div className="w-full h-[250px] border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/20 flex items-center justify-center">
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm">
          <div className="mb-2 text-xl">📱</div>
          <div className="font-medium">작은 광고</div>
          <div className="text-xs mt-1 opacity-70">240 × 250</div>
          <div className="text-xs opacity-50 mt-1">추가 광고 공간</div>
        </div>
      </div>
    </div>
  );
}
