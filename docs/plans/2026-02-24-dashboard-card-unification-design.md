# Dashboard Card Style Unification Design

## Date: 2026-02-24

## Problem
Dashboard has 10+ card components with inconsistent styles:
- radius: rounded-xl vs rounded-2xl
- border: slate-100 vs slate-200
- padding: p-4, p-5, p-6
- headers: icon size, title size, layout all different

## Approach: Token-based with DashboardCard component

### Design Tokens
- card-radius: rounded-xl
- card-bg: bg-white dark:bg-slate-900
- card-border: border border-slate-200 dark:border-slate-800
- card-padding: p-5
- section-gap: gap-4
- section-mt: mt-4

### Font Size Hierarchy
- page-title: text-lg font-bold
- card-title: text-sm font-semibold
- metric-value-lg: text-2xl font-bold tabular-nums (hero stat cards)
- metric-value: text-xl font-bold tabular-nums (secondary stat cards)
- metric-label: text-xs font-medium text-slate-500
- body: text-sm
- caption: text-xs text-slate-400

### Components
- DashboardCard: wrapper with unified card styles
- CardHeader: icon(w-4 h-4) + title(text-sm font-semibold) + optional action

### Special Cases
- StatCards hero: keep text-2xl values, but unify radius/border
- StatCards secondary: keep p-4 for compact feel, unify radius/border
- TodaySummary: conditional border color based on P&L preserved

### Files to Modify
1. NEW: components/dashboard/DashboardCard.tsx
2. TodaySummary.tsx
3. StatCards.tsx
4. GoalDashboard.tsx (compact)
5. EquityCurve.tsx
6. CalendarHeatmap.tsx
7. MonthlyPnlChart.tsx
8. RecentTrades.tsx
9. RuleInsights.tsx
10. EmotionStats.tsx
