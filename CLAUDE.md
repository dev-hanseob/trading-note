# Trading Note - Project Context

## Project Overview
트레이딩 거래 기록 및 분석을 위한 풀스택 웹 애플리케이션. 암호화폐/주식의 매매일지를 기록하고 대시보드에서 성과를 분석.

## Monorepo Structure
```
trading-note/
├── trading-note-be/   # Spring Boot 백엔드
└── trading-note-fe/   # Next.js 프론트엔드
```

## Rules
- 에러 메시지는 영어로 작성
- 이모지 사용 금지 (코드, 로그, 문서)
- 프론트엔드-백엔드 페이징: 프론트 page=1 → 백엔드 PageRequest.of(page-1, pageSize)

---

## Backend (Spring Boot)
- **Path**: `trading-note-be/`
- **Stack**: Spring Boot 3.4.4, Java 17, PostgreSQL, Spring Modulith, Maven, Lombok
- **DB**: PostgreSQL localhost:5432, DB=trading_note, user=seob, pw=seob
- **DDL**: Hibernate auto-update

### Domains
1. **Journal** (`domain/journal/`) - 거래 기록 관리 (자산유형, 거래유형, 포지션, 투자금액, 수익, ROI 등)
2. **User** (`domain/user/`) - UUID 기반 사용자 관리
3. **Seed** (`domain/seed/`) - 시드머니 관리 (BigDecimal)

### Commands
```bash
./mvnw spring-boot:run   # Dev server (port 8080)
./mvnw clean compile     # Build
./mvnw test              # Test
```

---

## Frontend (Next.js)
- **Path**: `trading-note-fe/`
- **Stack**: Next.js 15.2.4 (App Router), React 19, TypeScript 5, Tailwind CSS 3.4.1
- **UI Libraries**: Headless UI, Framer Motion, Lucide React, Recharts, Lightweight Charts
- **Font**: Manrope (Google Fonts)
- **Theme**: next-themes ^0.4.6 (integrated, light/dark toggle in Header)

### Commands
```bash
npm run dev      # Dev server with Turbopack (port 3000)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

### Design System
- **Color scheme**: Light/Dark (next-themes, default: dark)
- **Surfaces**: slate-950 (page bg), slate-900 (cards), slate-800 (inputs/buttons)
- **Text**: white (primary), slate-300/400 (secondary), slate-500 (muted)
- **Accent**: emerald (profit/positive/primary action), red (loss/negative/danger)
- **Tailwind config**: `darkMode: 'class'`, custom `primary: '#10b981'`
- **CSS utilities**: `globals.css`에 btn-primary/secondary/danger/ghost, btn-pagination 정의

### File Structure
```
app/
├── layout.tsx                    # Root layout (Manrope font, ToastProvider, Header)
├── globals.css                   # Global styles, CSS variables, button utilities
├── page.tsx                      # Landing page (hero + mock dashboard + features + CTA)
├── dashboard/page.tsx            # Dashboard (TodaySummary + StatCards + charts + trades)
└── journal/
    ├── page.tsx                  # Journal list (table + bulk actions + ConfirmDialog)
    └── new/                      # New journal entry page

components/
├── Header.tsx                    # Sticky header with nav, mobile menu
├── Toast.tsx                     # Toast notification system (context provider)
├── ConfirmDialog.tsx             # Reusable confirm dialog (danger/warning variants)
├── ThemeToggle.tsx               # Theme toggle (EXISTS but NOT integrated)
├── JournalRegisterModal.tsx      # Journal create/edit modal (상세 입력 + 퀵 엔트리 mode)
├── JournalDetailModal.tsx        # Journal detail view modal
├── GoalDashboard.tsx             # Goal tracking dashboard
├── GoalSettingModal.tsx          # Goal setting modal
├── SeedSettingModal.tsx          # Seed money setting modal
├── dashboard/
│   ├── TodaySummary.tsx          # Today's trade summary card
│   ├── StatCards.tsx             # Key metrics cards (has dark: variants)
│   ├── CalendarHeatmap.tsx       # Calendar heatmap (has dark: variants)
│   ├── RecentTrades.tsx          # Recent trades list (has dark: variants)
│   ├── EquityCurve.tsx           # Equity curve chart (has dark: variants)
│   ├── MonthlyPnlChart.tsx       # Monthly P&L chart (has dark: variants)
│   └── DateRangeFilter.tsx       # Date range filter
└── journal/
    ├── TradeEntryForm.tsx        # Multi-step trade entry form
    └── TradeSidebar.tsx          # Trade list sidebar

lib/api/
├── client.ts                     # Axios base client
├── journal.ts                    # Journal API calls
└── seed.ts                       # Seed API calls

type/
├── domain/                       # Domain type definitions
└── dto/                          # DTO type definitions
```

### Theme Status (Completed)
- next-themes ThemeProvider 통합 완료 (layout.tsx)
- ThemeToggle 컴포넌트 next-themes 기반으로 재작성 (Header에 배치)
- 전체 21개 파일에 light/dark 변형 적용 완료
- CSS 변수: `--chart-grid` (light: #e2e8f0, dark: #334155)
- API proxy: Next.js rewrites로 `/api/*` -> `localhost:8080/api/*` (원격 접속 지원)
- 모달 애니메이션 최적화: 300ms -> 150ms, backdrop-blur 제거

### Key Patterns
- 모달은 portal 렌더링 (`#modal-root`)
- ToastProvider가 layout.tsx에서 앱 전체 감싸고 있음
- JournalRegisterModal은 `editTarget` prop으로 생성/수정 분기 (`null` = 새 거래)
- 퀵 엔트리 모드: `isQuickMode` state, 새 거래 시 기본 활성화
- ConfirmDialog: 삭제 확인에 사용 (batch + single delete)
- 금액 표시: `tabular-nums` class로 고정폭 숫자

---

## GitHub
- **Repository**: `dev-hanseob/trading-note` (monorepo)
- **Auth**: Personal Access Token (HTTPS)
- **Branch**: main
