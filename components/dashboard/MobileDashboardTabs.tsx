'use client';

import React from 'react';
import { Receipt, LineChart, ListChecks } from 'lucide-react';

export type DashboardTab = 'charts' | 'mindset' | 'summary';

interface Props {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const tabs: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
  { id: 'charts', label: '차트', icon: LineChart },
  { id: 'mindset', label: '심법', icon: ListChecks },
  { id: 'summary', label: '거래', icon: Receipt },
];

export default function MobileDashboardTabs({ activeTab, onChange }: Props) {
  return (
    <div className="lg:hidden flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mt-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              isActive
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Icon size={14} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
