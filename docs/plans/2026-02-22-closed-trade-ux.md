# Closed Trade Toggle UX Improvement

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the "종료된 거래" toggle into Section 2 (가격 & 수량) and replace it with a segment control + inline result fields for clear visual connection.

**Architecture:** Remove toggle from Section 1, add "거래 종료" subsection at bottom of Section 2 with segment control ("진행중"/"종료") and collapsible result fields. Remove standalone Section 3 entirely.

**Tech Stack:** React, Framer Motion (AnimatePresence, motion.div), Tailwind CSS, Lucide React

---

### Task 1: Remove toggle from Section 1 and standalone Section 3

**Files:**
- Modify: `trading-note-fe/components/journal/TradeEntryForm.tsx:603-629` (Section 1 toggle area)
- Modify: `trading-note-fe/components/journal/TradeEntryForm.tsx:731-772` (standalone Section 3)

**Step 1: Remove the toggle from "화폐 & 상태" row (lines 603-629)**

Replace the `<div className="flex gap-4">` block (lines 604-629) with just the currency select, removing the toggle entirely:

```tsx
{/* 화폐 */}
<div>
    <label className={labelCls}>화폐</label>
    <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className={`${inputCls} appearance-none`}
    >
        <option value="KRW">KRW</option>
        <option value="USD">USD</option>
        <option value="USDT">USDT</option>
        <option value="USDC">USDC</option>
    </select>
</div>
```

**Step 2: Remove standalone Section 3 (lines 731-772)**

Delete the entire `<AnimatePresence>` block for Section 3 "거래 결과". This code will be relocated into Section 2.

**Step 3: Verify the page renders without errors**

Run: Open `http://127.0.0.1:3000/journal/new` in browser
Expected: Form renders without Section 3 and without the toggle. No console errors.

---

### Task 2: Add segment control + result fields to Section 2

**Files:**
- Modify: `trading-note-fe/components/journal/TradeEntryForm.tsx` (inside Section 2, after risk calc results)

**Step 1: Add a ref for the result section**

Add `resultRef` alongside existing refs near the top of the component:

```tsx
const resultSectionRef = useRef<HTMLDivElement>(null);
const [highlightResult, setHighlightResult] = useState(false);
```

**Step 2: Add toggle handler with scroll + highlight**

Replace the simple `setIsClosed(!isClosed)` with a handler function:

```tsx
const handleToggleClosed = (closed: boolean) => {
    setIsClosed(closed);
    if (closed) {
        setTimeout(() => {
            resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            setHighlightResult(true);
            setTimeout(() => setHighlightResult(false), 1500);
        }, 250);
    }
};
```

**Step 3: Add "거래 종료" subsection at the end of Section 2 (after the risk calc AnimatePresence, before the closing `</div>` of Section 2)**

Insert this block inside Section 2, after line 728 (end of risk calc AnimatePresence):

```tsx
{/* 거래 종료 */}
<div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                거래 상태
            </span>
        </div>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
                type="button"
                onClick={() => handleToggleClosed(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    !isClosed
                        ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                        : 'text-slate-400 hover:text-slate-500'
                }`}
            >
                진행중
            </button>
            <button
                type="button"
                onClick={() => handleToggleClosed(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    isClosed
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-900/30'
                        : 'text-slate-400 hover:text-slate-500'
                }`}
            >
                종료
            </button>
        </div>
    </div>

    <AnimatePresence>
        {isClosed && (
            <motion.div
                ref={resultSectionRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden"
            >
                <div className={`p-4 rounded-xl border transition-all duration-500 ${
                    highlightResult
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800/40'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelCls}>청산가</label>
                            <input type="number" placeholder="0.00" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>실현 손익</label>
                            <input type="number" placeholder="자동 계산 또는 직접 입력" value={profitAmount} onChange={(e) => setProfitAmount(e.target.value)} className={inputCls} />
                            {calcs.pnl !== 0 && !profitAmount && (
                                <p className="mt-1 text-xs text-slate-400">
                                    자동 계산: <span className={calcs.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>{calcs.pnl >= 0 ? '+' : ''}{calcs.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>ROI (%)</label>
                            <input type="number" placeholder="자동 계산 또는 직접 입력" value={roiAmount} onChange={(e) => setRoiAmount(e.target.value)} className={inputCls} />
                            {calcs.roi !== 0 && !roiAmount && (
                                <p className="mt-1 text-xs text-slate-400">
                                    자동 계산: <span className={calcs.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}>{calcs.roi >= 0 ? '+' : ''}{calcs.roi.toFixed(2)}%</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
</div>
```

**Step 4: Verify in browser**

Run: Open `http://127.0.0.1:3000/journal/new`
Expected:
- Section 2 "가격 & 수량" has a "거래 상태" subsection at the bottom with "진행중 | 종료" segment control
- Clicking "종료" expands result fields (청산가, 실현 손익, ROI) with smooth height animation inside the same card
- Highlight ring briefly appears on the result area
- Page auto-scrolls to show the result fields on mobile

---

### Task 3: Verify edit mode and auto-calculation

**Step 1: Test with new trade (OPEN)**

1. Navigate to `/journal/new`
2. Fill basic info + entry price
3. Confirm segment control shows "진행중" as active
4. Save trade

**Step 2: Test edit with closed trade**

1. Edit the trade just created
2. Click "종료" in segment control
3. Enter exit price
4. Verify auto-calculation shows P&L and ROI
5. Save

**Step 3: Test that editing a previously closed trade loads correctly**

1. Re-open the closed trade for editing
2. Verify segment control shows "종료" as active
3. Verify exit price, P&L, ROI fields are pre-filled

---

### Task 4: Browser verification with Playwright

**Step 1: Screenshot new trade form**
- Navigate to `/journal/new`
- Screenshot the Section 2 area showing "진행중" selected

**Step 2: Toggle to "종료" and screenshot**
- Click "종료" button
- Wait for animation
- Screenshot showing expanded result fields with highlight

**Step 3: Verify dark mode**
- Toggle theme
- Screenshot both states (진행중/종료)
