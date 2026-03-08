# Trading Note 프로젝트 분석

## 프로젝트 개요
트레이딩 거래 기록 및 분석을 위한 풀스택 웹 애플리케이션

## 프로젝트 구조

### 백엔드 (Spring Boot)
- **위치**: `/Users/seob/IdeaProjects/trading-note/trading-note-be`
- **기술 스택**: 
  - Spring Boot 3.4.4
  - Java 17
  - PostgreSQL
  - Spring Modulith (모듈형 아키텍처)
  - Maven
  - Lombok

#### 주요 도메인
1. **Journal (거래 일지)**
   - 트레이딩 거래 기록 관리
   - 자산 유형(암호화폐, 주식), 거래 유형(현물, 선물), 포지션
   - 투자금액, 수익, ROI, 수량, 레버리지 등 상세 거래 정보
   - 경로: `src/main/java/com/example/tradingnotebe/domain/journal/`

2. **User (사용자)**
   - 사용자 관리 및 인증
   - UUID 기반 사용자 식별
   - 경로: `src/main/java/com/example/tradingnotebe/domain/user/`

3. **Seed (시드머니)**
   - 초기 투자 자본 관리
   - BigDecimal을 사용한 정확한 금액 처리
   - 경로: `src/main/java/com/example/tradingnotebe/domain/seed/`

#### 데이터베이스 설정
- **DB**: PostgreSQL (localhost:5432)
- **Database Name**: trading_note
- **Username**: seob
- **Password**: seob
- **Hibernate DDL**: update (자동 테이블 생성/수정)

#### 실행 명령어
```bash
# 개발 서버 실행
./mvnw spring-boot:run

# 빌드
./mvnw clean compile

# 테스트
./mvnw test
```

### 프론트엔드 (Next.js)
- **위치**: `/Users/seob/IdeaProjects/trading-note/trading-note-fe`
- **기술 스택**:
  - Next.js 15.2.4 (App Router)
  - React 19
  - TypeScript 5
  - Tailwind CSS
  - Framer Motion (애니메이션)
  - Axios (HTTP 클라이언트)
  - Recharts & Lightweight Charts (차트)
  - Next Themes (다크모드)

#### 주요 페이지/컴포넌트
- **페이지**:
  - `/dashboard` - 대시보드
  - `/journal` - 거래 일지
  - `/login` - 로그인
  - `/` - 홈

- **컴포넌트**:
  - `JournalDetailModal` - 거래 상세 정보
  - `JournalRegisterModal` - 거래 등록
  - `SeedChart` - 시드머니 차트
  - `GoalDashboard` - 목표 대시보드
  - `ThemeToggle` - 테마 전환

#### API 클라이언트
- `lib/api/client.ts` - 기본 HTTP 클라이언트
- `lib/api/journal.ts` - 거래 일지 API
- `lib/api/seed.ts` - 시드머니 API

#### 실행 명령어
```bash
# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm run start

# 린트
npm run lint
```

## 개발 워크플로우

### 1. 개발 환경 설정
1. PostgreSQL 데이터베이스 실행 확인
2. 백엔드 서버 실행 (포트 8080)
3. 프론트엔드 개발 서버 실행 (포트 3000)

### 2. 개발 시 주의사항
- 백엔드는 Spring Modulith 아키텍처를 따름
- 프론트엔드는 App Router 구조 사용
- TypeScript 타입 정의는 `type/` 디렉터리에 관리
- API 통신은 Axios 기반 클라이언트 사용
- **에러 메시지는 반드시 영어로 작성** (국제화 및 프론트엔드 연동 고려)
- **이모지 사용 금지**: 코드, 로그, 문서에서 이모지 사용 불가 (가독성 및 일관성 유지)

### 4. 페이징 규칙
#### 프론트엔드-백엔드 페이징 파라미터 통일
- **프론트엔드 요청**: `page=1&pageSize=10` (1부터 시작)
- **백엔드 변환**: `PageRequest.of(page-1, pageSize)` (0부터 시작하는 Spring Data 형식으로 변환)
- **응답 형식**: 
  ```json
  {
    "total": 전체개수,
    "page": 현재페이지(1부터시작),
    "pageSize": 페이지크기,
    "journals": [데이터배열]
  }
  ```
- **적용 API**: `/api/journals` GET 요청
- **구현 위치**: `JournalController.getJournals()` 메서드

### 3. 테스트
- 백엔드: JUnit 기반 테스트 (`src/test/`)
- 프론트엔드: Next.js 기본 테스트 도구 사용

## 아키텍처 특징
- **모듈형 설계**: Spring Modulith를 통한 도메인 분리
- **타입 안전성**: TypeScript 사용으로 타입 안전성 보장
- **반응형 UI**: Tailwind CSS로 반응형 디자인
- **차트 시각화**: 거래 데이터 시각화를 위한 차트 라이브러리 통합
- **다크모드**: 사용자 선호도에 따른 테마 전환 지원

## 향후 개선 사항
- 사용자 인증/인가 시스템 강화
- 실시간 데이터 업데이트 (WebSocket)
- 더 다양한 차트 및 분석 기능
- 모바일 최적화
- API 문서화 (Swagger/OpenAPI)