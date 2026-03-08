'use client';

import { ReactNode } from 'react';
import ScrollReveal from './ScrollReveal';

interface FeatureSectionProps {
  eyebrow: string;
  headline: string;
  painPoint?: string;
  description: string;
  bullets?: string[];
  mockup?: ReactNode;
  fallbackIcon: React.ComponentType<{ className?: string; size?: number }>;
  reversed?: boolean;
  bgVariant?: 'dark' | 'light';
  children?: ReactNode;
}

export default function FeatureSection({
  eyebrow,
  headline,
  painPoint,
  description,
  bullets,
  mockup,
  fallbackIcon: FallbackIcon,
  reversed = false,
  bgVariant = 'dark',
  children,
}: FeatureSectionProps) {
  const bgClass =
    bgVariant === 'light'
      ? 'bg-slate-50 dark:bg-slate-900/50'
      : 'bg-white dark:bg-slate-950';

  return (
    <section className={`${bgClass} py-20 sm:py-28`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text column */}
          <ScrollReveal direction={reversed ? 'right' : 'left'}>
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold tracking-wider uppercase">
                {eyebrow}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-3 mb-4">
                {headline}
              </h2>
              {painPoint && (
                <p className="text-sm text-red-500/80 dark:text-red-400/60 mb-3">
                  {painPoint}
                </p>
              )}
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
              {bullets && bullets.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
              {children}
            </div>
          </ScrollReveal>

          {/* Screenshot / Icon column */}
          <ScrollReveal
            direction={reversed ? 'left' : 'right'}
            delay={0.15}
            className={reversed ? 'lg:order-first' : ''}
          >
            <div className="max-w-[420px] mx-auto">
              {mockup ? (
                <div className="transition-transform duration-500 hover:scale-[1.02]">
                  {mockup}
                </div>
              ) : (
                <div className="h-48 sm:h-64 lg:aspect-square lg:h-auto flex items-center justify-center">
                  <IconFallback Icon={FallbackIcon} />
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function IconFallback({
  Icon,
}: {
  Icon: React.ComponentType<{ className?: string; size?: number }>;
}) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl animate-icon-glow" />
      <Icon size={80} className="text-emerald-500/60 relative" />
    </div>
  );
}
