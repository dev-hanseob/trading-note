'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Failed to load dashboard
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          Could not load dashboard data. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary px-6 py-2.5">
            Try Again
          </button>
          <a href="/" className="btn-secondary px-6 py-2.5">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
