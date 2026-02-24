'use client';

import { Suspense, lazy, useState, ReactNode } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  sceneUrl?: string;
  fallback: ReactNode;
  className?: string;
}

export default function SplineScene({ sceneUrl, fallback, className }: SplineSceneProps) {
  const [hasError, setHasError] = useState(false);

  if (!sceneUrl || hasError) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <Suspense fallback={<div className={className}>{fallback}</div>}>
      <Spline
        scene={sceneUrl}
        className={className}
        onError={() => setHasError(true)}
      />
    </Suspense>
  );
}
