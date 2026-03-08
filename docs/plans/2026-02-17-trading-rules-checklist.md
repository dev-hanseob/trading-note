# Trading Rules Checklist Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 매매일지 작성 시 사용자 정의 매매 원칙 체크리스트를 확인할 수 있는 기능 구현

**Architecture:** 기존 백엔드 TradingRule CRUD API와 Journal.checkedRuleIds 필드를 활용. 프론트엔드에 설정 페이지(원칙 관리)와 일지 폼 내 체크리스트 UI를 추가. 원칙 체크는 선택적이며, comma-separated ID 문자열로 저장.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Headless UI, Framer Motion, Axios

---

### Task 1: TradingRule 타입 정의

**Files:**
- Create: `trading-note-fe/type/domain/tradingRule.ts`

**Step 1: 타입 파일 생성**

```typescript
export interface TradingRule {
  id: number;
  label: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TradingRuleRequest {
  label: string;
  displayOrder: number;
  isActive: boolean;
}
```

**Step 2: 커밋**

```bash
git add trading-note-fe/type/domain/tradingRule.ts
git commit -m "feat: add TradingRule type definition"
```

---

### Task 2: TradingRule API 클라이언트

**Files:**
- Create: `trading-note-fe/lib/api/tradingRule.ts`
- Reference: `trading-note-fe/lib/api/client.ts` (apiClient 패턴)
- Reference: `trading-note-fe/lib/api/seed.ts` (같은 패턴 참고)

**Step 1: API 클라이언트 파일 생성**

기존 `seed.ts` 패턴을 따라 작성한다. apiClient의 baseURL이 `/api`이므로 경로는 `/trading-rules`로 시작.

```typescript
import apiClient from './client';
import { TradingRule, TradingRuleRequest } from '@/type/domain/tradingRule';

export async function getTradingRules(): Promise<TradingRule[]> {
  const { data } = await apiClient.get<TradingRule[]>('/trading-rules');
  return data;
}

export async function createTradingRule(request: TradingRuleRequest): Promise<TradingRule> {
  const { data } = await apiClient.post<TradingRule>('/trading-rules', request);
  return data;
}

export async function updateTradingRule(id: number, request: TradingRuleRequest): Promise<TradingRule> {
  const { data } = await apiClient.put<TradingRule>(`/trading-rules/${id}`, request);
  return data;
}

export async function deleteTradingRule(id: number): Promise<void> {
  await apiClient.delete(`/trading-rules/${id}`);
}

export async function seedDefaultRules(): Promise<TradingRule[]> {
  const { data } = await apiClient.post<TradingRule[]>('/trading-rules/seed-defaults');
  return data;
}
```

**Step 2: 커밋**

```bash
git add trading-note-fe/lib/api/tradingRule.ts
git commit -m "feat: add TradingRule API client"
```

---

### Task 3: Journal 타입에 checkedRuleIds 추가

**Files:**
- Modify: `trading-note-fe/type/domain/journal.ts:35` (인터페이스 끝에 필드 추가)
- Modify: `trading-note-fe/type/dto/addJournalRequest.ts:30` (addJournalRequest에 필드 추가)

**Step 1: Journal 인터페이스에 checkedRuleIds 추가**

`journal.ts`의 Journal 인터페이스 마지막 필드 `executionResult` 뒤에 추가:

```typescript
  checkedRuleIds?: string;
```

**Step 2: addJournalRequest에 checkedRuleIds 추가**

`addJournalRequest.ts`의 addJournalRequest 인터페이스 마지막 필드 `exitPrice` 뒤에 추가:

```typescript
  checkedRuleIds?: string;
```

**Step 3: 커밋**

```bash
git add trading-note-fe/type/domain/journal.ts trading-note-fe/type/dto/addJournalRequest.ts
git commit -m "feat: add checkedRuleIds field to Journal and AddJournalRequest types"
```

---

### Task 4: 설정 페이지 생성 (원칙 관리 UI)

**Files:**
- Create: `trading-note-fe/app/settings/page.tsx`

**Step 1: 설정 페이지 구현**

설정 페이지는 매매 원칙 관리 섹션을 포함한다:
- 원칙 목록 (displayOrder 순 정렬)
- 각 원칙: 텍스트 라벨 + 활성/비활성 토글 + 수정/삭제 버튼 + 순서 변경 화살표
- "원칙 추가" 인라인 입력 (+ 버튼 누르면 입력 필드 표시)
- 원칙이 없으면 "기본 원칙 추가" 시드 버튼 표시
- 수정 시 인라인 편집 모드 전환

디자인 시스템 참고:
- 페이지 배경: `bg-slate-50 dark:bg-slate-950`
- 카드: `bg-white dark:bg-slate-900` + `border border-slate-200 dark:border-slate-800`
- 버튼: `globals.css`의 `btn-primary`, `btn-secondary`, `btn-danger`, `btn-ghost` 유틸리티 사용
- 입력: `bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700`
- 텍스트: `text-slate-900 dark:text-white` (주), `text-slate-500 dark:text-slate-400` (부)
- 악센트: emerald (긍정/활성), red (삭제/비활성)

상태 관리:
- `rules`: TradingRule[] - 원칙 목록
- `isLoading`: 로딩 상태
- `editingId`: 현재 편집 중인 원칙 ID (null이면 편집 아님)
- `editLabel`: 편집 중인 라벨 텍스트
- `newLabel`: 새 원칙 입력 텍스트
- `isAdding`: 추가 모드 여부

API 호출:
- 마운트 시 `getTradingRules()` 호출
- 추가: `createTradingRule({ label, displayOrder: rules.length + 1, isActive: true })`
- 수정: `updateTradingRule(id, { label, displayOrder, isActive })`
- 삭제: `deleteTradingRule(id)` + 확인 다이얼로그 (ConfirmDialog 컴포넌트 재사용)
- 시드: `seedDefaultRules()`
- 순서 변경: 위/아래 화살표 클릭 시 두 원칙의 displayOrder 스왑 후 각각 updateTradingRule 호출
- 활성/비활성 토글: isActive 플립 후 updateTradingRule 호출

참고 컴포넌트: `components/ConfirmDialog.tsx` (삭제 확인 다이얼로그)

**Step 2: 개발 서버에서 확인**

Run: `npm run dev` (이미 실행 중이면 생략)
브라우저에서 `http://localhost:3000/settings` 접속하여 확인

**Step 3: 커밋**

```bash
git add trading-note-fe/app/settings/page.tsx
git commit -m "feat: add settings page with trading rules management"
```

---

### Task 5: Header에 설정 네비게이션 추가

**Files:**
- Modify: `trading-note-fe/components/Header.tsx:6` (import에 Settings 아이콘 추가)
- Modify: `trading-note-fe/components/Header.tsx:13-16` (navLinks 배열에 설정 추가)

**Step 1: Header 수정**

lucide-react import에 `Settings` 아이콘 추가:
```typescript
import { Menu, X, BookOpen, BarChart3, LogIn, Settings } from 'lucide-react';
```

navLinks 배열에 설정 링크 추가:
```typescript
const navLinks = [
    { href: '/dashboard', label: '대시보드', icon: BarChart3 },
    { href: '/journal', label: '매매일지', icon: BookOpen },
    { href: '/settings', label: '설정', icon: Settings },
];
```

**Step 2: 커밋**

```bash
git add trading-note-fe/components/Header.tsx
git commit -m "feat: add settings link to header navigation"
```

---

### Task 6: JournalRegisterModal에 원칙 체크리스트 추가

**Files:**
- Modify: `trading-note-fe/components/JournalRegisterModal.tsx`

**Step 1: import 및 state 추가**

파일 상단 import에 추가:
```typescript
import { getTradingRules } from '@/lib/api/tradingRule';
import { TradingRule } from '@/type/domain/tradingRule';
import Link from 'next/link';
```

state 추가 (line 45 `emotion` state 아래):
```typescript
const [tradingRules, setTradingRules] = useState<TradingRule[]>([]);
const [checkedRuleIds, setCheckedRuleIds] = useState<Set<number>>(new Set());
```

**Step 2: useEffect에서 규칙 로드**

기존 useEffect (editTarget 초기화) 부근에 새 useEffect 추가:
```typescript
useEffect(() => {
    getTradingRules()
        .then(rules => setTradingRules(rules.filter(r => r.isActive)))
        .catch(err => console.error('Failed to load trading rules:', err));
}, []);
```

editTarget 초기화 useEffect 내에서, editTarget에 checkedRuleIds가 있으면 파싱:
```typescript
if (editTarget?.checkedRuleIds) {
    const ids = editTarget.checkedRuleIds.split(',').map(Number).filter(n => !isNaN(n));
    setCheckedRuleIds(new Set(ids));
} else {
    setCheckedRuleIds(new Set());
}
```

**Step 3: 체크리스트 UI 컴포넌트 추가**

EmotionPicker 컴포넌트 아래에 RulesChecklist 컴포넌트 추가:

```tsx
const RulesChecklist = () => {
    if (tradingRules.length === 0) {
        return (
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    매매 원칙 체크 (선택)
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-1">설정된 매매 원칙이 없습니다</p>
                    <Link
                        href="/settings"
                        className="text-xs text-emerald-500 hover:text-emerald-400 underline"
                        onClick={onClose}
                    >
                        설정에서 원칙 추가하기
                    </Link>
                </div>
            </div>
        );
    }

    const toggleRule = (id: number) => {
        setCheckedRuleIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                매매 원칙 체크 (선택)
                {checkedRuleIds.size > 0 && (
                    <span className="ml-2 text-emerald-500">
                        {checkedRuleIds.size}/{tradingRules.length}
                    </span>
                )}
            </label>
            <div className="space-y-1.5">
                {tradingRules.map(rule => (
                    <button
                        key={rule.id}
                        type="button"
                        onClick={() => toggleRule(rule.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors border ${
                            checkedRuleIds.has(rule.id)
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            checkedRuleIds.has(rule.id)
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-slate-300 dark:border-slate-600'
                        }`}>
                            {checkedRuleIds.has(rule.id) && (
                                <Check className="w-3 h-3 text-white" />
                            )}
                        </div>
                        {rule.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
```

**Step 4: 퀵 엔트리 모드에 체크리스트 배치**

`<EmotionPicker />` 호출 다음 줄 (line 656 부근, 퀵 엔트리 섹션)에 추가:
```tsx
<RulesChecklist />
```

**Step 5: 상세 입력 모드 profit 스텝에 체크리스트 배치**

상세 입력 모드의 profit step 내 EmotionPicker 아래에도 동일하게 추가:
```tsx
<RulesChecklist />
```

상세 입력 모드에서 EmotionPicker가 있는 위치를 찾아 그 아래에 배치. (line 1171 부근)

**Step 6: submit 핸들러에 checkedRuleIds 포함**

handleSubmit 함수 내 request 객체 구성 부분에서 `emotion` 필드 다음에 추가:
```typescript
checkedRuleIds: checkedRuleIds.size > 0
    ? Array.from(checkedRuleIds).join(',')
    : undefined,
```

이 부분은 request 객체가 만들어지는 곳 (line 280 부근, `const request: addJournalRequest = { ... }`)에서 수정.

**Step 7: 커밋**

```bash
git add trading-note-fe/components/JournalRegisterModal.tsx
git commit -m "feat: add trading rules checklist to journal form"
```

---

### Task 7: JournalDetailModal에 체크한 원칙 표시

**Files:**
- Modify: `trading-note-fe/components/JournalDetailModal.tsx`

**Step 1: import 및 state 추가**

import 추가:
```typescript
import { getTradingRules } from '@/lib/api/tradingRule';
import { TradingRule } from '@/type/domain/tradingRule';
```

lucide-react import에 `CheckCircle2`, `Circle` 추가:
```typescript
import { ..., CheckCircle2, Circle } from 'lucide-react';
```

컴포넌트 내부에 state 추가:
```typescript
const [allRules, setAllRules] = useState<TradingRule[]>([]);
```

**Step 2: useEffect에서 규칙 로드**

기존 useEffect 아래에 추가:
```typescript
useEffect(() => {
    getTradingRules()
        .then(rules => setAllRules(rules.filter(r => r.isActive)))
        .catch(err => console.error('Failed to load trading rules:', err));
}, []);
```

**Step 3: checkedRuleIds 파싱**

useMemo로 체크된 원칙 ID 파싱:
```typescript
const checkedIds = useMemo(() => {
    if (!journal.checkedRuleIds) return new Set<number>();
    return new Set(journal.checkedRuleIds.split(',').map(Number).filter(n => !isNaN(n)));
}, [journal.checkedRuleIds]);
```

**Step 4: 원칙 체크 섹션 UI 추가**

`{/* Memo / Narrative */}` 섹션 바로 위 (line 419 부근)에 원칙 체크 섹션 추가:

```tsx
{/* Trading Rules Check */}
{allRules.length > 0 && checkedIds.size > 0 && (
    <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            매매 원칙
            <span className="ml-2 text-xs font-normal text-slate-400">
                {checkedIds.size}/{allRules.length} 준수
            </span>
        </h3>
        <div className="space-y-1.5">
            {allRules.map(rule => (
                <div
                    key={rule.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        checkedIds.has(rule.id)
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500'
                    }`}
                >
                    {checkedIds.has(rule.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                        <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className={checkedIds.has(rule.id) ? '' : 'line-through'}>{rule.label}</span>
                </div>
            ))}
        </div>
    </div>
)}
```

**Step 5: 커밋**

```bash
git add trading-note-fe/components/JournalDetailModal.tsx
git commit -m "feat: show checked trading rules in journal detail modal"
```

---

### Task 8: 브라우저 검증

**Step 1: 개발 서버 실행 확인**

Run: `npm run dev` (trading-note-fe 디렉토리에서)

**Step 2: 설정 페이지 확인**

브라우저에서 `http://localhost:3000/settings` 접속:
- 빈 상태에서 "기본 원칙 추가" 버튼 표시 확인
- 기본 원칙 시드 후 5개 원칙 표시 확인
- 원칙 추가/수정/삭제/순서변경/활성토글 동작 확인
- 다크/라이트 모드 전환 확인

**Step 3: 매매일지 작성 확인**

`http://localhost:3000/journal`에서 새 매매일지 작성:
- 퀵 엔트리 모드에서 감정 선택 아래 원칙 체크리스트 표시 확인
- 체크박스 토글 동작 확인
- 체크 카운트(n/m) 표시 확인
- 저장 후 상세 보기에서 체크한 원칙 표시 확인

**Step 4: 헤더 네비게이션 확인**

- 대시보드, 매매일지, 설정 3개 링크 모두 표시 확인
- 활성 상태 하이라이트 확인
- 모바일 메뉴에서도 동일 확인

**Step 5: 커밋 (필요시)**

검증 중 발견된 이슈 수정 후 커밋.

---

## Task 의존성

```
Task 1 (타입) ─┐
               ├─> Task 2 (API 클라이언트) ─┐
Task 3 (DTO)  ─┘                            ├─> Task 4 (설정 페이지)
                                            ├─> Task 6 (일지 폼 체크리스트)
                                            └─> Task 7 (일지 상세 표시)
Task 5 (헤더) ← 독립
Task 8 (검증) ← 모든 태스크 완료 후
```

병렬 가능: Task 1+3 (동시), Task 4+5+6+7 (Task 2 완료 후 동시)
