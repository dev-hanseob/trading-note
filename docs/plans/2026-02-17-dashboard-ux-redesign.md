# Dashboard UX Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the dashboard to elevate trading mindset (심법) as the core differentiator, improve information hierarchy, add mobile tab navigation, and provide better empty state onboarding.

**Architecture:** Modify existing dashboard page.tsx and its child components. No new backend APIs needed - all data already available via existing endpoints. Create 2 new components (MobileDashboardTabs, DashboardEmptyState) and modify StatCards + dashboard page layout.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide React

---

## Summary of Changes

Based on 5-person UX panel review:

1. **Hero KPI restructure**: Elevate 원칙 준수율 to Hero KPI, demote 총잔고 to secondary
2. **Layout reorder**: 심법 sections (RuleInsights + EmotionStats) moved above charts
3. **Mobile tab navigation**: 4 tabs (요약/차트/심법/목표) for mobile viewport
4. **Empty state onboarding**: Step-by-step guide for new users

### New Layout (top to bottom):

**Desktop:**
```
[Header + DateRangeFilter + buttons]
[TodaySummary] (conditional: only when today has trades)
[Hero KPIs: 누적손익 | 총수익률 | 원칙준수율]
[Secondary: 승률 | 손익비 | 평균손익 | 스트릭]
[RuleInsights | EmotionStats] (심법 - 2col)
[EquityCurve] (full-width, promoted)
[CalendarHeatmap | MonthlyPnlChart] (2col)
[RecentTrades | GoalDashboard] (2col)
```

**Mobile:**
```
[Hero KPIs: 누적손익 | 총수익률 | 원칙준수율]
[Tab Bar: 요약 | 차트 | 심법 | 목표]
[Tab Content - one section at a time]
```

---

### Task 1: Restructure Hero KPI Cards (StatCards)

**Files:**
- Modify: `trading-note-fe/components/dashboard/StatCards.tsx`
- Modify: `trading-note-fe/app/dashboard/page.tsx`

**Step 1: Update StatCards props to accept rule compliance rate**

Add `ruleComplianceRate` prop to StatCardsProps interface in `StatCards.tsx`:

```typescript
interface StatCardsProps {
  totalSeed: number;
  totalProfit: number;
  totalRoi: number;
  winRate: number;
  tradeCount: number;
  journals: Journal[];
  ruleComplianceRate: number; // NEW: 0-100
}
```

**Step 2: Replace "총 잔고" hero card with "원칙 준수율"**

In the `heroCards` array, replace the first card (총 잔고) with 원칙 준수율:

```typescript
const heroCards = [
  {
    label: '누적 손익',
    value: (isProfitPositive ? '+' : '') + totalProfit.toLocaleString() + '원',
    icon: isProfitPositive ? ArrowUpRight : ArrowDownRight,
    iconBg: isProfitPositive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30',
    iconColor: isProfitPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
    valueColor: isProfitPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
    subLabel: `총 ${tradeCount}건 거래`,
  },
  {
    label: '총 수익률',
    value: (isRoiPositive ? '+' : '') + totalRoi.toFixed(2) + '%',
    icon: Gauge,
    iconBg: isRoiPositive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30',
    iconColor: isRoiPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
    valueColor: isRoiPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
    subLabel: 'ROI',
  },
  {
    label: '원칙 준수율',
    value: ruleComplianceRate > 0 ? ruleComplianceRate.toFixed(0) + '%' : '-',
    icon: ShieldCheck,
    iconBg: ruleComplianceRate >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30' : ruleComplianceRate >= 40 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30',
    iconColor: ruleComplianceRate >= 70 ? 'text-emerald-600 dark:text-emerald-400' : ruleComplianceRate >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400',
    valueColor: ruleComplianceRate >= 70 ? 'text-emerald-600 dark:text-emerald-400' : ruleComplianceRate >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400',
    subLabel: '매매원칙',
  },
];
```

**Step 3: Add "총 잔고" to secondary cards**

Add a 5th secondary card before the existing 4:

```typescript
{/* Balance card - moved from hero */}
<motion.div variants={itemVariants}
  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">총 잔고</span>
  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
    {totalBalance.toLocaleString()}원
  </div>
  <span className="text-xs text-slate-400 dark:text-slate-500">
    시드 {totalSeed.toLocaleString()}원
  </span>
</motion.div>
```

Change secondary grid from `grid-cols-2 sm:grid-cols-4` to `grid-cols-2 sm:grid-cols-5`.

**Step 4: Fetch rule stats in dashboard page and pass to StatCards**

In `dashboard/page.tsx`, import and fetch rule stats:

```typescript
import { getTradingRuleStats } from '@/lib/api/tradingRule';

// Inside component:
const [ruleComplianceRate, setRuleComplianceRate] = useState(0);

// Add to useEffect or separate effect:
useEffect(() => {
  getTradingRuleStats()
    .then(stats => setRuleComplianceRate(stats.overallComplianceRate))
    .catch(() => setRuleComplianceRate(0));
}, []);

// Pass to StatCards:
<StatCards ... ruleComplianceRate={ruleComplianceRate} />
```

**Step 5: Verify in browser**

Open http://localhost:3000/dashboard and confirm:
- Hero KPIs show: 누적 손익, 총 수익률, 원칙 준수율
- Secondary row has 5 cards including 총 잔고
- Colors change based on compliance rate thresholds (>=70 green, >=40 amber, <40 red)

**Step 6: Commit**

```bash
git add trading-note-fe/components/dashboard/StatCards.tsx trading-note-fe/app/dashboard/page.tsx
git commit -m "feat(dashboard): elevate rule compliance to Hero KPI"
```

---

### Task 2: Reorder Dashboard Layout

**Files:**
- Modify: `trading-note-fe/app/dashboard/page.tsx`

**Step 1: Reorder sections in the JSX**

Change the dashboard body order to prioritize 심법 sections:

```
1. TodaySummary (conditional)
2. StatCards (Hero + Secondary)
3. RuleInsights + EmotionStats (side by side, 2-col)
4. EquityCurve (full-width)
5. CalendarHeatmap + MonthlyPnlChart (2-col)
6. RecentTrades + GoalDashboard (2-col)
```

Key changes:
- RuleInsights + EmotionStats moved from bottom to right after StatCards, in a 2-col grid
- EquityCurve becomes full-width (no longer paired with CalendarHeatmap)
- CalendarHeatmap paired with MonthlyPnlChart
- RecentTrades paired with GoalDashboard
- Pass `journals={tableData}` to RuleInsights (currently it fetches its own data, keep as-is)

**Step 2: Update grid layout for RuleInsights + EmotionStats**

```jsx
{/* Mindset Section - 심법 */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
    <RuleInsights />
    <EmotionStats journals={tableData} />
</div>

{/* Equity Curve - full width */}
<div className="mt-4">
    <EquityCurve journals={tableData} seed={totalSeed} />
</div>

{/* Calendar + Monthly PnL */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
    <CalendarHeatmap journals={allJournals} />
    <MonthlyPnlChart journals={tableData} />
</div>

{/* Recent Trades + Goals */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
    <RecentTrades journals={tableData} onSelect={...} />
    <GoalDashboard currentProfit={totalProfit} totalSeed={totalSeed} currentRoi={totalRoi} compact />
</div>
```

**Step 3: Verify in browser**

Open http://localhost:3000/dashboard and confirm the new order looks correct.

**Step 4: Commit**

```bash
git add trading-note-fe/app/dashboard/page.tsx
git commit -m "feat(dashboard): reorder layout to prioritize mindset sections"
```

---

### Task 3: Mobile Tab Navigation

**Files:**
- Create: `trading-note-fe/components/dashboard/MobileDashboardTabs.tsx`
- Modify: `trading-note-fe/app/dashboard/page.tsx`

**Step 1: Create MobileDashboardTabs component**

```typescript
'use client';

import React from 'react';
import { BarChart3, LineChart, ShieldCheck, Target } from 'lucide-react';

export type DashboardTab = 'summary' | 'charts' | 'mindset' | 'goals';

interface Props {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const tabs: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
  { id: 'summary', label: '요약', icon: BarChart3 },
  { id: 'charts', label: '차트', icon: LineChart },
  { id: 'mindset', label: '심법', icon: ShieldCheck },
  { id: 'goals', label: '목표', icon: Target },
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
```

**Step 2: Integrate tabs into dashboard page**

Add state and conditional rendering:

```typescript
import MobileDashboardTabs, { DashboardTab } from '@/components/dashboard/MobileDashboardTabs';

// State
const [mobileTab, setMobileTab] = useState<DashboardTab>('summary');
```

Wrap each section group with responsive visibility:

```jsx
{/* Mobile tabs - only visible on mobile */}
<MobileDashboardTabs activeTab={mobileTab} onChange={setMobileTab} />

{/* Summary tab content */}
<div className={`lg:block ${mobileTab === 'summary' ? 'block' : 'hidden'}`}>
  {/* TodaySummary, StatCards, RecentTrades */}
</div>

{/* Charts tab content */}
<div className={`lg:block ${mobileTab === 'charts' ? 'block' : 'hidden'}`}>
  {/* EquityCurve, CalendarHeatmap, MonthlyPnlChart */}
</div>

{/* Mindset tab content */}
<div className={`lg:block ${mobileTab === 'mindset' ? 'block' : 'hidden'}`}>
  {/* RuleInsights, EmotionStats */}
</div>

{/* Goals tab content */}
<div className={`lg:block ${mobileTab === 'goals' ? 'block' : 'hidden'}`}>
  {/* GoalDashboard */}
</div>
```

Key: On desktop (lg+), all sections are always visible (`lg:block`). On mobile, only the active tab's content shows.

**Step 3: Verify in browser**

Check desktop (no tabs visible, all sections shown) and mobile viewport (tabs visible, content switches).

**Step 4: Commit**

```bash
git add trading-note-fe/components/dashboard/MobileDashboardTabs.tsx trading-note-fe/app/dashboard/page.tsx
git commit -m "feat(dashboard): add mobile tab navigation for summary/charts/mindset/goals"
```

---

### Task 4: Empty State with Onboarding Steps

**Files:**
- Create: `trading-note-fe/components/dashboard/DashboardEmptyState.tsx`
- Modify: `trading-note-fe/app/dashboard/page.tsx`

**Step 1: Create DashboardEmptyState component**

Shows 3 onboarding steps with completion status:
1. Set seed money
2. Set trading rules
3. Record first trade

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ShieldCheck, BookOpen, Check, ArrowRight } from 'lucide-react';

interface Props {
  hasSeed: boolean;
  hasRules: boolean;
  onOpenSeedModal: () => void;
}

export default function DashboardEmptyState({ hasSeed, hasRules, onOpenSeedModal }: Props) {
  const steps = [
    {
      id: 'seed',
      label: '시드머니 설정',
      description: '투자 원금을 설정하여 수익률을 추적하세요',
      icon: SlidersHorizontal,
      done: hasSeed,
      action: onOpenSeedModal,
      actionLabel: '시드 설정',
    },
    {
      id: 'rules',
      label: '매매원칙 설정',
      description: '나만의 트레이딩 규칙을 만들어 심법을 강화하세요',
      icon: ShieldCheck,
      done: hasRules,
      href: '/settings',
      actionLabel: '원칙 설정',
    },
    {
      id: 'trade',
      label: '첫 거래 기록',
      description: '매매일지를 작성하여 분석을 시작하세요',
      icon: BookOpen,
      done: false,
      href: '/journal/new',
      actionLabel: '거래 기록',
    },
  ];

  const completedCount = steps.filter(s => s.done).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Trading Note 시작하기
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          3단계만 완료하면 대시보드가 활성화됩니다
        </p>
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {completedCount}/3
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                step.done
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {/* Step number or check */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.done
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {step.done ? <Check size={16} /> : <span className="text-sm font-bold">{index + 1}</span>}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${
                  step.done ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {step.description}
                </p>
              </div>

              {/* Action */}
              {!step.done && (
                step.href ? (
                  <Link
                    href={step.href}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors flex-shrink-0"
                  >
                    {step.actionLabel}
                    <ArrowRight size={12} />
                  </Link>
                ) : (
                  <button
                    onClick={step.action}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors flex-shrink-0"
                  >
                    {step.actionLabel}
                    <ArrowRight size={12} />
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Integrate into dashboard page**

Show empty state when there are no journals:

```typescript
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState';

// In render, after loading check:
if (allJournals.length === 0) {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-screen">
      {/* Header stays */}
      <div className="flex ...">...</div>
      {/* Empty state */}
      <DashboardEmptyState
        hasSeed={totalSeed > 0}
        hasRules={ruleComplianceRate >= 0} // or check from separate state
        onOpenSeedModal={() => setShowSeedModal(true)}
      />
      {/* Keep modals */}
    </div>
  );
}
```

Actually, we need to check `hasRules` separately. Add state:

```typescript
const [hasRules, setHasRules] = useState(false);

// In the rule stats effect:
getTradingRuleStats()
  .then(stats => {
    setRuleComplianceRate(stats.overallComplianceRate);
    setHasRules(stats.ruleStats.length > 0);
  })
  .catch(() => {});
```

**Step 3: Verify in browser**

With empty DB, dashboard should show the onboarding steps.

**Step 4: Commit**

```bash
git add trading-note-fe/components/dashboard/DashboardEmptyState.tsx trading-note-fe/app/dashboard/page.tsx
git commit -m "feat(dashboard): add empty state with onboarding steps"
```

---

### Task 5: Visual Polish and Final Verification

**Files:**
- Modify: `trading-note-fe/components/dashboard/StatCards.tsx` (if needed)
- Modify: `trading-note-fe/app/dashboard/page.tsx` (if needed)

**Step 1: Test with empty data**

Navigate to http://localhost:3000/dashboard with empty DB. Verify:
- Empty state shows with 3 steps
- Seed modal opens from step 1
- Step 2 links to /settings
- Step 3 links to /journal/new

**Step 2: Add sample data and test full dashboard**

Record a few trades, set rules, verify:
- Hero KPIs display correctly (손익, ROI, 준수율)
- 심법 section (RuleInsights + EmotionStats) visible prominently
- EquityCurve full-width
- Mobile tab navigation works (resize to mobile width)
- All sections render in correct order

**Step 3: Check dark mode**

Toggle theme and verify all new/modified components look correct.

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix(dashboard): polish UX redesign styling"
```
