# Trading Rules Checklist Feature Design

## Overview
매매일지 작성 시 사용자가 정의한 매매 원칙 준수 여부를 체크하는 기능.
사용자는 설정 페이지에서 원칙을 관리하고, 일지 작성 시 체크리스트로 확인한다.

## Approach
방식 A: 기존 백엔드(TradingRule 엔티티/API, checkedRuleIds 필드) 활용 + 프론트엔드 UI 추가

## Requirements
- 체크 시점: 매매일지 작성 시
- 원칙 관리: 별도 설정 페이지 (/settings)
- 체크 필수 여부: 선택적 (체크 안 해도 저장 가능)
- 통계: 이번 스코프에서는 제외, 추후 추가

## Design

### 1. Settings Page (`/settings`)
- 새 페이지: `app/settings/page.tsx`
- Header에 "설정" 네비게이션 링크 추가
- 매매 원칙 관리 섹션:
  - 원칙 목록 (카드/리스트)
  - 각 원칙: 텍스트 + 활성/비활성 토글 + 수정/삭제
  - 순서 변경 (화살표 버튼)
  - "원칙 추가" 버튼
  - 원칙 없을 때 기본 원칙 시드 버튼

### 2. Journal Form - Rules Check Section
- JournalRegisterModal 내부에 원칙 체크 섹션 추가
- Quick mode: 감정 선택 아래 배치
- Detailed mode: Step 4(수익) 또는 별도 Step
- 활성화된 원칙(isActive=true)만 체크박스로 표시
- 체크한 원칙 ID를 comma-separated string으로 저장
- 원칙 미설정 시 안내 메시지 + 설정 페이지 링크

### 3. Frontend API Client
- 새 파일: `lib/api/tradingRule.ts`
- getTradingRules, createTradingRule, updateTradingRule, deleteTradingRule, seedDefaultRules
- 새 타입: `type/domain/tradingRule.ts`

### 4. Backend Changes
- 없음 (이미 TradingRule CRUD API, checkedRuleIds 필드 존재)

### 5. Journal Detail View
- JournalDetailModal에서 체크한 원칙 표시
- 체크 원칙 / 전체 원칙 비율 표시

## Existing Backend Infrastructure
- Entity: TradingRule (id, label, displayOrder, isActive, user)
- API: GET/POST/PUT/DELETE /api/trading-rules, POST /api/trading-rules/seed-defaults
- Journal.checkedRuleIds: String? (comma-separated IDs)
- AddJournalRequest.checkedRuleIds: String? (already exists)
