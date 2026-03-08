import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function DashboardCard({ children, className = '', noPadding = false }: DashboardCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ${
        noPadding ? '' : 'p-5'
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

export function CardHeader({ icon, title, action }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
      </div>
      {action}
    </div>
  );
}
