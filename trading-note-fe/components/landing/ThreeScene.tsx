'use client';

import { Suspense, useState, useEffect, ReactNode, Component, ErrorInfo } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

export type IconType = 'lightning' | 'chart' | 'checklist';

interface ThreeSceneProps {
  iconType: IconType;
  fallback: ReactNode;
  className?: string;
}

// Dynamically import the entire canvas scene to avoid SSR issues
const ThreeCanvas = dynamic(() => import('./ThreeCanvas'), {
  ssr: false,
});

// Error boundary to catch R3F errors gracefully
class ThreeErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('ThreeScene error:', error.message, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function ThreeScene({ iconType, fallback, className }: ThreeSceneProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <ThreeErrorBoundary fallback={<div className={className}>{fallback}</div>}>
      <Suspense fallback={<div className={className}>{fallback}</div>}>
        <div className={className}>
          <ThreeCanvas iconType={iconType} isDark={isDark} />
        </div>
      </Suspense>
    </ThreeErrorBoundary>
  );
}
