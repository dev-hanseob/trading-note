import AdBanner from './AdBanner';

interface JournalLayoutProps {
  children: React.ReactNode;
}

export default function JournalLayout({ children }: JournalLayoutProps) {
  return (
    <div className="flex justify-center w-full px-2 sm:px-4 relative z-0">
      {/* 좌측 광고 공간 */}
      <aside className="hidden 2xl:block w-[240px] p-3">
        <AdBanner position="left" />
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="w-full max-w-7xl px-2 sm:px-4 min-h-screen relative z-0">
        {children}
      </main>

      {/* 우측 광고 공간 */}
      <aside className="hidden 2xl:block w-[240px] p-3">
        <AdBanner position="right" />
      </aside>
    </div>
  );
}
