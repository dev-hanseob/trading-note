# TradeVault UX/UI 개선 연구 보고서

> 작성일: 2026-02-15
> 대상: TradeVault 매매일지 앱 (Korean retail traders)
> 기술 스택: Next.js 16, React 19, Tailwind CSS, Recharts, Framer Motion
> 디자인 시스템: Emerald(#10b981) primary, Manrope font, white/slate backgrounds

---

## 목차

1. [대시보드 (Dashboard)](#1-대시보드-dashboard)
2. [매매일지 등록 폼 (Journal Entry Form)](#2-매매일지-등록-폼-journal-entry-form)
3. [매매일지 목록/히스토리 (Journal History/List)](#3-매매일지-목록히스토리-journal-historylist)
4. [상세 뷰 (Detail View)](#4-상세-뷰-detail-view)
5. [글로벌 디자인 시스템 개선](#5-글로벌-디자인-시스템-개선)
6. [구현 로드맵](#6-구현-로드맵)

---

## 연구 기반

### 참고한 경쟁 앱
- **TraderSync**: 40+ 커스터마이즈 가능한 대시보드 위젯, AI 기반 분석, 캘린더 히트맵
- **Tradervue**: 자동 차트 생성, 커뮤니티 기능, 깔끔한 인터페이스
- **Edgewonk**: 심리/감정 추적, 규칙 기반 체크리스트, 상세 통계
- **TradesViz**: 캘린더 탭, 다양한 필터 옵션, 무료 기능 풍부
- **TradeZella**: 모던 UI, 패턴 인식, 리플레이 기능

### 핵심 UX 원칙 (금융 앱)
1. **역삼각형 원칙**: 가장 중요한 정보를 먼저, 세부사항은 후에
2. **Progressive Disclosure**: 복잡한 데이터를 레이어로 분리
3. **최소 클릭 원칙**: 거래 로깅 시 클릭/탭 최소화
4. **실시간 피드백**: 모든 인터랙션에 즉각적 시각 피드백
5. **여백과 타이포그래피**: 넉넉한 여백, 명확한 서체 위계로 안정감 제공

---

## 1. 대시보드 (Dashboard)

### 1.1 현재 문제점 (Current Issues)

**파일**: `/app/dashboard/page.tsx`, `/components/dashboard/StatCards.tsx`, `/components/dashboard/EquityCurve.tsx`, `/components/dashboard/MonthlyPnlChart.tsx`, `/components/dashboard/RecentTrades.tsx`, `/components/GoalDashboard.tsx`

| 문제 | 상세 | 심각도 |
|------|------|--------|
| **데이터 로딩 비효율** | `getJournals({ page: 1, pageSize: 1000 })`로 전체 데이터를 한 번에 불러옴. 데이터가 커지면 성능 저하 | 높음 |
| **기간 필터 부재** | 대시보드 전체에 날짜 범위 필터가 없음. 이번 주/이번 달/사용자 지정 기간 선택 불가 | 높음 |
| **연승/연패 표시 없음** | 트레이더에게 중요한 심리적 지표인 연승(streak) 정보가 전혀 없음 | 중간 |
| **캘린더 히트맵 부재** | TraderSync, TradesViz 등 경쟁 앱의 핵심 기능. 일별 수익/손실을 직관적으로 파악 불가 | 중간 |
| **StatCards 정보 부족** | 5개 카드에 총 잔고, 누적 손익, 수익률, 승률, 거래수만 표시. 평균 손익, 최대 낙폭(MDD), 손익비(Profit Factor) 등 핵심 지표 누락 | 중간 |
| **GoalDashboard 비효율적 레이아웃** | 목표가 없을 때 큰 빈 공간만 차지. 목표 카드가 grid cols-2인데 대시보드 하단에서 lg:grid-cols-2 안에 다시 grid로 들어가 레이아웃 깨짐 | 중간 |
| **RecentTrades의 onSelect가 빈 함수** | `onSelect={() => {}}` - 최근 거래 클릭 시 아무 동작 없음 | 중간 |
| **차트 인터랙션 제한** | EquityCurve에 기간 필터만 있고, MonthlyPnlChart에는 인터랙션이 없음 | 낮음 |
| **다크모드 불완전** | 일부 컴포넌트에만 dark: 클래스 적용. 전체 통일성 부족 | 낮음 |

### 1.2 개선 방향 (Improvement Direction)

TraderSync 스타일의 **위젯 기반 대시보드**로 전환하되, 고정 레이아웃으로 구현 복잡도를 관리한다.

핵심 방향:
1. **글로벌 날짜 필터** 추가 (오늘/이번 주/이번 달/3개월/6개월/1년/전체/사용자 지정)
2. **캘린더 히트맵** 추가 (일별 P&L을 색상 강도로 시각화)
3. **확장된 통계 카드** (2행 구조: 핵심 3개 + 보조 지표)
4. **연승/연패 스트릭 위젯** 추가
5. **일별 P&L 바차트** 추가 (MonthlyPnlChart 옆에)
6. RecentTrades를 클릭 가능한 상태로 개선

### 1.3 구체적 UI 구성안 (Specific UI Composition)

#### 전체 레이아웃 와이어프레임

```
+------------------------------------------------------------------+
|  대시보드                              [기간필터 드롭다운] [시드|목표]  |
+------------------------------------------------------------------+
|                                                                    |
|  +--[핵심 카드 3개]----------------------------------------------+  |
|  | [총 잔고]          [누적 손익]        [총 수익률]               |  |
|  | 12,500,000원       +2,500,000원       +25.00%                 |  |
|  | ▲ 시드 10,000,000   ▲ vs 지난달 +15%   ▲ vs 지난달 +3.2%p     |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--[보조 지표 4개]----------------------------------------------+  |
|  | [승률]    [손익비]     [평균 손익]    [연승 스트릭]              |  |
|  | 65.0%    1:2.3        +125,000원     🔥 4연승                  |  |
|  | 26W/14L   Profit Fac.  Avg P&L      Current Streak            |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--[자산 추이 차트]---+ +--[캘린더 히트맵]--------------------+   |
|  | 📈 Equity Curve     | | 📅 Trading Calendar                |   |
|  | [1W][1M][3M][ALL]   | | [< 2026년 2월 >]                  |   |
|  |                     | |  월 화 수 목 금 토 일              |   |
|  |   ___/\___/‾‾‾      | |  ■  ■  □  ■  ■  ·  ·             |   |
|  |  /                  | |  ■  □  ■  □  ■  ·  ·             |   |
|  | /                   | |  ■  ■  ■  ■  □  ·  ·             |   |
|  |/                    | |  ■  □  ·  ·  ·  ·  ·             |   |
|  +---------------------+ | ■=이익 □=손실 ·=미거래             |   |
|                          +------------------------------------+   |
|                                                                    |
|  +--[월별 손익]-------------+ +--[최근 거래]-----------------+     |
|  | 📊 Monthly P&L          | | 🕐 Recent Trades            |     |
|  |   ██                    | | BTC/USDT  L  02.14  +125K   |     |
|  |   ██  ▓▓               | | ETH/USDT  S  02.13  -50K    |     |
|  |   ██  ▓▓  ░░           | | SOL/USDT  L  02.12  +200K   |     |
|  |   ██  ▓▓  ░░  ██       | | BTC/USDT  S  02.11  +80K    |     |
|  +-------------------------+ | ETH/USDT  L  02.10  -30K    |     |
|                              | [전체 보기 →]               |     |
|                              +------------------------------+     |
|                                                                    |
|  +--[목표 진행률]------------------------------------------------+  |
|  | 🎯 이번 달 목표        🚀 올해 목표                          |  |
|  | ████████░░ 72.5%       ████░░░░░░ 35.2%                     |  |
|  | 목표: 1,000,000원      목표: 15,000,000원                    |  |
|  +--------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

#### 컴포넌트 구조

```
DashboardPage
├── DashboardHeader
│   ├── Title ("대시보드")
│   ├── DateRangeFilter (새 컴포넌트)
│   │   └── Preset buttons + Custom DatePicker
│   └── ActionButtons (시드설정, 목표설정)
├── PrimaryStatCards (새 컴포넌트, 기존 StatCards 대체)
│   ├── BalanceCard (총 잔고 + 시드 정보 + 전기간 대비)
│   ├── PnlCard (누적 손익 + 전기간 대비 변화)
│   └── RoiCard (총 수익률 + 전기간 대비 변화)
├── SecondaryStatCards (새 컴포넌트)
│   ├── WinRateCard (승률 + W/L 비율 + 미니 도넛)
│   ├── ProfitFactorCard (손익비)
│   ├── AvgPnlCard (평균 손익)
│   └── StreakCard (현재 연승/연패 + 최대 연승)
├── ChartsRow
│   ├── EquityCurve (개선)
│   └── CalendarHeatmap (새 컴포넌트)
├── BottomRow
│   ├── MonthlyPnlChart (개선)
│   └── RecentTrades (개선 - 클릭 동작 추가)
└── GoalDashboard (개선 - 인라인 + 콤팩트)
```

#### DateRangeFilter 컴포넌트 상세

```tsx
// 위치: components/dashboard/DateRangeFilter.tsx
// 프리셋 버튼 + 커스텀 날짜 범위

<div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
  {['오늘', '이번 주', '이번 달', '3개월', '6개월', '1년', '전체'].map(preset => (
    <button
      key={preset}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
        isActive
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {preset}
    </button>
  ))}
</div>
```

#### PrimaryStatCards 상세

```tsx
// 핵심 3개 카드: 더 크고 눈에 띄게
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  {/* 각 카드 구조 */}
  <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        총 잔고
      </span>
      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
        <Landmark size={16} className="text-emerald-600" />
      </div>
    </div>
    <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
      12,500,000원
    </div>
    <div className="flex items-center gap-1.5 text-xs">
      <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
        <ArrowUpRight size={12} />
        +15.2%
      </span>
      <span className="text-slate-400">vs 지난달</span>
    </div>
  </div>
</div>
```

#### SecondaryStatCards 상세

```tsx
// 보조 4개 카드: 컴팩트하게
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  {/* 승률 카드 - 미니 도넛 차트 포함 */}
  <div className="bg-white rounded-xl border border-slate-100 p-4">
    <div className="flex items-center justify-between">
      <div>
        <span className="text-xs text-slate-400 font-medium">승률</span>
        <div className="text-xl font-bold text-slate-900 mt-0.5">65.0%</div>
        <span className="text-xs text-slate-400">26W / 14L</span>
      </div>
      {/* 오른쪽에 미니 도넛 차트 (SVG 또는 Recharts PieChart) */}
      <div className="w-12 h-12">
        <MiniDonutChart winRate={65.0} />
      </div>
    </div>
  </div>

  {/* 손익비 카드 */}
  <div className="bg-white rounded-xl border border-slate-100 p-4">
    <span className="text-xs text-slate-400 font-medium">손익비</span>
    <div className="text-xl font-bold text-slate-900 mt-0.5">1:2.3</div>
    <span className="text-xs text-slate-400">Profit Factor</span>
  </div>

  {/* 평균 손익 카드 */}
  <div className="bg-white rounded-xl border border-slate-100 p-4">
    <span className="text-xs text-slate-400 font-medium">평균 손익</span>
    <div className="text-xl font-bold text-emerald-600 mt-0.5">+125,000원</div>
    <span className="text-xs text-slate-400">Per Trade</span>
  </div>

  {/* 연승 스트릭 카드 */}
  <div className="bg-white rounded-xl border border-slate-100 p-4">
    <span className="text-xs text-slate-400 font-medium">현재 스트릭</span>
    <div className="flex items-center gap-1.5 mt-0.5">
      <Flame size={18} className="text-orange-500" />
      <span className="text-xl font-bold text-slate-900">4연승</span>
    </div>
    <span className="text-xs text-slate-400">최대: 8연승</span>
  </div>
</div>
```

#### CalendarHeatmap 컴포넌트 상세

```tsx
// 위치: components/dashboard/CalendarHeatmap.tsx
// GitHub 기여 그래프 스타일의 캘린더 히트맵

interface CalendarHeatmapProps {
  journals: Journal[];
}

// 레이아웃
<div className="bg-white rounded-2xl border border-slate-100 p-6">
  {/* 헤더 */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <CalendarDays className="w-5 h-5 text-emerald-500" />
      <h3 className="text-lg font-semibold text-slate-900">Trading Calendar</h3>
    </div>
    <div className="flex items-center gap-2">
      <button className="p-1 hover:bg-slate-100 rounded">
        <ChevronLeft size={16} className="text-slate-400" />
      </button>
      <span className="text-sm font-medium text-slate-700">2026년 2월</span>
      <button className="p-1 hover:bg-slate-100 rounded">
        <ChevronRight size={16} className="text-slate-400" />
      </button>
    </div>
  </div>

  {/* 요일 헤더 */}
  <div className="grid grid-cols-7 gap-1 mb-1">
    {['월', '화', '수', '목', '금', '토', '일'].map(day => (
      <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
        {day}
      </div>
    ))}
  </div>

  {/* 날짜 그리드 */}
  <div className="grid grid-cols-7 gap-1">
    {daysInMonth.map(day => {
      const pnl = getDailyPnl(day);
      const intensity = getIntensity(pnl); // 0~4 단계
      return (
        <div
          key={day.toISOString()}
          className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium cursor-pointer
            transition-all hover:ring-2 hover:ring-emerald-300
            ${pnl === null
              ? 'bg-slate-50 text-slate-300'              // 미거래일
              : pnl > 0
                ? intensity === 4 ? 'bg-emerald-500 text-white'
                : intensity === 3 ? 'bg-emerald-400 text-white'
                : intensity === 2 ? 'bg-emerald-300 text-emerald-900'
                : 'bg-emerald-100 text-emerald-700'
              : pnl < 0
                ? intensity === 4 ? 'bg-red-500 text-white'
                : intensity === 3 ? 'bg-red-400 text-white'
                : intensity === 2 ? 'bg-red-300 text-red-900'
                : 'bg-red-100 text-red-700'
              : 'bg-slate-100 text-slate-500'              // 손익 0
            }
          `}
        >
          {day.getDate()}
        </div>
      );
    })}
  </div>

  {/* 범례 */}
  <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-slate-400">
    <span>손실</span>
    <div className="w-3 h-3 rounded-sm bg-red-400" />
    <div className="w-3 h-3 rounded-sm bg-red-200" />
    <div className="w-3 h-3 rounded-sm bg-slate-100" />
    <div className="w-3 h-3 rounded-sm bg-emerald-200" />
    <div className="w-3 h-3 rounded-sm bg-emerald-400" />
    <span>이익</span>
  </div>
</div>
```

**인터랙션 패턴:**
- 날짜 hover: 해당 날짜의 거래 건수, 총 P&L 툴팁 표시
- 날짜 click: 해당 날짜의 거래 목록을 모달 또는 슬라이드 패널로 표시
- 월 탐색: 좌우 화살표로 월 이동
- 모바일: 가로 스크롤 가능한 주간 뷰로 전환

#### EquityCurve 개선사항

```
현재: 기간 필터만 있음
개선:
1. 차트 위에 현재 자산 요약 숫자 표시
2. 시작 시드 라인에 더 명확한 레이블
3. 드래그로 특정 구간 확대(줌) 기능
4. 최고점/최저점 마커 표시
5. MDD(Maximum Drawdown) 영역 시각화 (옅은 빨간 영역)
```

#### RecentTrades 개선사항

```tsx
// onSelect를 실제 동작하도록 연결
// 클릭 시 JournalDetailModal 열기
// "전체 보기" 링크 추가

<RecentTrades
  journals={tableData}
  onSelect={(journal) => {
    setDetailTarget(journal);
    setShowDetailModal(true);
  }}
/>

// 컴포넌트 하단에 추가:
<Link
  href="/journal"
  className="flex items-center justify-center gap-1 py-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 border-t border-slate-100 transition-colors"
>
  전체 거래 보기
  <ArrowRight size={14} />
</Link>
```

#### 모바일 반응형 동작

```
Desktop (lg+): 위 와이어프레임 그대로
Tablet (md): 차트 2열 유지, 카드 2열
Mobile (sm-):
  - PrimaryStatCards: 1열 (가로 스크롤 가능한 카드 또는 스택)
  - SecondaryStatCards: 2열 (2x2)
  - 차트: 1열 (세로 스택)
  - CalendarHeatmap: 주간 뷰로 전환
  - GoalDashboard: 1열 스택
```

### 1.4 구현 우선순위 (Implementation Priority)

| 순위 | 항목 | 난이도 | 영향도 |
|------|------|--------|--------|
| P0 | RecentTrades 클릭 동작 연결 | 낮음 | 중간 |
| P0 | DateRangeFilter 추가 | 중간 | 높음 |
| P1 | PrimaryStatCards + SecondaryStatCards 분리 | 중간 | 높음 |
| P1 | CalendarHeatmap 추가 | 높음 | 높음 |
| P1 | 연승/연패 스트릭 계산 및 표시 | 낮음 | 중간 |
| P2 | 손익비(Profit Factor) 계산 추가 | 낮음 | 중간 |
| P2 | vs 전기간 비교 데이터 | 중간 | 중간 |
| P3 | EquityCurve MDD 시각화 | 높음 | 낮음 |
| P3 | GoalDashboard 콤팩트화 | 낮음 | 낮음 |

---

## 2. 매매일지 등록 폼 (Journal Entry Form)

### 2.1 현재 문제점 (Current Issues)

**파일**: `/app/journal/new/page.tsx`, `/components/journal/TradeEntryForm.tsx`, `/components/JournalRegisterModal.tsx`

| 문제 | 상세 | 심각도 |
|------|------|--------|
| **이중 등록 경로 혼란** | TradeEntryForm(영어, /journal/new)과 JournalRegisterModal(한국어, 모달) 두 가지 등록 방식이 공존. UI 언어도 다르고 필드도 다름 | 높음 |
| **TradeEntryForm이 사실상 미완성** | 차트 업로드 미구현(UI만 존재), AssetType이 CRYPTO로 하드코딩, 전체 UI가 영어 | 높음 |
| **JournalRegisterModal 위저드가 느림** | 5단계 위저드(자산선택 > 기본정보 > 거래상세 > 손익 > 검토)는 클릭이 너무 많음. 단일 트레이드 입력에 최소 8~12클릭 필요 | 높음 |
| **감정/심리 추적 없음** | Edgewonk 대비 핵심 차별점인 감정 추적(FOMO, 자신감, 공포 등) 기능이 전혀 없음 | 중간 |
| **전략/패턴 태그 없음** | 거래 전략(브레이크아웃, 지지/저항, 추세추종 등)을 태그로 분류할 수 없음 | 중간 |
| **차트 스크린샷 업로드 미구현** | TradeEntryForm에 드래그&드롭 UI만 있고 실제 업로드 로직 없음. JournalRegisterModal에는 아예 없음 | 중간 |
| **실시간 P&L 계산 부족** | TradeEntryForm은 maxLoss와 R:R만 계산. 진입/청산 가격에서 자동 P&L 계산 없음 | 중간 |
| **모바일에서 사이드바 숨김** | TradeSidebar가 `hidden lg:block`으로 모바일에서 완전히 숨겨짐 | 낮음 |
| **저장/임시저장 미구현** | "Save Draft" 버튼이 있지만 동작하지 않음 | 낮음 |

### 2.2 개선 방향 (Improvement Direction)

**단일 등록 경험으로 통합**: JournalRegisterModal의 위저드를 폐기하고, `/journal/new` 페이지의 TradeEntryForm을 **단일 페이지 폼**으로 통합 재설계한다.

핵심 방향:
1. **단일 스크롤 페이지 폼**: 위저드 대신 섹션 카드로 구분된 단일 페이지
2. **스마트 기본값**: 마지막 거래의 자산 유형, 화폐, 거래 유형을 기억
3. **실시간 계산 패널**: 우측(또는 하단) 고정 패널에 실시간 P&L, R:R 표시
4. **감정 태그 추가**: 거래 전/후 감정 선택 (1-5 스케일 또는 이모지 선택)
5. **전략 태그 시스템**: 미리 정의된 + 사용자 정의 태그
6. **차트 스크린샷 실제 업로드 구현**
7. **한국어 UI 통일**

### 2.3 구체적 UI 구성안 (Specific UI Composition)

#### 전체 레이아웃 와이어프레임

```
+----------------------------------------------------------------------+
| ← Journals / 새 거래 기록                                             |
| Document your trading setup and analysis                              |
+----------------------------------------------------------------------+
|                                                                        |
|  +--[좌측: 폼]------------------------------------------+ +--[우측]--+ |
|  |                                                      | |실시간    | |
|  |  ┌──────────────────────────────────────────────┐    | |계산 패널 | |
|  |  │ 🎯 거래 기본 정보                              │    | |          | |
|  |  │                                                │    | |투자금    | |
|  |  │ [자산유형: ○암호화폐 ○주식]                     │    | |1,000,000 | |
|  |  │                                                │    | |          | |
|  |  │ 종목 [BTC/USDT    ] 날짜 [2026-02-15]          │    | |예상 손익 | |
|  |  │                                                │    | |+150,000  | |
|  |  │ 거래유형 [○현물 ○선물]  포지션 [LONG][SHORT]    │    | |          | |
|  |  │                                                │    | |R:R      | |
|  |  │ 화폐 [KRW ▼]  상태 [○진행중 ○종료]             │    | |1:2.3    | |
|  |  └──────────────────────────────────────────────┘    | |          | |
|  |                                                      | |최대 손실 | |
|  |  ┌──────────────────────────────────────────────┐    | |-65,000   | |
|  |  │ 💰 가격 & 수량                                 │    | |          | |
|  |  │                                                │    | |시드 대비 | |
|  |  │ 진입가 [97,500  ] 청산가 [99,200  ]            │    | |10.0%    | |
|  |  │ 수량   [0.5     ] 레버리지 [10x ▼ ]            │    | +----------+|
|  |  │ 손절가 [96,800  ] 익절가 [100,500 ]            │    |            |
|  |  │                                                │    |            |
|  |  │ ┌ 자동 계산 ─────────────────────┐             │    |            |
|  |  │ │ 투자금: 4,875,000 | P&L: +850K │             │    |            |
|  |  │ │ ROI: +17.4%  | R:R: 1:2.4      │             │    |            |
|  |  │ └────────────────────────────────┘             │    |            |
|  |  └──────────────────────────────────────────────┘    |            |
|  |                                                      |            |
|  |  ┌──────────────────────────────────────────────┐    |            |
|  |  │ 📊 차트 & 분석                                 │    |            |
|  |  │                                                │    |            |
|  |  │ ┌ - - - - - - - - - - - - - - - - - - - ┐     │    |            |
|  |  │ │  📷 차트 스크린샷 드래그 또는 클릭     │     │    |            |
|  |  │ │     PNG, JPG, WEBP (최대 5MB)          │     │    |            |
|  |  │ └ - - - - - - - - - - - - - - - - - - - ┘     │    |            |
|  |  │                                                │    |            |
|  |  │ 타임프레임 [5m][15m][1H][4H][1D]               │    |            |
|  |  │ 주요 가격대 [Support: 96K, Resistance: 100K]   │    |            |
|  |  └──────────────────────────────────────────────┘    |            |
|  |                                                      |            |
|  |  ┌──────────────────────────────────────────────┐    |            |
|  |  │ 🧠 심리 & 전략                                 │    |            |
|  |  │                                                │    |            |
|  |  │ 진입 전 감정:                                   │    |            |
|  |  │ [😰공포][😟불안][😐평온][😊자신감][🤑탐욕]      │    |            |
|  |  │                                                │    |            |
|  |  │ 진입 후 감정:                                   │    |            |
|  |  │ [😰공포][😟불안][😐평온][😊자신감][🤑탐욕]      │    |            |
|  |  │                                                │    |            |
|  |  │ 전략 태그:                                      │    |            |
|  |  │ [브레이크아웃][지지/저항][추세추종][역추세]      │    |            |
|  |  │ [스캘핑][뉴스][패턴][+ 직접 입력]               │    |            |
|  |  │                                                │    |            |
|  |  │ ✅ 체크리스트:                                  │    |            |
|  |  │ ☑ 상위 타임프레임 추세 확인?                    │    |            |
|  |  │ ☑ 손절 레벨 설정?                               │    |            |
|  |  │ ☐ FOMO로 진입하지 않았나?                       │    |            |
|  |  │ ☑ R:R 비율 적절한가?                            │    |            |
|  |  └──────────────────────────────────────────────┘    |            |
|  |                                                      |            |
|  |  ┌──────────────────────────────────────────────┐    |            |
|  |  │ 📝 트레이딩 노트                               │    |            |
|  |  │                                                │    |            |
|  |  │ [                                          ]   │    |            |
|  |  │ [  거래 근거, 시장 상황, 반성점 등을 자유롭게  ]   │    |            |
|  |  │ [  작성하세요...                               ]   │    |            |
|  |  │ [                                          ]   │    |            |
|  |  └──────────────────────────────────────────────┘    |            |
|  |                                                      |            |
|  |  [임시 저장]                            [기록 저장]   |            |
|  +------------------------------------------------------+            |
+----------------------------------------------------------------------+
```

#### 컴포넌트 구조

```
NewJournalPage
├── Breadcrumb
├── PageHeader ("새 거래 기록")
├── <div className="flex gap-6">
│   ├── TradeEntryForm (좌측, flex-1)
│   │   ├── BasicInfoSection
│   │   │   ├── AssetTypeToggle (암호화폐/주식 - 라디오 버튼 스타일)
│   │   │   ├── SymbolInput (자동완성 지원)
│   │   │   ├── TradeDatePicker
│   │   │   ├── TradeTypeToggle (현물/선물)
│   │   │   ├── PositionToggle (LONG/SHORT - 선물일 때만)
│   │   │   ├── CurrencySelect
│   │   │   └── TradeStatusToggle (진행중/종료)
│   │   ├── PriceQuantitySection
│   │   │   ├── EntryPriceInput
│   │   │   ├── ExitPriceInput (종료 상태일 때만)
│   │   │   ├── QuantityInput
│   │   │   ├── LeverageSelect (선물일 때만)
│   │   │   ├── StopLossInput
│   │   │   ├── TakeProfitInput
│   │   │   └── AutoCalcDisplay (투자금, P&L, ROI, R:R 자동 계산)
│   │   ├── ChartAnalysisSection
│   │   │   ├── ChartUploader (드래그&드롭 + 미리보기)
│   │   │   ├── TimeframeSelector (토글 버튼 그룹)
│   │   │   └── KeyLevelsInput
│   │   ├── PsychologySection (새 섹션)
│   │   │   ├── EmotionSelector (진입 전)
│   │   │   ├── EmotionSelector (진입 후)
│   │   │   ├── StrategyTags (멀티 선택 태그)
│   │   │   └── RulesChecklist
│   │   ├── NarrativeSection
│   │   │   └── TradeNarrativeTextarea
│   │   └── ActionButtons
│   │       ├── SaveDraftButton
│   │       └── PublishButton
│   └── TradeSummaryPanel (우측, sticky, w-72) (새 컴포넌트)
│       ├── RealTimeCalcPanel
│       │   ├── InvestmentDisplay
│       │   ├── EstimatedPnlDisplay
│       │   ├── RiskRewardDisplay
│       │   ├── MaxLossDisplay
│       │   └── SeedRatioDisplay
│       └── TradePreview (축약된 거래 요약)
└── (모바일: TradeSummaryPanel이 하단 고정 바로 변환)
```

#### 감정 선택기 (EmotionSelector) 상세

```tsx
// components/journal/EmotionSelector.tsx

interface EmotionOption {
  value: string;
  label: string;
  color: string;   // Tailwind 색상 클래스
}

const emotions: EmotionOption[] = [
  { value: 'fear',       label: '공포',   color: 'red' },
  { value: 'anxiety',    label: '불안',   color: 'orange' },
  { value: 'calm',       label: '평온',   color: 'slate' },
  { value: 'confident',  label: '자신감', color: 'emerald' },
  { value: 'greedy',     label: '탐욕',   color: 'amber' },
];

// UI
<div>
  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
    진입 전 감정
  </label>
  <div className="flex gap-2">
    {emotions.map(emotion => (
      <button
        key={emotion.value}
        onClick={() => setSelectedEmotion(emotion.value)}
        className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border-2 transition-all ${
          selected === emotion.value
            ? `border-${emotion.color}-400 bg-${emotion.color}-50 shadow-sm`
            : 'border-slate-100 bg-white hover:border-slate-200'
        }`}
      >
        <span className="text-lg">
          {emotion.value === 'fear' ? '😰' :
           emotion.value === 'anxiety' ? '😟' :
           emotion.value === 'calm' ? '😐' :
           emotion.value === 'confident' ? '😊' : '🤑'}
        </span>
        <span className={`text-xs font-medium ${
          selected === emotion.value ? `text-${emotion.color}-700` : 'text-slate-400'
        }`}>
          {emotion.label}
        </span>
      </button>
    ))}
  </div>
</div>
```

**참고**: Tailwind에서 동적 클래스(`text-${color}-700`)는 동작하지 않으므로, 실제 구현에서는 미리 정의된 매핑 객체를 사용해야 한다:

```tsx
const colorMap: Record<string, { border: string; bg: string; text: string }> = {
  red:     { border: 'border-red-400',     bg: 'bg-red-50',     text: 'text-red-700' },
  orange:  { border: 'border-orange-400',  bg: 'bg-orange-50',  text: 'text-orange-700' },
  slate:   { border: 'border-slate-400',   bg: 'bg-slate-50',   text: 'text-slate-700' },
  emerald: { border: 'border-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  amber:   { border: 'border-amber-400',   bg: 'bg-amber-50',   text: 'text-amber-700' },
};
```

#### 전략 태그 (StrategyTags) 상세

```tsx
// components/journal/StrategyTags.tsx

const defaultStrategies = [
  '브레이크아웃', '지지/저항', '추세추종', '역추세',
  '스캘핑', '뉴스', '패턴', '갭', '오버나잇'
];

<div>
  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
    전략 태그
  </label>
  <div className="flex flex-wrap gap-2">
    {defaultStrategies.map(strategy => (
      <button
        key={strategy}
        onClick={() => toggleStrategy(strategy)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          selectedStrategies.includes(strategy)
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        {strategy}
      </button>
    ))}
    {/* 직접 입력 버튼 */}
    <button
      onClick={() => setShowCustomInput(true)}
      className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-all"
    >
      + 직접 입력
    </button>
  </div>
</div>
```

#### TradeSummaryPanel (우측 고정 패널) 상세

```tsx
// components/journal/TradeSummaryPanel.tsx

<div className="hidden lg:block w-72 shrink-0">
  <div className="sticky top-24">
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
      <h3 className="text-sm font-bold text-slate-900">거래 요약</h3>

      {/* 종목 & 포지션 */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-slate-900">
          {symbol || '종목 미입력'}
        </span>
        {position && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            position === 'LONG'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {position}
          </span>
        )}
      </div>

      <div className="h-px bg-slate-100" />

      {/* 실시간 계산 값 */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">투자금</span>
          <span className="font-medium text-slate-900">
            {investment > 0 ? investment.toLocaleString() + '원' : '-'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-400">예상 P&L</span>
          <span className={`font-bold ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {pnl !== 0 ? (pnl > 0 ? '+' : '') + pnl.toLocaleString() + '원' : '-'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-400">ROI</span>
          <span className={`font-bold ${roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {roi !== 0 ? (roi > 0 ? '+' : '') + roi.toFixed(2) + '%' : '-'}
          </span>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex justify-between text-sm">
          <span className="text-slate-400">R:R 비율</span>
          <span className="font-medium text-slate-900">
            {rr > 0 ? `1:${rr.toFixed(2)}` : '-'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-400">최대 손실</span>
          <span className="font-bold text-red-600">
            {maxLoss > 0 ? `-${maxLoss.toLocaleString()}원` : '-'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-400">시드 대비</span>
          <span className={`font-medium ${seedRatio > 20 ? 'text-red-600' : 'text-slate-900'}`}>
            {seedRatio > 0 ? seedRatio.toFixed(1) + '%' : '-'}
          </span>
        </div>
      </div>

      {/* 위험도 게이지 */}
      {seedRatio > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">포지션 위험도</span>
            <span className={`font-medium ${
              seedRatio > 20 ? 'text-red-600' : seedRatio > 10 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {seedRatio > 20 ? '위험' : seedRatio > 10 ? '주의' : '안전'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                seedRatio > 20 ? 'bg-red-500' : seedRatio > 10 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(seedRatio, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  </div>
</div>
```

#### 모바일 반응형 동작

```
Desktop (lg+):
  - 2컬럼 레이아웃: 폼(좌) + 요약 패널(우, sticky)
  - 사이드바: 접을 수 있는 최근 거래 목록

Tablet (md):
  - 1컬럼: 요약 패널이 폼 상단 또는 하단에 배치
  - 접이식 요약 카드 (탭하여 펼치기)

Mobile (sm-):
  - 1컬럼 풀 폼
  - 요약 패널 -> 하단 고정 바 (Floating Bottom Bar)
    +-------------------------------------------+
    | BTC/USDT  LONG  | +150K (+17.4%) | [저장] |
    +-------------------------------------------+
  - 각 섹션이 아코디언으로 접히는 형태
  - 감정 선택기: 수평 스크롤
  - 사이드바 완전 숨김
```

#### 하단 고정 바 (모바일)

```tsx
// lg 미만에서만 표시
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 lg:hidden z-40">
  <div className="flex items-center justify-between max-w-4xl mx-auto">
    <div className="flex items-center gap-3">
      <span className="font-bold text-slate-900 text-sm">{symbol || '-'}</span>
      {position && (
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
          position === 'LONG' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>{position}</span>
      )}
    </div>
    <div className={`text-sm font-bold ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
      {pnl !== 0 ? `${pnl > 0 ? '+' : ''}${pnl.toLocaleString()}원` : '-'}
    </div>
    <button
      onClick={handleSubmit}
      disabled={isSubmitting}
      className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200"
    >
      저장
    </button>
  </div>
</div>
```

### 2.4 구현 우선순위 (Implementation Priority)

| 순위 | 항목 | 난이도 | 영향도 |
|------|------|--------|--------|
| P0 | JournalRegisterModal과 TradeEntryForm 통합 (단일 폼으로) | 높음 | 높음 |
| P0 | 전체 UI 한국어 통일 | 낮음 | 높음 |
| P0 | 실시간 P&L 자동 계산 (진입가 + 청산가 + 수량 기반) | 중간 | 높음 |
| P1 | TradeSummaryPanel (우측 실시간 요약 패널) | 중간 | 중간 |
| P1 | EmotionSelector (감정 추적) | 낮음 | 높음 |
| P1 | StrategyTags (전략 태그) | 낮음 | 중간 |
| P2 | ChartUploader 실제 구현 (S3 또는 Cloudinary) | 높음 | 중간 |
| P2 | 모바일 하단 고정 바 | 중간 | 중간 |
| P3 | 스마트 기본값 (마지막 거래 기억) | 낮음 | 낮음 |
| P3 | 임시 저장 기능 (localStorage) | 낮음 | 낮음 |

---

## 3. 매매일지 목록/히스토리 (Journal History/List)

### 3.1 현재 문제점 (Current Issues)

**파일**: `/app/journal/page.tsx`

| 문제 | 상세 | 심각도 |
|------|------|--------|
| **필터/정렬 기능 없음** | 종목, 기간, 거래유형, 수익/손실 등으로 필터링 불가. 정렬도 서버에서 기본순만 제공 | 높음 |
| **검색 기능 없음** | 종목명으로 검색할 수 없음 | 높음 |
| **English/Korean 혼용** | 페이지 제목 "Trade History", 버튼 "New Entry", "Delete" 등 영어. 하위 컴포넌트에서는 한국어 | 중간 |
| **테이블 뷰 열 순서 비직관적** | Asset > Type > Date > Investment > P&L > Outcome > ROI 순. 트레이더에게 중요한 P&L이 뒤쪽 | 중간 |
| **그리드 뷰 차트 이미지 미지원** | `chartScreenshotUrl`이 있으면 이미지 표시하지만, 대부분 null이므로 플레이스홀더만 노출 | 중간 |
| **ROI 계산이 시드 기반** | `entry.profit / totalSeed * 100`으로 ROI를 재계산. 서버의 `entry.roi`와 불일치 가능 | 중간 |
| **Bulk 작업 제한** | 선택 후 삭제만 가능. 태그 일괄 적용, 내보내기 등 없음 | 낮음 |
| **날짜 포맷 불일치** | 테이블에서 `entry.tradedAt` 그대로 표시 (ISO 형식). 카드에서도 동일 | 낮음 |
| **빈 상태 디자인 아쉬움** | "No trades yet" 메시지만 있고, 초보 사용자를 위한 가이드 부족 | 낮음 |

### 3.2 개선 방향 (Improvement Direction)

1. **강력한 필터/정렬/검색 시스템** 추가
2. **테이블 열 재구성**: 가장 중요한 정보를 먼저
3. **날짜 포맷 통일**: 한국식 (2026.02.15)
4. **빠른 등록 버튼** 개선: FAB(Floating Action Button) 추가
5. **요약 통계 바** 상단 표시
6. **한국어 UI 통일**

### 3.3 구체적 UI 구성안 (Specific UI Composition)

#### 전체 레이아웃 와이어프레임

```
+----------------------------------------------------------------------+
|  MY TRADE JOURNALS                                                    |
|  매매 히스토리                                           [+ 새 거래]   |
|  총 127건의 거래를 기록했습니다.                                       |
+----------------------------------------------------------------------+
|                                                                        |
|  +--[요약 통계 바]--------------------------------------------------+  |
|  | 총 거래: 127건 | 이익: 82건 | 손실: 45건 | 승률: 64.6%          |  |
|  | 총 P&L: +3,250,000원 | 평균 P&L: +25,590원                     |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +--[필터/검색 바]--------------------------------------------------+  |
|  | 🔍 [종목 검색...        ] [기간 ▼] [거래유형 ▼] [결과 ▼] [정렬 ▼] |  |
|  |                                                                    |  |
|  | 적용된 필터: [암호화폐 ×] [이번 달 ×] [이익만 ×]     [초기화]    |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +--[뷰 토글]---------+ +--[Bulk 액션]---+                            |
|  | [📋 테이블] [📊 카드] | | [삭제(3)]      |                            |
|  +--------------------+ +----------------+                            |
|                                                                        |
|  +--[테이블 뷰]----------------------------------------------------+  |
|  | ☑  종목       포지션  날짜       P&L       ROI     결과  메모    |  |
|  |─────────────────────────────────────────────────────────────────  |  |
|  | ☐  BTC/USDT  L 10x  02.15     +125,000  +12.5%   WIN   📝     |  |
|  | ☐  ETH/USDT  S 5x   02.14     -50,000   -5.0%    LOSS  📝     |  |
|  | ☐  SOL/USDT  L 20x  02.13     +200,000  +20.0%   WIN   📝     |  |
|  | ☐  삼성전자   현물    02.12     +80,000   +2.7%    WIN         |  |
|  | ☐  BTC/USDT  S 10x  02.11     -30,000   -3.0%    LOSS  📝     |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  [← 1 2 3 4 5 →]   [10 per page ▼]                                   |
+----------------------------------------------------------------------+
|                                                     [FAB: + 새 거래]   |
+----------------------------------------------------------------------+
```

#### 컴포넌트 구조

```
JournalPage
├── PageHeader
│   ├── Title ("매매 히스토리")
│   ├── Subtitle ("총 N건의 거래를 기록했습니다.")
│   └── NewEntryButton (Link to /journal/new)
├── SummaryStatBar (새 컴포넌트)
│   ├── TotalTradesCount
│   ├── WinCount / LossCount
│   ├── WinRate
│   ├── TotalPnl
│   └── AvgPnl
├── FilterSearchBar (새 컴포넌트)
│   ├── SearchInput (종목명 검색)
│   ├── DateRangeFilter (기간)
│   ├── TradeTypeFilter (현물/선물/전체)
│   ├── OutcomeFilter (이익/손실/전체)
│   ├── SortSelector (날짜순/P&L순/ROI순)
│   └── ActiveFilters (적용된 필터 칩 + 초기화)
├── ViewToggle + BulkActions
├── JournalTable (테이블 뷰, 개선)
│   └── (개선된 열 순서 + 정렬 헤더 + 날짜 포맷)
├── JournalGrid (카드 뷰, 개선)
│   └── (차트 썸네일 또는 P&L 그라데이션 배경)
├── Pagination (기존 유지, 스타일 통일)
├── FloatingActionButton (모바일, 새 컴포넌트)
└── Modals (JournalDetailModal, JournalRegisterModal)
```

#### FilterSearchBar 상세

```tsx
// components/journal/FilterSearchBar.tsx

<div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
  {/* 첫 번째 줄: 검색 + 필터 드롭다운 */}
  <div className="flex flex-wrap items-center gap-3">
    {/* 검색 */}
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        placeholder="종목명으로 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm h-10 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
      />
    </div>

    {/* 기간 필터 */}
    <select
      value={dateFilter}
      onChange={(e) => setDateFilter(e.target.value)}
      className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
    >
      <option value="all">전체 기간</option>
      <option value="today">오늘</option>
      <option value="week">이번 주</option>
      <option value="month">이번 달</option>
      <option value="3month">최근 3개월</option>
      <option value="year">올해</option>
    </select>

    {/* 거래유형 필터 */}
    <select className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer">
      <option value="all">전체 유형</option>
      <option value="spot">현물</option>
      <option value="future">선물</option>
    </select>

    {/* 결과 필터 */}
    <select className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer">
      <option value="all">전체 결과</option>
      <option value="win">이익만</option>
      <option value="loss">손실만</option>
      <option value="open">진행중</option>
    </select>

    {/* 정렬 */}
    <select className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer">
      <option value="date-desc">최신순</option>
      <option value="date-asc">오래된순</option>
      <option value="pnl-desc">수익 높은순</option>
      <option value="pnl-asc">손실 큰순</option>
      <option value="roi-desc">수익률 높은순</option>
    </select>
  </div>

  {/* 두 번째 줄: 적용된 필터 칩 (필터가 있을 때만) */}
  {hasActiveFilters && (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-400">적용된 필터:</span>
      {activeFilters.map(filter => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
        >
          {filter.label}
          <button
            onClick={() => removeFilter(filter.key)}
            className="hover:text-emerald-900"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <button
        onClick={resetAllFilters}
        className="text-xs text-slate-400 hover:text-slate-600 font-medium"
      >
        전체 초기화
      </button>
    </div>
  )}
</div>
```

#### SummaryStatBar 상세

```tsx
// components/journal/SummaryStatBar.tsx

<div className="bg-slate-50 rounded-xl p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
  <div className="flex items-center gap-2">
    <span className="text-xs text-slate-400">총 거래</span>
    <span className="text-sm font-bold text-slate-900">{totalTrades}건</span>
  </div>
  <div className="w-px h-4 bg-slate-200" />
  <div className="flex items-center gap-2">
    <span className="text-xs text-slate-400">이익</span>
    <span className="text-sm font-bold text-emerald-600">{winCount}건</span>
  </div>
  <div className="flex items-center gap-2">
    <span className="text-xs text-slate-400">손실</span>
    <span className="text-sm font-bold text-red-600">{lossCount}건</span>
  </div>
  <div className="w-px h-4 bg-slate-200" />
  <div className="flex items-center gap-2">
    <span className="text-xs text-slate-400">승률</span>
    <span className="text-sm font-bold text-slate-900">{winRate.toFixed(1)}%</span>
  </div>
  <div className="w-px h-4 bg-slate-200" />
  <div className="flex items-center gap-2">
    <span className="text-xs text-slate-400">총 P&L</span>
    <span className={`text-sm font-bold ${totalPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
      {totalPnl > 0 ? '+' : ''}{totalPnl.toLocaleString()}원
    </span>
  </div>
  <div className="flex items-center gap-2">
    <span className="text-xs text-slate-400">평균 P&L</span>
    <span className={`text-sm font-bold ${avgPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
      {avgPnl > 0 ? '+' : ''}{Math.round(avgPnl).toLocaleString()}원
    </span>
  </div>
</div>
```

#### 테이블 열 순서 개선

```
기존:  ☑ | Asset | Type | Date | Investment | P&L | Outcome | ROI
개선:  ☑ | 종목 | 포지션 | 날짜 | P&L | ROI | 투자금 | 결과 | 메모

이유:
- 종목 다음에 바로 포지션(L/S)을 보여 어떤 방향 거래인지 즉시 파악
- P&L과 ROI를 투자금보다 먼저 배치 (트레이더의 관심 순서)
- 메모 아이콘을 마지막에 배치 (메모가 있는 거래 표시)
```

```tsx
<thead>
  <tr className="border-b border-slate-100">
    <th className="px-4 py-3 text-left w-12">{/* checkbox */}</th>
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600"
        onClick={() => handleSort('symbol')}>
      종목 {sortField === 'symbol' && <SortIcon />}
    </th>
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
      포지션
    </th>
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600"
        onClick={() => handleSort('date')}>
      날짜 {sortField === 'date' && <SortIcon />}
    </th>
    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600"
        onClick={() => handleSort('pnl')}>
      P&L {sortField === 'pnl' && <SortIcon />}
    </th>
    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600"
        onClick={() => handleSort('roi')}>
      ROI {sortField === 'roi' && <SortIcon />}
    </th>
    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
      투자금
    </th>
    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
      결과
    </th>
    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">
      {/* 메모 아이콘 */}
    </th>
  </tr>
</thead>
```

#### 날짜 포맷 통일 유틸리티

```tsx
// lib/utils/dateFormat.ts

import { format, parseISO } from 'date-fns';

export function formatTradeDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'MM.dd');  // 02.15
  } catch {
    return dateStr;
  }
}

export function formatTradeDateFull(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'yyyy.MM.dd');  // 2026.02.15
  } catch {
    return dateStr;
  }
}

export function formatTradeDateKorean(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'yyyy년 M월 d일');  // 2026년 2월 15일
  } catch {
    return dateStr;
  }
}
```

#### FloatingActionButton (모바일)

```tsx
// 모바일에서만 표시되는 FAB
<Link
  href="/journal/new"
  className="fixed bottom-6 right-6 lg:hidden z-40
    w-14 h-14 bg-emerald-500 text-white rounded-full
    flex items-center justify-center
    shadow-xl shadow-emerald-300
    hover:bg-emerald-600 active:scale-95
    transition-all"
>
  <Plus size={24} />
</Link>
```

#### 모바일 반응형 동작

```
Desktop (lg+):
  - 테이블/카드 뷰 토글 가능
  - 필터 바가 수평으로 전체 표시
  - 상단 "New Entry" 버튼

Tablet (md):
  - 카드 뷰 2열 그리드
  - 필터 바: 검색 + 필터 아이콘 (클릭 시 드롭다운)

Mobile (sm-):
  - 카드 뷰 1열 강제 (테이블 숨김)
  - 필터 바: 검색 입력 + [필터] 버튼 (클릭 시 하단 시트)
  - FAB로 새 거래 등록
  - SummaryStatBar: 가로 스크롤 가능
  - 스와이프로 삭제 (선택적 구현)
```

#### 필터 하단 시트 (모바일)

```tsx
// 모바일에서 "필터" 버튼 클릭 시 표시
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto"
>
  <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6" />
  <h3 className="text-lg font-bold text-slate-900 mb-4">필터</h3>

  <div className="space-y-4">
    {/* 기간 */}
    <div>
      <label className="text-sm font-medium text-slate-700 mb-2 block">기간</label>
      <div className="flex flex-wrap gap-2">
        {['전체', '오늘', '이번 주', '이번 달', '3개월'].map(period => (
          <button key={period} className="px-3 py-2 rounded-lg text-sm ...">
            {period}
          </button>
        ))}
      </div>
    </div>

    {/* 거래유형 */}
    <div>
      <label className="text-sm font-medium text-slate-700 mb-2 block">거래유형</label>
      <div className="flex gap-2">
        {['전체', '현물', '선물'].map(type => (
          <button key={type} className="flex-1 py-2 rounded-lg text-sm ...">
            {type}
          </button>
        ))}
      </div>
    </div>

    {/* 결과 */}
    <div>
      <label className="text-sm font-medium text-slate-700 mb-2 block">결과</label>
      <div className="flex gap-2">
        {['전체', '이익', '손실', '진행중'].map(outcome => (
          <button key={outcome} className="flex-1 py-2 rounded-lg text-sm ...">
            {outcome}
          </button>
        ))}
      </div>
    </div>
  </div>

  <div className="flex gap-3 mt-6">
    <button className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium">
      초기화
    </button>
    <button className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-200">
      적용
    </button>
  </div>
</motion.div>
```

### 3.4 구현 우선순위 (Implementation Priority)

| 순위 | 항목 | 난이도 | 영향도 |
|------|------|--------|--------|
| P0 | 종목명 검색 기능 | 낮음 | 높음 |
| P0 | 한국어 UI 통일 | 낮음 | 높음 |
| P0 | 테이블 열 순서 재구성 + 날짜 포맷 | 낮음 | 중간 |
| P1 | 기간/거래유형/결과 필터 | 중간 | 높음 |
| P1 | 정렬 기능 (헤더 클릭) | 중간 | 중간 |
| P1 | SummaryStatBar | 낮음 | 중간 |
| P2 | FilterSearchBar 풀 구현 (필터 칩 포함) | 중간 | 중간 |
| P2 | 모바일 FAB + 하단 시트 필터 | 중간 | 중간 |
| P3 | 카드 뷰 개선 (차트 이미지 지원) | 중간 | 낮음 |
| P3 | 스와이프 삭제 (모바일) | 높음 | 낮음 |

---

## 4. 상세 뷰 (Detail View)

### 4.1 현재 문제점 (Current Issues)

**파일**: `/components/JournalDetailModal.tsx`

| 문제 | 상세 | 심각도 |
|------|------|--------|
| **정보 구조 혼란** | 헤더에 거래 결과(P&L)가 크게 표시되고, 본문에 3개 카드(투자규모, 거래상세, 거래시점)가 있는데 정보 위계가 불명확 | 중간 |
| **중요도 계산의 의미 불명확** | `getImportanceLevel()`로 high/medium/normal을 판단하는데, 사용자에게 "대박"/"주의" 배지의 의미가 설명되지 않음 | 중간 |
| **차트 스크린샷 미표시** | `journal.chartScreenshotUrl`이 있어도 모달에서 표시하지 않음 | 중간 |
| **감정/전략 정보 없음** | 감정 추적과 전략 태그가 없으므로 상세 뷰에서도 표시할 수 없음 | 중간 (폼 개선 후) |
| **수익률 바 차트가 왜곡됨** | `Math.abs(journal.roi) * 3`으로 너비를 계산하는데, ROI가 33% 이상이면 항상 100%로 표시 | 낮음 |
| **메모 영역이 raw text** | JSON 데이터가 메모에 포함될 수 있음 (TradeEntryForm의 `memoContent` 참조). 파싱 없이 그대로 표시 | 낮음 |
| **하단 버튼 중복** | 헤더에 편집/삭제/닫기 버튼이 있고, 하단에도 수정/삭제 버튼이 있음 | 낮음 |
| **네비게이션 없음** | 이전/다음 거래로 이동할 수 없음 | 낮음 |

### 4.2 개선 방향 (Improvement Direction)

1. **정보 위계 재설계**: 헤더(종목+P&L) > 핵심 지표(가격/수량/ROI) > 분석(차트/전략) > 회고(메모/감정)
2. **차트 스크린샷 표시**: 있을 경우 본문 상단에 크게 표시
3. **이전/다음 네비게이션**: 목록에서 열었을 때 좌우 화살표로 이동
4. **메모 파싱**: JSON이 포함된 메모를 구조화하여 표시
5. **하단 액션 정리**: 헤더에는 닫기만, 하단에 모든 액션

### 4.3 구체적 UI 구성안 (Specific UI Composition)

#### 전체 레이아웃 와이어프레임

```
+--[Modal: max-w-3xl]---------------------------------------------+
|                                                                    |
|  +--[헤더]------------------------------------------------------+  |
|  | [←이전]  BTC/USDT          LONG 10x    [수정][삭제][×닫기]   |  |
|  |          2026.02.15 (2일 전)                                  |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--[P&L 히어로 섹션]-----------------------------------------+   |
|  |                                                              |   |
|  |         +125,000원                                           |   |
|  |         +12.50%                                              |   |
|  |                                                              |   |
|  |  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            |   |
|  |  │진입가   │  │청산가   │  │수량     │  │투자금   │            |   |
|  |  │97,500   │  │99,200   │  │0.5 BTC │  │487,500 │            |   |
|  |  └────────┘  └────────┘  └────────┘  └────────┘            |   |
|  +--------------------------------------------------------------+   |
|                                                                    |
|  +--[차트 스크린샷 (있는 경우)]----------------------------------+  |
|  |  ┌──────────────────────────────────────────────────────┐    |  |
|  |  │                                                      │    |  |
|  |  │              [차트 이미지]                            │    |  |
|  |  │                                                      │    |  |
|  |  └──────────────────────────────────────────────────────┘    |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--[거래 분석]--------------------------------------------------+  |
|  |  리스크 관리                                                  |  |
|  |  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            |  |
|  |  │손절가   │  │익절가   │  │R:R     │  │최대손실 │            |  |
|  |  │96,800   │  │100,500  │  │1:2.4   │  │-65,000 │            |  |
|  |  └────────┘  └────────┘  └────────┘  └────────┘            |  |
|  |                                                              |  |
|  |  전략 & 태그                                                 |  |
|  |  [브레이크아웃] [추세추종]                                    |  |
|  |  타임프레임: 1H, 4H                                          |  |
|  |  주요 가격대: Support 96K, Resistance 100K                    |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--[심리 & 회고]------------------------------------------------+  |
|  |  진입 전: 😊 자신감    진입 후: 😐 평온                       |  |
|  |                                                              |  |
|  |  체크리스트:                                                  |  |
|  |  ✅ 상위 타임프레임 추세 확인                                 |  |
|  |  ✅ 손절 레벨 설정                                            |  |
|  |  ✅ R:R 비율 적절                                             |  |
|  |  ❌ FOMO 아닌지 확인                                          |  |
|  |                                                              |  |
|  |  트레이딩 메모:                                               |  |
|  |  "4H 차트에서 브레이크아웃 패턴 확인 후 진입.                 |  |
|  |   상위 TF에서 강한 상승 추세 확인. 목표가 도달 후 청산."      |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--[하단 액션 바]----------------------------------------------+  |
|  | [📋 복사]                    [← 이전] [다음 →]               |  |
|  +--------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

#### 컴포넌트 구조

```
JournalDetailModal
├── ModalOverlay (backdrop)
├── ModalContainer (max-w-3xl, max-h-[90vh])
│   ├── DetailHeader
│   │   ├── NavigationButtons (←이전, 다음→)
│   │   ├── SymbolInfo (종목명 + 포지션 + 레버리지)
│   │   ├── DateInfo (날짜 + 상대적 시간)
│   │   └── ActionButtons (수정, 삭제, 닫기)
│   ├── PnlHeroSection
│   │   ├── ProfitDisplay (큰 P&L 숫자)
│   │   ├── RoiDisplay (수익률)
│   │   └── KeyMetricsGrid (진입가, 청산가, 수량, 투자금)
│   ├── ChartScreenshot (조건부 - chartScreenshotUrl 있을 때)
│   │   └── Image (클릭 시 전체화면 보기)
│   ├── TradeAnalysisSection
│   │   ├── RiskManagementGrid (손절, 익절, R:R, 최대손실)
│   │   ├── StrategyTags (전략 태그 목록)
│   │   └── TechnicalInfo (타임프레임, 주요 가격대)
│   ├── PsychologySection
│   │   ├── EmotionDisplay (진입 전/후 감정)
│   │   ├── ChecklistDisplay (체크리스트 결과)
│   │   └── TradeNarrative (메모)
│   └── BottomActionBar
│       ├── CopyButton
│       └── NavigationButtons (←이전, 다음→)
```

#### DetailHeader 상세

```tsx
<div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2">
      <h2 className="text-xl font-bold text-slate-900">{journal.symbol}</h2>
      {journal.position && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          journal.position === 'LONG'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {journal.position}
          {journal.leverage && journal.leverage > 1 ? ` ${journal.leverage}x` : ''}
        </span>
      )}
    </div>
    <span className="text-sm text-slate-400">
      {formatTradeDateFull(journal.tradedAt)}
      <span className="ml-1 text-slate-300">({getRelativeTime()})</span>
    </span>
  </div>
  <div className="flex items-center gap-1.5">
    <button onClick={onEdit} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
      <Edit size={18} />
    </button>
    <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600">
      <Trash2 size={18} />
    </button>
    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
      <X size={18} />
    </button>
  </div>
</div>
```

#### PnlHeroSection 상세

```tsx
<div className={`px-6 py-6 ${
  isProfit ? 'bg-emerald-50' : 'bg-red-50'
}`}>
  {/* P&L 메인 표시 */}
  <div className="text-center mb-6">
    <div className={`text-3xl sm:text-4xl font-bold ${
      isProfit ? 'text-emerald-600' : 'text-red-600'
    }`}>
      {journal.profit > 0 ? '+' : ''}{journal.profit.toLocaleString()}원
    </div>
    <div className={`text-lg font-medium mt-1 ${
      isProfit ? 'text-emerald-500' : 'text-red-500'
    }`}>
      {journal.roi > 0 ? '+' : ''}{journal.roi.toFixed(2)}%
    </div>
  </div>

  {/* 핵심 지표 그리드 */}
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {[
      { label: '진입가', value: journal.buyPrice.toLocaleString() + '원' },
      { label: '청산가', value: journal.exitPrice ? journal.exitPrice.toLocaleString() + '원' : '-' },
      { label: '수량', value: journal.quantity + (journal.assetType === 'CRYPTO' ? '' : '주') },
      { label: '투자금', value: journal.investment.toLocaleString() + '원' },
    ].map(item => (
      <div key={item.label} className="bg-white/70 rounded-xl p-3 text-center">
        <div className="text-xs text-slate-400 mb-1">{item.label}</div>
        <div className="text-sm font-bold text-slate-900">{item.value}</div>
      </div>
    ))}
  </div>
</div>
```

#### 이전/다음 네비게이션

```tsx
// JournalDetailModal에 journals 배열과 현재 인덱스 전달

interface Props {
  journal: Journal;
  journals?: Journal[];  // 전체 목록 (네비게이션용)
  currentIndex?: number;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate?: (journal: Journal) => void;  // 이전/다음 이동
  totalSeed?: number;
}

// 하단 네비게이션
<div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
  <button
    onClick={copyResult}
    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
  >
    <Copy size={14} />
    결과 복사
  </button>

  <div className="flex items-center gap-2">
    <button
      onClick={() => onNavigate?.(journals![currentIndex! - 1])}
      disabled={!journals || currentIndex === 0}
      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <ChevronLeft size={16} />
      이전
    </button>
    <span className="text-xs text-slate-400">
      {(currentIndex ?? 0) + 1} / {journals?.length ?? 1}
    </span>
    <button
      onClick={() => onNavigate?.(journals![currentIndex! + 1])}
      disabled={!journals || currentIndex === (journals.length - 1)}
      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    >
      다음
      <ChevronRight size={16} />
    </button>
  </div>
</div>
```

#### 모바일 반응형 동작

```
Desktop (lg+):
  - max-w-3xl 모달, 중앙 정렬
  - 핵심 지표 4열 그리드
  - 차트 스크린샷 큰 사이즈

Tablet (md):
  - max-w-2xl 모달
  - 핵심 지표 4열 유지

Mobile (sm-):
  - 풀스크린 모달 (rounded-t-2xl, inset-x-0 bottom-0)
  - 핵심 지표 2열 그리드
  - 차트 스크린샷: 탭하여 전체화면
  - 스와이프로 이전/다음 거래 이동 (Framer Motion gesture)
  - 하단 액션 바: 고정 (sticky bottom)
```

#### 모바일 풀스크린 모달

```tsx
// 모바일에서는 바텀 시트 스타일
<motion.div
  className={`
    bg-white rounded-t-2xl sm:rounded-2xl
    w-full sm:max-w-3xl
    max-h-[95vh] sm:max-h-[90vh]
    overflow-hidden shadow-2xl
    ${/* 모바일: 하단 정렬 */ ''}
    fixed inset-x-0 bottom-0 sm:relative sm:inset-auto
  `}
>
```

### 4.4 구현 우선순위 (Implementation Priority)

| 순위 | 항목 | 난이도 | 영향도 |
|------|------|--------|--------|
| P0 | 정보 위계 재설계 (PnlHeroSection + 그리드 정리) | 중간 | 높음 |
| P0 | 하단 액션 버튼 중복 제거 | 낮음 | 중간 |
| P1 | 차트 스크린샷 표시 | 낮음 | 중간 |
| P1 | 메모 파싱 (JSON 데이터 구조화 표시) | 중간 | 중간 |
| P1 | 이전/다음 네비게이션 | 중간 | 중간 |
| P2 | 감정/전략 정보 표시 (폼 개선 이후) | 낮음 | 중간 |
| P2 | 모바일 풀스크린 + 스와이프 | 높음 | 중간 |
| P3 | ROI 바 차트 수정 (왜곡 해결) | 낮음 | 낮음 |
| P3 | 중요도 배지 설명 추가 | 낮음 | 낮음 |

---

## 5. 글로벌 디자인 시스템 개선

### 5.1 언어 통일

현재 상태: Header(`Dashboard`, `Journals`, `Analytics`, `Settings`), TradeEntryForm(전체 영어), JournalPage 헤더(영어), StatCards(한국어), JournalRegisterModal(한국어) 등 혼용.

**개선**: 전체 한국어로 통일. 단, 금융 용어(P&L, ROI, R:R)는 영어 약어 유지.

```tsx
// Header navLinks 변경
const navLinks = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/journal', label: '매매일지', icon: BookOpen },
  { href: '#', label: '분석', icon: BarChart3 },
  { href: '#', label: '설정', icon: Settings },
];
```

### 5.2 디자인 토큰 정리

```tsx
// tailwind.config.js 확장
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        profit: '#10b981',   // 이익 색상
        loss: '#ef4444',     // 손실 색상
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],  // 숫자 표시용
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      },
    },
  },
};
```

### 5.3 공통 컴포넌트 패턴

#### 금액 표시 유틸리티

```tsx
// lib/utils/formatCurrency.ts

export function formatKRW(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

export function formatPnl(amount: number): string {
  const prefix = amount > 0 ? '+' : '';
  return prefix + amount.toLocaleString('ko-KR') + '원';
}

export function formatCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 100000000) return (amount / 100000000).toFixed(1) + '억';
  if (abs >= 10000) return (amount / 10000).toFixed(0) + '만';
  return amount.toLocaleString('ko-KR');
}
```

#### 공통 PnlText 컴포넌트

```tsx
// components/ui/PnlText.tsx

interface PnlTextProps {
  value: number;
  format?: 'currency' | 'percent' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSign?: boolean;
  className?: string;
}

export function PnlText({
  value,
  format = 'currency',
  size = 'md',
  showSign = true,
  className = '',
}: PnlTextProps) {
  const color = value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-600' : 'text-slate-400';
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  }[size];

  let formatted: string;
  switch (format) {
    case 'percent':
      formatted = `${showSign && value > 0 ? '+' : ''}${value.toFixed(2)}%`;
      break;
    case 'compact':
      formatted = `${showSign && value > 0 ? '+' : ''}${formatCompact(value)}`;
      break;
    default:
      formatted = formatPnl(value);
  }

  return (
    <span className={`font-bold ${color} ${sizeClass} ${className}`}>
      {formatted}
    </span>
  );
}
```

### 5.4 애니메이션 가이드라인

```tsx
// Framer Motion 공통 variants

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

export const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// 모달 애니메이션
export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

export const modalContent = {
  initial: { scale: 0.96, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.96, opacity: 0 },
  transition: { duration: 0.2, ease: 'easeOut' },
};
```

---

## 6. 구현 로드맵

### Phase 1: 기반 정비 (1-2주)

**목표**: 기존 코드의 문제점 수정, 디자인 시스템 통일

- [ ] 전체 UI 한국어 통일
- [ ] 날짜 포맷 유틸리티 구현 및 적용
- [ ] PnlText 등 공통 컴포넌트 구현
- [ ] Tailwind 디자인 토큰 정리 (tailwind.config.js)
- [ ] RecentTrades의 onSelect 연결 (대시보드에서 클릭 가능하게)
- [ ] 다크모드 클래스 전체 점검 및 통일

### Phase 2: 핵심 기능 (2-3주)

**목표**: 가장 임팩트 있는 신규 기능 추가

- [ ] 대시보드 DateRangeFilter 구현
- [ ] PrimaryStatCards + SecondaryStatCards 분리 (연승/손익비 추가)
- [ ] 매매일지 목록 검색 + 필터 기능 (FilterSearchBar)
- [ ] 매매일지 목록 테이블 열 재구성 + 정렬
- [ ] SummaryStatBar 구현
- [ ] TradeEntryForm과 JournalRegisterModal 통합

### Phase 3: 고급 기능 (2-3주)

**목표**: 차별화된 사용자 경험 제공

- [ ] CalendarHeatmap 대시보드 위젯
- [ ] EmotionSelector (감정 추적) 구현
- [ ] StrategyTags (전략 태그) 구현
- [ ] TradeSummaryPanel (거래 입력 실시간 요약)
- [ ] JournalDetailModal 재설계 (PnlHeroSection + 이전/다음)
- [ ] 모바일 FAB + 하단 시트 필터

### Phase 4: 폴리싱 (1-2주)

**목표**: 완성도 높은 사용자 경험

- [ ] 차트 스크린샷 업로드/표시 구현
- [ ] 모바일 최적화 (하단 고정 바, 풀스크린 모달)
- [ ] GoalDashboard 콤팩트화
- [ ] EquityCurve MDD 시각화
- [ ] 임시 저장 기능 (localStorage)
- [ ] 전체 애니메이션 정리

### 데이터 모델 변경 필요 사항

현재 `Journal` 타입에 추가 필요한 필드:

```typescript
export interface Journal {
  // ... 기존 필드 ...

  // 새로 추가할 필드
  emotionBefore?: 'fear' | 'anxiety' | 'calm' | 'confident' | 'greedy';
  emotionAfter?: 'fear' | 'anxiety' | 'calm' | 'confident' | 'greedy';
  strategies?: string[];      // 전략 태그 배열
  checklist?: string[];       // 완료된 체크리스트 항목
  timeframes?: string[];      // 분석한 타임프레임
  keyLevels?: string;         // 주요 가격대
  tradeNarrative?: string;    // 거래 서사 (별도 필드로 분리)
}
```

**참고**: 백엔드 API 수정이 필요한 필드들. 즉시 추가가 어렵다면 `memo` 필드에 JSON으로 저장하되 프론트에서 파싱하는 방식으로 우선 구현 가능.

---

## 연구 참고 출처

- [Best Trading Journals of 2026 - Tradeciety](https://tradeciety.com/best-online-trading-journals)
- [TraderSync Features](https://tradersync.com/features/)
- [TraderSync Dashboard Customization](https://tradersync.com/tradersync-dashboards-customize-your-trading-experience/)
- [Edgewonk Trading Journal](https://edgewonk.com)
- [TradesViz Day Calendar Tab](https://www.tradesviz.com/blog/tab-calendar/)
- [Fintech UX Design Best Practices - Wildnet Edge](https://www.wildnetedge.com/blogs/fintech-ux-design-best-practices-for-financial-dashboards)
- [Dashboard Design UX Patterns - Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)
- [Financial App Design: UX Strategies - Netguru](https://www.netguru.com/blog/financial-app-design)
- [Fintech Design Guide - Eleken](https://www.eleken.co/blog-posts/modern-fintech-design-guide)
- [Trading Psychology Journal - TradesViz](https://www.tradesviz.com/blog/trading-journal-psychology-tracking/)
- [Trading and Tracking Psychology - TraderSync](https://tradersync.com/trading-and-tracking-psychology/)
- [Tracking Emotions in Trading Journal - Alpha Ex Capital](https://www.alphaexcapital.com/forex/forex-risk-management-and-psychology/journaling-and-performance-tracking-in-forex/tracking-emotions-in-trading-journal)
- [Trading Journal Psychology - Day Trading Toolkit](https://daytradingtoolkit.com/psychology-and-risk/trading-journal-psychological-insights/)
- [5 Best Trading Journals for 2026 - StockBrokers.com](https://www.stockbrokers.com/guides/best-trading-journals)
- [Tremor - Tailwind CSS Dashboard Components](https://www.tremor.so/)
- [Complete Guide to UX Design for Trading Apps - Medium](https://medium.com/@markpascal4343/user-experience-design-for-trading-apps-a-comprehensive-guide-b29445203c71)
