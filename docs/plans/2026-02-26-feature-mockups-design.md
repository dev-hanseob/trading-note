# Landing Page Feature Mockups Design

## Problem
Landing page feature section uses 3 PNG screenshots that are low quality:
- Different aspect ratios (420x685, 700x888, 500x465)
- One has browser DevTools inspector overlay visible
- Raw app screenshots, not polished marketing assets

## Solution
Replace PNG images with React component mockups using Tailwind CSS.

### Benefits
- Always sharp (no image quality issues)
- Auto-adapts to dark/light theme
- Consistent with existing design system
- No image file maintenance needed

### Precedent
- `DashboardMockup` in Hero section already uses this pattern
- `AnalyticsShowcase` uses React-rendered data visualizations

## Mockup Designs

### 1. QuickEntryMockup
Mini quick entry form showing:
- Symbol (BTC), position badge (LONG), date
- Investment amount, profit (+320 USDT), ROI (+6.40%)
- Emotion selector (3 color dots)
- "거래 등록" button

### 2. AnalyticsMockup
Mini analytics dashboard showing:
- 3 KPIs: win rate 68.7%, Profit Factor 2.14, 32 trades
- SVG equity curve (upward trending)
- Recent 5 trades with color-coded results

### 3. TradingRulesMockup
Checklist + performance comparison showing:
- Compliance rate progress bar (78%)
- 3 rules checklist (2 checked, 1 unchecked)
- Compliance vs non-compliance performance comparison

## File Changes
- Create: `components/landing/mockups/QuickEntryMockup.tsx`
- Create: `components/landing/mockups/AnalyticsMockup.tsx`
- Create: `components/landing/mockups/TradingRulesMockup.tsx`
- Modify: `components/landing/FeatureSection.tsx` - add `mockup: ReactNode` prop
- Modify: `app/page.tsx` - replace images with mockup components
- Delete: `public/images/features/*.png` (3 files)

## Style
- Card style, no browser frame
- Design tokens: slate-800/30 bg, emerald profit, red loss, rounded-lg, text-[11px] secondary
