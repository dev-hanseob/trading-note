# Phase 1: Stability & Error Handling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Backend/Frontend 안정성 확보 - 에러 처리 체계화, 버그 수정, DB 인덱스 추가, 유틸리티 통합

**Architecture:** Backend에 GlobalExceptionHandler + 커스텀 도메인 예외 계층 도입. Frontend에 Next.js error boundary + 중복 유틸리티 통합. Security 설정 정상화.

**Tech Stack:** Spring Boot 3.4.4 (Kotlin), Next.js 15 (TypeScript), PostgreSQL

**Team Structure:**
- `be-agent`: Backend 작업 (Task 1-4)
- `fe-agent`: Frontend 작업 (Task 5-6)
- 두 에이전트는 독립적으로 병렬 실행 가능

---

## Task 1: Backend - Custom Domain Exception 계층 생성

**Owner:** be-agent

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exception/DomainException.kt`
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exception/GlobalExceptionHandler.kt`

**Step 1: 도메인 예외 클래스 생성**

```kotlin
// domain/exception/DomainException.kt
package com.example.tradingnotebe.domain.exception

import org.springframework.http.HttpStatus

sealed class DomainException(
    val status: HttpStatus,
    override val message: String
) : RuntimeException(message)

// 404
class ResourceNotFoundException(resource: String, id: Any) :
    DomainException(HttpStatus.NOT_FOUND, "$resource not found with id: $id")

class JournalNotFoundException(id: Long) :
    DomainException(HttpStatus.NOT_FOUND, "Journal not found with id: $id")

class SeedNotFoundException(id: Long) :
    DomainException(HttpStatus.NOT_FOUND, "Seed not found with id: $id")

class TradingRuleNotFoundException(id: Long) :
    DomainException(HttpStatus.NOT_FOUND, "Trading rule not found with id: $id")

class SubscriptionNotFoundException(userId: Any) :
    DomainException(HttpStatus.NOT_FOUND, "Subscription not found for user: $userId")

// 400
class InvalidTradeOperationException(reason: String) :
    DomainException(HttpStatus.BAD_REQUEST, reason)

class PositionAlreadyClosedException(id: Long) :
    DomainException(HttpStatus.BAD_REQUEST, "Position $id is already closed")

class InvalidPasswordException :
    DomainException(HttpStatus.BAD_REQUEST, "Current password is incorrect")

// 401
class AuthenticationFailedException(reason: String = "Invalid email or password") :
    DomainException(HttpStatus.UNAUTHORIZED, reason)

class UnauthorizedAccessException(reason: String = "Authentication required") :
    DomainException(HttpStatus.UNAUTHORIZED, reason)

// 409
class DuplicateEmailException(email: String) :
    DomainException(HttpStatus.CONFLICT, "Email already exists: $email")
```

**Step 2: GlobalExceptionHandler 생성**

```kotlin
// domain/exception/GlobalExceptionHandler.kt
package com.example.tradingnotebe.domain.exception

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.LocalDateTime

@RestControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(javaClass)

    data class ErrorResponse(
        val status: Int,
        val error: String,
        val message: String,
        val timestamp: LocalDateTime = LocalDateTime.now()
    )

    @ExceptionHandler(DomainException::class)
    fun handleDomainException(e: DomainException): ResponseEntity<ErrorResponse> {
        log.warn("Domain exception: {}", e.message)
        return ResponseEntity
            .status(e.status)
            .body(ErrorResponse(
                status = e.status.value(),
                error = e.status.reasonPhrase,
                message = e.message
            ))
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(e: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        log.warn("Bad request: {}", e.message)
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(
                status = 400,
                error = "Bad Request",
                message = e.message ?: "Invalid request"
            ))
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(e: Exception): ResponseEntity<ErrorResponse> {
        log.error("Unexpected error", e)
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse(
                status = 500,
                error = "Internal Server Error",
                message = "An unexpected error occurred"
            ))
    }
}
```

**Step 3: 빌드 확인**

Run: `cd trading-note-be && ./mvnw clean compile -q`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add src/main/kotlin/com/example/tradingnotebe/domain/exception/
git commit -m "feat: add domain exception hierarchy and global handler"
```

---

## Task 2: Backend - Service/Controller에 커스텀 예외 적용

**Owner:** be-agent
**Depends on:** Task 1

**Files:**
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/service/JournalService.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/controller/JournalController.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/seed/service/SeedService.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/seed/controller/SeedController.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/auth/controller/AuthController.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/subscription/controller/SubscriptionController.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/controller/TradingRuleController.kt`

**Step 1: JournalService - IllegalArgumentException을 커스텀 예외로 교체**

현재 패턴:
```kotlin
throw IllegalArgumentException("Journal not found with id: $id")
throw IllegalStateException("Only OPEN positions can be closed")
```

변경:
```kotlin
import com.example.tradingnotebe.domain.exception.*

// findById에서 not found → JournalNotFoundException
throw JournalNotFoundException(id)

// closePosition에서 status 체크 → PositionAlreadyClosedException
throw PositionAlreadyClosedException(id)
```

**Step 2: SeedService - findByUser 버그 수정 + 예외 적용**

현재 버그 (`SeedService.kt` line 23-26):
```kotlin
fun findByUser(user: User): List<Seed> {
    return seedRepository.findAll()  // BUG: Returns ALL seeds
}
```

수정:
```kotlin
fun findByUser(user: User): List<Seed> {
    return seedRepository.findByUserId(user.id ?: throw UnauthorizedAccessException("User ID is required"))
}
```

Not found 케이스:
```kotlin
fun findById(id: Long, user: User): Seed {
    return seedRepository.findByIdAndUserId(id, user.id ?: 0)
        ?: throw SeedNotFoundException(id)
}
```

**Step 3: AuthController - try-catch 제거, 예외에 위임**

현재 패턴 (AuthController line 36-43):
```kotlin
@PostMapping("/signup")
fun signup(@RequestBody request: SignupRequest): ResponseEntity<Any> {
    return try {
        val response = authService.signup(request)
        ResponseEntity.ok(response)
    } catch (e: RuntimeException) {
        ResponseEntity.status(HttpStatus.CONFLICT).body(mapOf("error" to e.message))
    }
}
```

변경 - GlobalExceptionHandler에 위임:
```kotlin
@PostMapping("/signup")
fun signup(@RequestBody request: SignupRequest): ResponseEntity<Any> {
    val response = authService.signup(request)
    return ResponseEntity.ok(response)
}
```

AuthService에서 `throw DuplicateEmailException(email)`, `throw AuthenticationFailedException()` 등 사용.

**Step 4: SeedController - ternary 패턴 제거**

현재 패턴 (SeedController line 50-54):
```kotlin
@GetMapping("/{id}")
fun getSeed(@PathVariable id: Long, @AuthenticationPrincipal user: User): ResponseEntity<Any> {
    val seed = seedService.findById(id, user)
    return if (seed != null) ResponseEntity.ok(seed) else ResponseEntity.notFound().build()
}
```

변경 - Service에서 예외 throw:
```kotlin
@GetMapping("/{id}")
fun getSeed(@PathVariable id: Long, @AuthenticationPrincipal user: User): ResponseEntity<Seed> {
    return ResponseEntity.ok(seedService.findById(id, user))
}
```

**Step 5: SubscriptionController - try-catch 제거**

동일 패턴: try-catch 제거, Service에서 커스텀 예외 throw.

**Step 6: TradingRuleController - 동일 적용**

**Step 7: 빌드 확인**

Run: `cd trading-note-be && ./mvnw clean compile -q`
Expected: BUILD SUCCESS

**Step 8: Commit**

```bash
git add -A
git commit -m "refactor: replace generic exceptions with domain exceptions across all controllers"
```

---

## Task 3: Backend - DB 인덱스 추가

**Owner:** be-agent
**Independent of:** Task 1, 2

**Files:**
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/entity/Journal.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/seed/entity/SeedEntity.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/entity/TradingRule.kt`
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/subscription/entity/SubscriptionEntity.kt`

**Step 1: Journal 엔티티에 @Table 인덱스 추가**

```kotlin
@Entity
@Table(
    name = "journal",
    indexes = [
        Index(name = "idx_journal_user_id", columnList = "user_id"),
        Index(name = "idx_journal_traded_at", columnList = "traded_at"),
        Index(name = "idx_journal_trade_status", columnList = "trade_status"),
        Index(name = "idx_journal_symbol", columnList = "symbol"),
        Index(name = "idx_journal_user_traded_at", columnList = "user_id, traded_at")
    ]
)
class Journal(...)
```

**Step 2: SeedEntity에 인덱스 추가**

```kotlin
@Entity(name = "seed")
@Table(
    indexes = [
        Index(name = "idx_seed_user_id", columnList = "user_id")
    ]
)
class SeedEntity(...)
```

**Step 3: TradingRule에 인덱스 추가**

```kotlin
@Entity
@Table(
    name = "trading_rule",
    indexes = [
        Index(name = "idx_trading_rule_user_id", columnList = "user_id")
    ]
)
class TradingRule(...)
```

**Step 4: SubscriptionEntity에 인덱스 추가**

```kotlin
@Entity
@Table(
    name = "subscription",
    indexes = [
        Index(name = "idx_subscription_user_id", columnList = "user_id"),
        Index(name = "idx_subscription_status", columnList = "status")
    ]
)
class SubscriptionEntity(...)
```

**Step 5: 빌드 확인**

Run: `cd trading-note-be && ./mvnw clean compile -q`
Expected: BUILD SUCCESS

**Step 6: 서버 시작하여 인덱스 생성 확인** (ddl-auto: update가 자동 생성)

Run: `cd trading-note-be && ./mvnw spring-boot:run` (잠시 실행 후 로그 확인)
Expected: Hibernate 로그에 CREATE INDEX 문 출력

**Step 7: Commit**

```bash
git add -A
git commit -m "perf: add database indexes for frequently queried columns"
```

---

## Task 4: Backend - Security 설정 정상화

**Owner:** be-agent
**Independent of:** Task 1, 2, 3

**Files:**
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/config/SecurityConfig.kt`

**Step 1: permitAll() → authenticated()로 변경**

현재 (`SecurityConfig.kt` line 41):
```kotlin
.anyRequest().permitAll()
```

변경:
```kotlin
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers("/api/public/**").permitAll()
.requestMatchers("/oauth2/**").permitAll()
.requestMatchers("/api/subscription/webhook/**").permitAll()
.anyRequest().authenticated()
```

**Step 2: 빌드 확인**

Run: `cd trading-note-be && ./mvnw clean compile -q`
Expected: BUILD SUCCESS

**Step 3: Commit**

```bash
git add src/main/kotlin/com/example/tradingnotebe/config/SecurityConfig.kt
git commit -m "fix: enforce authentication on all non-public endpoints"
```

---

## Task 5: Frontend - Error Boundary 추가

**Owner:** fe-agent

**Files:**
- Create: `trading-note-fe/app/error.tsx`
- Create: `trading-note-fe/app/dashboard/error.tsx`
- Create: `trading-note-fe/app/journal/error.tsx`

**Step 1: 글로벌 error.tsx 생성**

```tsx
// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="btn-primary px-6 py-2.5"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Dashboard error.tsx 생성**

```tsx
// app/dashboard/error.tsx
'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Failed to load dashboard
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          Could not load dashboard data. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary px-6 py-2.5">
            Try Again
          </button>
          <a href="/" className="btn-secondary px-6 py-2.5">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Journal error.tsx 생성**

```tsx
// app/journal/error.tsx
'use client';

import { useEffect } from 'react';

export default function JournalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Journal error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Failed to load journal
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          Could not load trade journal data. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary px-6 py-2.5">
            Try Again
          </button>
          <a href="/dashboard" className="btn-secondary px-6 py-2.5">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: 빌드 확인**

Run: `cd trading-note-fe && npm run build`
Expected: Build success

**Step 5: Commit**

```bash
git add app/error.tsx app/dashboard/error.tsx app/journal/error.tsx
git commit -m "feat: add error boundaries for graceful error handling"
```

---

## Task 6: Frontend - 유틸리티 함수 통합

**Owner:** fe-agent
**Independent of:** Task 5

**Files:**
- Create: `trading-note-fe/lib/utils/format.ts`
- Modify: `trading-note-fe/components/JournalRegisterModal.tsx` (line 70-85: remove local formatNumber/parseNumber)
- Modify: `trading-note-fe/components/SeedSettingModal.tsx` (line 30-35: remove local formatNumber)
- Modify: `trading-note-fe/components/CsvImportModal.tsx` (line 99-102: remove local formatNumber)
- Modify: `trading-note-fe/app/journal/page.tsx` (line 24-34: remove local formatTradeDate)

**Step 1: 통합 유틸리티 파일 생성**

```typescript
// lib/utils/format.ts

/**
 * Format a number string with comma separators for input fields.
 * Handles negative numbers. Strips non-numeric characters.
 *
 * @example formatNumberInput("1234567") => "1,234,567"
 * @example formatNumberInput("-1234") => "-1,234"
 */
export function formatNumberInput(value: string | number): string {
  if (typeof value === 'number') value = value.toString();
  const numberOnly = value.replace(/[^\d-]/g, '');
  if (numberOnly === '' || numberOnly === '-') return numberOnly;
  if (numberOnly.startsWith('-')) {
    return '-' + numberOnly.substring(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return numberOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Parse a formatted number string back to a number.
 *
 * @example parseNumberInput("1,234,567") => 1234567
 * @example parseNumberInput("-1,234") => -1234
 */
export function parseNumberInput(value: string): number {
  return Number(value.replace(/,/g, '')) || 0;
}

/**
 * Format a number for display (read-only, not input fields).
 * Returns '-' for null/undefined values.
 *
 * @example formatNumberDisplay(1234567) => "1,234,567"
 * @example formatNumberDisplay(null) => "-"
 */
export function formatNumberDisplay(n: number | null | undefined): string {
  if (n === null || n === undefined) return '-';
  return n.toLocaleString('ko-KR');
}

/**
 * Format ROI percentage.
 *
 * @example formatRoi(12.345) => "12.35"
 * @example formatRoi(0) => "0.00"
 */
export function formatRoi(roi: number): string {
  return roi.toFixed(2);
}

/**
 * Format win rate percentage.
 *
 * @example formatWinRate(66.667) => "66.7"
 */
export function formatWinRate(rate: number): string {
  return rate.toFixed(1);
}

/**
 * Format large numbers with K/M suffix for chart axes.
 *
 * @example formatCompactNumber(1500000) => "2M"
 * @example formatCompactNumber(1500) => "2K"
 */
export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(0)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K`;
  return `${sign}${abs}`;
}

/**
 * Format a trade date string for display.
 *
 * @example formatTradeDate("2026-02-22T10:30:00") => "02.22"
 * @example formatTradeDate("2026-02-22") => "02.22"
 */
export function formatTradeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format a trade date string with year for full display.
 *
 * @example formatTradeDateFull("2026-02-22T10:30:00") => "2026.02.22"
 */
export function formatTradeDateFull(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch {
    return dateStr;
  }
}
```

**Step 2: JournalRegisterModal에서 로컬 함수 제거, import로 교체**

`components/JournalRegisterModal.tsx` 상단에 import 추가:
```typescript
import { formatNumberInput, parseNumberInput } from '@/lib/utils/format';
```

- line 70-80: `formatNumber` 함수 삭제 → `formatNumberInput` 사용
- line 82-85: `parseNumber` 함수 삭제 → `parseNumberInput` 사용

**Step 3: SeedSettingModal에서 로컬 함수 제거**

`components/SeedSettingModal.tsx` 상단에 import 추가:
```typescript
import { formatNumberInput } from '@/lib/utils/format';
```

- line 30-35: `formatNumber` 함수 삭제 → `formatNumberInput` 사용

**Step 4: CsvImportModal에서 로컬 함수 제거**

`components/CsvImportModal.tsx` 상단에 import 추가:
```typescript
import { formatNumberDisplay } from '@/lib/utils/format';
```

- line 99-102: `formatNumber` 함수 삭제 → `formatNumberDisplay` 사용

**Step 5: journal/page.tsx에서 로컬 formatTradeDate 제거**

`app/journal/page.tsx` 상단에 import 추가:
```typescript
import { formatTradeDate } from '@/lib/utils/format';
```

- line 24-34: `formatTradeDate` 함수 삭제

**Step 6: 빌드 확인**

Run: `cd trading-note-fe && npm run build`
Expected: Build success with no type errors

**Step 7: Commit**

```bash
git add lib/utils/format.ts components/JournalRegisterModal.tsx components/SeedSettingModal.tsx components/CsvImportModal.tsx app/journal/page.tsx
git commit -m "refactor: consolidate duplicated formatting utilities into lib/utils/format.ts"
```

---

## Execution Summary

| Task | Owner | Dependency | Estimated |
|------|-------|------------|-----------|
| 1. Domain Exception 계층 | be-agent | None | 10 min |
| 2. 예외 적용 + SeedService 버그 수정 | be-agent | Task 1 | 20 min |
| 3. DB 인덱스 추가 | be-agent | None | 10 min |
| 4. Security 설정 정상화 | be-agent | None | 5 min |
| 5. Error Boundary 추가 | fe-agent | None | 10 min |
| 6. 유틸리티 함수 통합 | fe-agent | None | 15 min |

**Parallelization:**
- be-agent: Task 1 → Task 2 (순차), Task 3 + Task 4 (Task 1과 병렬 가능)
- fe-agent: Task 5 + Task 6 (독립, 동시 실행 가능)
- be-agent와 fe-agent는 완전 독립, 동시 실행

**Total estimated: ~40 min** (병렬 실행 시)
