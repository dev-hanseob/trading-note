# Phase 2: Structure Improvement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** BE N+1 쿼리 최적화, Journal 엔티티 업데이트 간소화, FE 거대 컴포넌트 분리, React Query 도입으로 데이터 페칭 체계화

**Architecture:** Backend - TradingRuleService의 O(N*M) 루프를 SQL 집계로 대체, Journal 업데이트를 JPA dirty checking으로 전환. Frontend - TanStack Query로 데이터 페칭 통합, JournalRegisterModal 1,462줄을 5개 이하 컴포넌트로 분리, 저널 필터/페이지네이션을 URL 쿼리 파라미터로 관리.

**Tech Stack:** Spring Boot (Kotlin), PostgreSQL, Next.js 15 (TypeScript), TanStack Query v5

**Team Structure:**
- `be-agent`: Backend 작업 (Task 1-3)
- `fe-agent`: Frontend 작업 (Task 4-7)
- 두 에이전트는 독립적으로 병렬 실행 가능

---

## Task 1: BE - TradingRuleService N+1 쿼리 최적화

**Owner:** be-agent

**Files:**
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/repository/JournalRepository.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/service/TradingRuleService.kt`

**Problem:** `getStats()` 메서드에서 모든 저널을 메모리에 로드 후 각 규칙마다 루프 (O(rules * journals)). 1000건 저널 + 10개 규칙 = 10,000 반복.

**Step 1: JournalRepository에 집계 쿼리 추가**

`JournalRepository.kt`에 추가:
```kotlin
// 사용자별 전체 저널 수
fun countByUser(user: UserEntity): Long

// 체크된 규칙이 있는 저널 수
@Query("SELECT COUNT(j) FROM Journal j WHERE j.user = :user AND j.checkedRuleIds IS NOT NULL AND j.checkedRuleIds <> ''")
fun countByUserWithCheckedRules(@Param("user") user: UserEntity): Long

// 월별 규칙 준수율 집계
@Query("""
    SELECT FUNCTION('TO_CHAR', j.tradedAt, 'YYYY-MM') as month,
           COUNT(j) as totalCount,
           SUM(CASE WHEN j.checkedRuleIds IS NOT NULL AND j.checkedRuleIds <> '' THEN 1 ELSE 0 END) as checkedCount
    FROM Journal j
    WHERE j.user = :user
    GROUP BY FUNCTION('TO_CHAR', j.tradedAt, 'YYYY-MM')
    ORDER BY month DESC
""")
fun getMonthlyRuleComplianceStats(@Param("user") user: UserEntity): List<Array<Any>>
```

**Step 2: TradingRuleService.getStats() 리팩터링**

현재 패턴 (lines 78-139):
```kotlin
val allJournals = journalRepository.findByUser(userEntity)  // 모든 저널 로드
// ... 3번 루프
```

변경 - DB 집계 사용:
```kotlin
fun getStats(user: User): TradingRuleStatsResponse {
    val userEntity = UserEntity.toEntity(user)
    val allRules = tradingRuleRepository.findByUserOrderByDisplayOrderAsc(userEntity)

    // DB에서 집계 (메모리 루프 대신)
    val totalJournals = journalRepository.countByUser(userEntity)
    val journalsWithRules = journalRepository.countByUserWithCheckedRules(userEntity)

    val overallComplianceRate = if (totalJournals > 0) {
        (journalsWithRules.toDouble() / totalJournals * 100)
    } else 0.0

    // 월별 준수율도 DB 집계
    val monthlyStats = journalRepository.getMonthlyRuleComplianceStats(userEntity)
    val monthlyComplianceRates = monthlyStats.map { row ->
        MonthlyComplianceRate(
            month = row[0] as String,
            rate = if ((row[1] as Long) > 0) {
                ((row[2] as Long).toDouble() / (row[1] as Long) * 100)
            } else 0.0
        )
    }

    // 규칙별 체크 횟수: 여전히 저널 로드 필요하지만 파싱 캐시 사용
    val allJournals = journalRepository.findByUser(userEntity)
    val parsedRuleCache = allJournals.associate { j ->
        j.id!! to parseCheckedRuleIds(j.checkedRuleIds)
    }

    val ruleStats = allRules.map { rule ->
        val checkCount = parsedRuleCache.values.count { it.contains(rule.id!!) }
        RuleStat(
            ruleId = rule.id!!,
            label = rule.label,
            checkCount = checkCount.toLong(),
            totalJournals = totalJournals
        )
    }

    return TradingRuleStatsResponse(
        overallComplianceRate = overallComplianceRate,
        monthlyComplianceRates = monthlyComplianceRates,
        ruleStats = ruleStats,
        totalRules = allRules.size,
        totalJournals = totalJournals
    )
}
```

**Step 3: 빌드 확인**

Run: `cd trading-note-be && ./mvnw clean compile -q`

**Step 4: Commit**

```bash
git add -A
git commit -m "perf: optimize TradingRuleService with DB aggregation queries"
```

---

## Task 2: BE - Journal 엔티티 업데이트 간소화

**Owner:** be-agent

**Files:**
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/entity/Journal.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/service/JournalService.kt`

**Problem:** `updateJournal()`, `closePosition()` 에서 37개 필드를 하나씩 복사하는 패턴. 필드 추가 시 누락 위험.

**Step 1: Journal 엔티티에 update/close 메서드 추가**

`Journal.kt`에 도메인 메서드 추가 (var 필드를 사용하는 대신 엔티티 내부에서 변경):
```kotlin
fun updateFrom(request: AddJournalRequest) {
    this.assetType = request.assetType
    this.tradeType = request.tradeType
    this.position = request.position
    this.currency = request.currency ?: this.currency
    this.symbol = request.symbol
    this.investment = request.investment
    this.profit = request.profit
    this.roi = request.roi
    this.tradedAt = request.tradedAt
    this.memo = request.memo
    // ... 나머지 필드들
    this.updatedAt = LocalDateTime.now()
}

fun close(request: ClosePositionRequest) {
    if (this.tradeStatus == TradeStatus.CLOSED) {
        throw PositionAlreadyClosedException(this.id!!)
    }
    this.tradeStatus = TradeStatus.CLOSED
    this.exitPrice = request.exitPrice
    this.exitDate = request.exitDate ?: LocalDate.now()
    this.realizedPnl = request.realizedPnl
    this.postTradeAnalysis = request.postTradeAnalysis
    this.executionResult = request.executionResult
    this.wouldTakeAgain = request.wouldTakeAgain
    this.updatedAt = LocalDateTime.now()
}
```

이를 위해 Journal 생성자 파라미터를 `val` -> `var`로 변경 (JPA managed entity이므로 적합).

**Step 2: JournalService 간소화**

`updateJournal()` 변경 (현재 77-119줄 → ~10줄):
```kotlin
fun updateJournal(id: Long, request: AddJournalRequest, user: User): JournalResponse {
    val userEntity = UserEntity.toEntity(user)
    val existing = journalRepository.findByIdAndUser(id, userEntity)
        ?: throw JournalNotFoundException(id)
    existing.updateFrom(request)
    val saved = journalRepository.save(existing)
    return JournalResponse.from(saved)
}
```

`closePosition()` 변경 (현재 121-172줄 → ~10줄):
```kotlin
fun closePosition(id: Long, request: ClosePositionRequest, user: User): JournalResponse {
    val userEntity = UserEntity.toEntity(user)
    val existing = journalRepository.findByIdAndUser(id, userEntity)
        ?: throw JournalNotFoundException(id)
    existing.close(request)
    val saved = journalRepository.save(existing)
    return JournalResponse.from(saved)
}
```

**Step 3: 빌드 확인**

Run: `cd trading-note-be && ./mvnw clean compile -q`

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: add domain methods to Journal entity, simplify service update logic"
```

---

## Task 3: BE - SubscriptionController 인증 정리

**Owner:** be-agent

**Files:**
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/subscription/controller/SubscriptionController.kt`

**Problem:** Phase 1에서 다른 컨트롤러는 `@CurrentUser` 정리했지만, SubscriptionController에 `@CurrentUser(required = false)` + 수동 userId null 체크가 남아있을 수 있음.

**Step 1: SubscriptionController 확인 및 정리**

파일을 읽고 `@CurrentUser(required = false)` 또는 수동 null 체크가 남아있으면 `@CurrentUser user: User`로 변경.

**Step 2: 빌드 확인**

Run: `cd trading-note-be && ./mvnw clean compile -q`

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: clean up SubscriptionController auth pattern"
```

---

## Task 4: FE - TanStack Query 설치 및 기본 설정

**Owner:** fe-agent

**Files:**
- Modify: `trading-note-fe/package.json`
- Create: `trading-note-fe/lib/query-client.ts`
- Modify: `trading-note-fe/app/layout.tsx`

**Step 1: TanStack Query 설치**

Run: `cd trading-note-fe && npm install @tanstack/react-query`

**Step 2: QueryClient Provider 생성**

```typescript
// lib/query-client.ts
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,       // 30초 동안 fresh
        gcTime: 5 * 60 * 1000,      // 5분 캐시
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Step 3: layout.tsx에 Provider 추가**

`app/layout.tsx`의 body 안에 `<QueryProvider>` 래핑 추가 (기존 `<ToastProvider>`, `<ThemeProvider>` 와 같은 레벨).

**Step 4: 빌드 확인**

Run: `cd trading-note-fe && npm run build`

**Step 5: Commit**

```bash
git add package.json package-lock.json lib/query-client.ts app/layout.tsx
git commit -m "feat: add TanStack Query provider and configuration"
```

---

## Task 5: FE - 저널 데이터 페칭을 TanStack Query로 전환

**Owner:** fe-agent
**Depends on:** Task 4

**Files:**
- Create: `trading-note-fe/hooks/useJournals.ts`
- Modify: `trading-note-fe/app/journal/page.tsx`
- Modify: `trading-note-fe/app/dashboard/page.tsx`

**Step 1: useJournals 커스텀 훅 생성**

```typescript
// hooks/useJournals.ts
import { useQuery } from '@tanstack/react-query';
import { getJournals } from '@/lib/api/journal';

interface UseJournalsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  enabled?: boolean;
}

export function useJournals({ page = 1, pageSize = 10, status, search, enabled = true }: UseJournalsParams = {}) {
  return useQuery({
    queryKey: ['journals', { page, pageSize, status, search }],
    queryFn: () => getJournals(page, pageSize, status, search),
    enabled,
  });
}

export function useAllJournals(enabled = true) {
  return useQuery({
    queryKey: ['journals', 'all'],
    queryFn: async () => {
      const firstPage = await getJournals(1, 100);
      const total = firstPage.total;
      if (total <= 100) return firstPage.journals;

      const pages = Math.ceil(total / 100);
      const promises = [];
      for (let i = 2; i <= pages; i++) {
        promises.push(getJournals(i, 100));
      }
      const results = await Promise.all(promises);
      return [
        ...firstPage.journals,
        ...results.flatMap(r => r.journals),
      ];
    },
    enabled,
  });
}
```

**Step 2: journal/page.tsx의 수동 fetching을 useJournals로 교체**

현재 패턴 (lines 59-72):
```typescript
const [journals, setJournals] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const fetchJournals = useCallback(async () => { ... }, []);
useEffect(() => { fetchJournals(); }, [fetchJournals]);
```

변경:
```typescript
const { data, isLoading, refetch } = useJournals({
  page: currentPage,
  pageSize: itemsPerPage,
  status: statusFilter,
  search: searchQuery,
});
const journals = data?.journals ?? [];
const totalCount = data?.total ?? 0;
```

관련 useState 제거: `journals`, `isLoading`, `totalCount`, `error`

**Step 3: dashboard/page.tsx의 수동 fetching을 useAllJournals로 교체**

현재 패턴 (lines 76-78 + 90-145):
```typescript
const [allJournals, setAllJournals] = useState([]);
const [isLoadingJournals, setIsLoadingJournals] = useState(true);
const [error, setError] = useState(null);
// ... 50줄 useEffect
```

변경:
```typescript
const { data: allJournals = [], isLoading: isLoadingJournals, error } = useAllJournals();
```

**Step 4: 빌드 확인**

Run: `cd trading-note-fe && npm run build`

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: replace manual data fetching with TanStack Query hooks"
```

---

## Task 6: FE - 저널 필터/페이지네이션 URL 상태 관리

**Owner:** fe-agent

**Files:**
- Create: `trading-note-fe/hooks/useUrlState.ts`
- Modify: `trading-note-fe/app/journal/page.tsx`

**Step 1: useUrlState 훅 생성**

```typescript
// hooks/useUrlState.ts
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useUrlState<T extends Record<string, string>>(defaults: T) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getParam = useCallback((key: keyof T): string => {
    return searchParams.get(key as string) ?? defaults[key];
  }, [searchParams, defaults]);

  const setParams = useCallback((updates: Partial<T>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === defaults[key as keyof T] || value === '' || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value as string);
      }
    });
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, router, pathname, defaults]);

  return { getParam, setParams };
}
```

**Step 2: journal/page.tsx에서 useState를 URL 상태로 전환**

현재 (lines 45-57):
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [searchQuery, setSearchQuery] = useState('');
const [assetFilter, setAssetFilter] = useState('all');
// ...
```

변경:
```typescript
const { getParam, setParams } = useUrlState({
  page: '1',
  search: '',
  asset: 'all',
  type: 'all',
  outcome: 'all',
  sort: 'tradedAt',
  dir: 'desc',
  view: 'table',
});

const currentPage = Number(getParam('page'));
const searchQuery = getParam('search');
const assetFilter = getParam('asset');
// ...

// 페이지 변경 시:
const handlePageChange = (page: number) => setParams({ page: String(page) });
```

**Step 3: Suspense boundary 추가**

`useSearchParams()`는 `<Suspense>` 필요. journal/page.tsx를 감싸거나, page 컴포넌트 내에서 처리.

**Step 4: 빌드 확인**

Run: `cd trading-note-fe && npm run build`

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: persist journal filters and pagination in URL query params"
```

---

## Task 7: FE - JournalRegisterModal 컴포넌트 분리

**Owner:** fe-agent

**Files:**
- Create: `trading-note-fe/components/journal/QuickEntryForm.tsx`
- Create: `trading-note-fe/components/journal/DetailEntryForm.tsx`
- Create: `trading-note-fe/components/journal/useJournalForm.ts`
- Modify: `trading-note-fe/components/JournalRegisterModal.tsx`

**Problem:** JournalRegisterModal이 1,462줄. 퀵 엔트리 + 상세 입력 + 폼 상태 + 계산 로직 + API 호출이 모두 한 파일.

**Step 1: 폼 상태 관리 훅 추출 (useJournalForm)**

`components/journal/useJournalForm.ts`:
```typescript
// JournalRegisterModal에서 아래를 추출:
// - 모든 useState (formData, errors, isSubmitting 등)
// - handleChange, handleSubmit
// - formatNumberInput/parseNumberInput 사용 로직
// - ROI/profit 자동 계산 로직
// - editTarget이 있을 때 초기값 세팅
// - API 호출 (createJournal / updateJournal)

export function useJournalForm(editTarget: Journal | null, onSuccess: () => void) {
  // ... 폼 상태 + 핸들러 반환
  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
  };
}
```

**Step 2: QuickEntryForm 컴포넌트 추출**

`components/journal/QuickEntryForm.tsx`:
현재 JournalRegisterModal에서 `isQuickMode === true`일 때 렌더링하는 JSX를 추출.
- 자산유형, 거래일, 종목, 시장, 화폐, 수량, 단가, 투자금, 손익, ROI 필드
- ~200줄 예상

**Step 3: DetailEntryForm 컴포넌트 추출**

`components/journal/DetailEntryForm.tsx`:
현재 JournalRegisterModal에서 `isQuickMode === false`일 때 렌더링하는 JSX를 추출.
- 스텝별 위저드 폼 (기본정보, 가격&수량, 리스크 관리, 거래 심리, 매매원칙)
- ~500줄 예상

**Step 4: JournalRegisterModal 간소화**

변경 후 JournalRegisterModal은:
- 모달 shell (open/close, portal)
- 퀵/상세 모드 탭 전환
- `useJournalForm` 훅으로 상태 관리
- 모드에 따라 `<QuickEntryForm>` 또는 `<DetailEntryForm>` 렌더링
- ~150줄 예상

**Step 5: 빌드 확인**

Run: `cd trading-note-fe && npm run build`

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: split JournalRegisterModal into composable form components"
```

---

## Execution Summary

| Task | Owner | Dependency | Estimated |
|------|-------|------------|-----------|
| 1. TradingRuleService N+1 최적화 | be-agent | None | 15 min |
| 2. Journal 업데이트 간소화 | be-agent | None | 15 min |
| 3. SubscriptionController 정리 | be-agent | None | 5 min |
| 4. TanStack Query 설정 | fe-agent | None | 10 min |
| 5. 저널 데이터 페칭 전환 | fe-agent | Task 4 | 20 min |
| 6. URL 상태 관리 | fe-agent | None | 15 min |
| 7. JournalRegisterModal 분리 | fe-agent | None | 30 min |

**Parallelization:**
- be-agent: Task 1 + 2 + 3 (모두 독립, 순차 실행)
- fe-agent: Task 4 → 5 (순차), Task 6 + 7 (Task 4와 독립, 동시 가능)
- be-agent와 fe-agent는 완전 독립, 동시 실행

**Total estimated: ~50 min** (병렬 실행 시)
