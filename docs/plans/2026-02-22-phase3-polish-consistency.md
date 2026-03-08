# Phase 3: Polish & Consistency Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** BE API 응답 형식 통일, FE 분석 페이지 TanStack Query 전환, 대형 컴포넌트 추가 분리, 타입 안전성 강화

**Architecture:** Backend - Seed 컨트롤러의 raw entity 반환을 DTO로 전환하고 페이지네이션 응답 Map을 타입화. Frontend - 4개 분석 페이지의 수동 fetching을 useAllJournals 훅으로 통합, TradeEntryForm 1,127줄을 하위 컴포넌트로 분리, chart tooltip과 API 클라이언트의 any 타입 제거.

**Tech Stack:** Spring Boot (Kotlin), Next.js 15 (TypeScript), TanStack Query v5

**Team Structure:**
- `be-agent`: Backend 작업 (Task 1-2)
- `fe-agent`: Frontend 작업 (Task 3-6)
- 두 에이전트는 독립적으로 병렬 실행 가능

---

## Task 1: BE - Seed API 응답 DTO 전환

**Owner:** be-agent

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/seed/model/SeedResponse.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/seed/controller/SeedController.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/seed/service/SeedService.kt`

**Problem:** SeedController가 raw `Seed` 도메인 객체를 직접 반환. 다른 도메인(Journal, Subscription)은 Response DTO를 사용하는데 Seed만 불일치.

**Step 1: SeedResponse DTO 생성**

```kotlin
// domain/seed/model/SeedResponse.kt
package com.example.tradingnotebe.domain.seed.model

import com.example.tradingnotebe.domain.seed.domain.Seed
import java.math.BigDecimal

data class SeedResponse(
    val id: Long,
    val price: BigDecimal,
    val currency: String
) {
    companion object {
        fun from(seed: Seed): SeedResponse {
            return SeedResponse(
                id = seed.id!!,
                price = seed.price,
                currency = seed.currency
            )
        }
    }
}
```

**Step 2: SeedController 반환 타입 변경**

모든 엔드포인트의 반환 타입을 `Seed` -> `SeedResponse`로 변경:
- `createSeed` -> `ResponseEntity<SeedResponse>`
- `getSeeds` -> `ResponseEntity<List<SeedResponse>>`
- `getSeed` -> `ResponseEntity<SeedResponse>`
- `updateSeed` -> `ResponseEntity<SeedResponse>`

서비스 반환값에 `.let { SeedResponse.from(it) }` 적용.

**Step 3: 빌드 확인**

Run: `cd trading-note-be && ./mvnw clean compile -q`

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: introduce SeedResponse DTO, stop exposing raw domain objects"
```

---

## Task 2: BE - 페이지네이션 응답 타입화

**Owner:** be-agent

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/common/PagedResponse.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/controller/JournalController.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/controller/CsvImportController.kt`

**Problem:** JournalController, CsvImportController에서 페이지네이션 응답을 `Map<String, Any>`로 반환. 타입 안전성 없음.

**Step 1: PagedResponse 생성**

```kotlin
// domain/common/PagedResponse.kt
package com.example.tradingnotebe.domain.common

data class PagedResponse<T>(
    val total: Long,
    val page: Int,
    val pageSize: Int,
    val items: List<T>
)
```

**Step 2: JournalController의 Map 반환을 PagedResponse로 변경**

`getJournals()`, `getClosedPositions()` 메서드에서:
```kotlin
// Before
ResponseEntity.ok(mapOf("total" to ..., "page" to ..., "pageSize" to ..., "journals" to ...))

// After
ResponseEntity.ok(PagedResponse(total = ..., page = ..., pageSize = ..., items = ...))
```

주의: 프론트엔드에서 `journals` 키를 사용하므로, `@JsonProperty` 또는 직접 필드명을 `items`로 통일하되 FE도 함께 변경해야 함.

**대안 (호환성 유지):** 기존 `journals` 키를 유지하려면 JournalPagedResponse를 별도로 만들거나, PagedResponse의 items 필드에 `@JsonProperty("journals")` 추가. 그러나 범용 PagedResponse를 위해 FE도 `items`로 통일하는 것이 좋음.

**Step 3: FE 응답 파싱 업데이트**

`trading-note-fe/lib/api/journal.ts`의 `getJournals()` 반환값에서 `.journals` -> `.items` 변경.
`trading-note-fe/hooks/useJournals.ts`에서도 동일 적용.

**Step 4: CsvImportController 동일 패턴 적용**

`importCsv()` 메서드의 Map 반환을 구조화된 응답으로 변경.

**Step 5: 빌드 확인**

Run: `cd trading-note-be && ./mvnw clean compile -q`
Run: `cd trading-note-fe && npm run build`

**Step 6: Commit**

```bash
# BE
cd trading-note-be && git add -A && git commit -m "refactor: replace raw Map responses with typed PagedResponse"

# FE
cd trading-note-fe && git add -A && git commit -m "refactor: update API response parsing to use 'items' field"
```

---

## Task 3: FE - 분석 페이지 TanStack Query 전환

**Owner:** fe-agent

**Files:**
- Modify: `trading-note-fe/app/analytics/symbol/page.tsx`
- Modify: `trading-note-fe/app/analytics/time/page.tsx`
- Modify: `trading-note-fe/app/analytics/day/page.tsx`
- Modify: `trading-note-fe/app/analytics/rules/page.tsx`

**Problem:** 4개 분석 페이지가 수동 useState + useEffect + 루프 페이지네이션으로 데이터를 불러옴. Phase 2에서 만든 `useAllJournals()` 훅이 이미 존재.

**Step 1: symbol/page.tsx 전환**

현재 패턴:
```typescript
const [journals, setJournals] = useState([]);
const [isLoading, setIsLoading] = useState(true);
useEffect(() => { /* 수동 페이지네이션 루프 */ }, []);
```

변경:
```typescript
import { useAllJournals } from '@/hooks/useJournals';
const { data: journals = [], isLoading } = useAllJournals();
```

관련 useState, useEffect, cancelled flag 패턴 제거.

**Step 2: time/page.tsx 동일 패턴 적용**

**Step 3: day/page.tsx 동일 패턴 적용**

**Step 4: rules/page.tsx 전환**

이 페이지는 저널 + 트레이딩 규칙 두 가지를 모두 불러옴.
- 저널: `useAllJournals()` 사용
- 트레이딩 규칙: `useQuery` 직접 사용하여 `getTradingRules()` 호출

```typescript
const { data: journals = [], isLoading: isLoadingJournals } = useAllJournals();
const { data: tradingRules = [], isLoading: isLoadingRules } = useQuery({
    queryKey: ['tradingRules'],
    queryFn: getTradingRules,
});
const isLoading = isLoadingJournals || isLoadingRules;
```

**Step 5: 빌드 확인**

Run: `cd trading-note-fe && npm run build`

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: migrate analytics pages to TanStack Query"
```

---

## Task 4: FE - Chart Tooltip 타입 안전성 수정

**Owner:** fe-agent

**Files:**
- Modify: `trading-note-fe/components/dashboard/EmotionStats.tsx`
- Modify: `trading-note-fe/components/dashboard/EquityCurve.tsx`
- Modify: `trading-note-fe/components/dashboard/MonthlyPnlChart.tsx`

**Problem:** 3개 차트 컴포넌트의 `CustomTooltip`이 `any` 타입을 사용.

**Step 1: Recharts 타입 import 및 적용**

각 파일에서:
```typescript
// Before
const CustomTooltip = ({ active, payload }: any) => { ... }

// After
import { TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => { ... }
```

payload 접근 시 옵셔널 체이닝이 이미 사용되고 있으면 그대로 유지, 없으면 추가.

**Step 2: 빌드 확인**

Run: `cd trading-note-fe && npm run build`

**Step 3: Commit**

```bash
git add -A
git commit -m "fix: replace any types with proper Recharts tooltip types"
```

---

## Task 5: FE - API 클라이언트 반환 타입 수정

**Owner:** fe-agent

**Files:**
- Modify: `trading-note-fe/lib/api/journal.ts`

**Problem:** `createJournal()`, `updateJournal()` 등이 `Promise<any>`를 반환. 타입 안전성 없음.

**Step 1: 반환 타입 지정**

```typescript
// Before
export async function createJournal(data: addJournalRequest): Promise<any> { ... }
export async function updateJournal(id: number, data: addJournalRequest): Promise<any> { ... }

// After
export async function createJournal(data: addJournalRequest): Promise<Journal> { ... }
export async function updateJournal(id: number, data: addJournalRequest): Promise<Journal> { ... }
```

Journal 타입 import 확인. 다른 함수들도 반환 타입이 `any`이면 적절한 타입으로 변경.

**Step 2: 빌드 확인**

Run: `cd trading-note-fe && npm run build`

**Step 3: Commit**

```bash
git add -A
git commit -m "fix: add proper return types to journal API functions"
```

---

## Task 6: FE - TradeEntryForm 컴포넌트 분리

**Owner:** fe-agent

**Files:**
- Create: `trading-note-fe/components/journal/ChartUploadSection.tsx`
- Create: `trading-note-fe/components/journal/TradingAnalysisSection.tsx`
- Create: `trading-note-fe/components/journal/useTradeEntryForm.ts`
- Modify: `trading-note-fe/components/journal/TradeEntryForm.tsx`

**Problem:** TradeEntryForm이 1,127줄. 폼 상태, 차트 업로드, 분석 섹션, 규칙 체크, 손익 계산이 모두 한 파일.

**Step 1: useTradeEntryForm 훅 추출**

Phase 2의 useJournalForm 패턴과 동일하게:
- 모든 useState 추출
- handleChange, handleSubmit, 계산 로직 추출
- 차트 업로드 관련 상태/핸들러 추출
- 반환 타입 `UseTradeEntryFormReturn` export

**Step 2: ChartUploadSection 컴포넌트 추출**

차트 스크린샷 업로드 UI를 별도 컴포넌트로:
- 파일 선택, 미리보기, 삭제
- 드래그앤드롭 (있는 경우)
- form 훅의 chart 관련 state/handler를 props로 받음

**Step 3: TradingAnalysisSection 컴포넌트 추출**

거래 분석 관련 UI를 별도 컴포넌트로:
- 타임프레임 선택
- 주요 가격 수준 (key levels)
- 셋업 유형
- form 훅의 analysis 관련 state/handler를 props로 받음

**Step 4: TradeEntryForm 간소화**

변경 후:
- useTradeEntryForm 훅 사용
- 섹션별 컴포넌트 렌더링
- 목표: ~200-300줄

**Step 5: 빌드 확인**

Run: `cd trading-note-fe && npm run build`

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: split TradeEntryForm into composable sections"
```

---

## Execution Summary

| Task | Owner | Dependency | Estimated |
|------|-------|------------|-----------|
| 1. Seed DTO 전환 | be-agent | None | 10 min |
| 2. PagedResponse 타입화 | be-agent | None | 15 min |
| 3. Analytics TanStack Query | fe-agent | None | 15 min |
| 4. Chart Tooltip 타입 | fe-agent | None | 5 min |
| 5. API 반환 타입 | fe-agent | None | 5 min |
| 6. TradeEntryForm 분리 | fe-agent | None | 30 min |

**Parallelization:**
- be-agent: Task 1 + 2 (순차)
- fe-agent: Task 3 + 4 + 5 + 6 (순차, 4-5는 빠름)
- be-agent와 fe-agent는 완전 독립, 동시 실행
- 단, Task 2는 FE 변경도 포함하므로 be-agent가 BE/FE 모두 처리

**Total estimated: ~35 min** (병렬 실행 시)
