# LLM-based Universal CSV Import Design

## Goal
어떤 거래소/포맷의 CSV든 LLM이 컬럼을 자동 인식하여 Journal로 변환하는 범용 임포트 시스템.

## Decisions
- **LLM Provider**: 백엔드에서 호출 (API 키 서버 보관)
- **LLM Model**: GPT-4o-mini (비용 효율) 또는 Claude Haiku
- **Approach**: 헤더 + 샘플 3행만 LLM에 전송, 매핑 규칙 수신 후 백엔드에서 변환
- **UX**: 자동 매핑 + 미리보기 테이블 확인 후 저장
- **Tier**: Pro 전용 기능 (LLM 비용 우리 부담)

## Data Flow

```
[User] -> CSV upload -> [Frontend]
[Frontend] -> POST /api/journals/import/csv/analyze (multipart) -> [Backend]
[Backend] -> extract headers + 3 sample rows -> [LLM API]
[LLM API] -> column mapping rules JSON -> [Backend]
[Backend] -> apply mapping to all rows -> preview data -> [Frontend]
[Frontend] -> show preview table -> [User]
[User] -> confirm -> [Frontend]
[Frontend] -> POST /api/journals/import/csv/confirm -> [Backend]
[Backend] -> batch save -> done
```

## API Endpoints

### POST /api/journals/import/csv/analyze
- Input: multipart/form-data (CSV file)
- Process: parse CSV, send headers+samples to LLM, apply mapping
- Output:
```json
{
  "mappings": { ... },
  "preview": [{ "tradedAt": "2026-01-15", "symbol": "BTC/KRW", ... }],
  "totalRows": 50,
  "successRows": 48,
  "errorRows": [{ "row": 12, "reason": "Missing required field: tradedAt" }],
  "unmappedColumns": ["수수료", "주문번호"]
}
```

### POST /api/journals/import/csv/confirm
- Input: preview data (Journal[] array from analyze response)
- Output: `{ "savedCount": 48, "message": "48건 저장 완료" }`

## LLM Prompt

```
You are a trading journal CSV parser. Given CSV headers and sample rows,
map each column to the trading journal fields below.

Target fields:
- tradedAt (required): Trade date
- symbol: Trading pair (e.g. BTC/KRW)
- assetType: CRYPTO or STOCK
- tradeType: SPOT or FUTURE
- position: LONG or SHORT
- entryPrice / buyPrice: Entry price
- exitPrice: Exit price
- quantity: Trade quantity
- investment: Total investment amount
- profit: Realized P&L
- roi: Return percentage (%)
- leverage: Leverage multiplier
- memo: Notes
- currency: Currency code (default: KRW)

CSV Headers: {headers}
Sample Rows: {rows}

Return JSON only. Mapping types:
- "column": direct column mapping
- "compute": formula using other columns (e.g. "매수단가 * 수량")
- "value": fixed value for all rows (e.g. "CRYPTO")

For date columns, include "dateFormat" (Java DateTimeFormatter pattern).
For unmappable fields, omit them.
```

### LLM Response Format
```json
{
  "mappings": {
    "tradedAt": { "column": "거래일시", "dateFormat": "yyyy-MM-dd HH:mm" },
    "symbol": { "column": "종목" },
    "entryPrice": { "column": "매수단가" },
    "exitPrice": { "column": "매도단가" },
    "quantity": { "column": "수량" },
    "profit": { "column": "실현손익" },
    "investment": { "compute": "매수단가 * 수량" },
    "roi": { "compute": "실현손익 / (매수단가 * 수량) * 100" },
    "assetType": { "value": "CRYPTO" },
    "tradeType": { "value": "SPOT" },
    "currency": { "value": "KRW" }
  },
  "unmappedColumns": ["수수료", "주문번호"]
}
```

## Frontend UI

### Entry Point
- `/journal` page: "CSV 가져오기" button next to existing "새 거래" button

### CSV Import Modal (3 steps)

**Step 1: File Upload**
- Drag & drop zone + file picker button
- Accepts: .csv (max 5MB, max 1000 rows)
- Shows file name and size after selection

**Step 2: Preview**
- Loading spinner while LLM analyzes ("AI가 데이터를 분석하고 있습니다...")
- Preview table: tradedAt, symbol, entryPrice, exitPrice, quantity, investment, profit, roi
- Top summary: "N건 중 M건 변환 성공"
- Error rows highlighted in red with tooltip showing reason
- "저장" button + "취소" button

**Step 3: Result**
- "N건 저장 완료" success message
- "매매일지 보기" button

## Backend Architecture

### New files
- `domain/journal/controller/CsvImportController.kt` - REST endpoints
- `domain/journal/service/CsvImportService.kt` - CSV parsing + LLM integration
- `domain/journal/service/LlmService.kt` - LLM API client (OpenAI or Anthropic)
- `domain/journal/model/CsvAnalyzeResponse.kt` - response DTOs
- `domain/journal/model/CsvConfirmRequest.kt` - confirm request DTO

### CSV Parsing
- Use Apache Commons CSV (or OpenCSV) for robust CSV parsing
- Auto-detect encoding (UTF-8, EUC-KR for Korean CSVs)
- Handle both comma and tab delimiters

## Constraints
- Max file size: 5MB
- Max rows: 1000
- Pro tier only (check subscription before processing)
- LLM timeout: 30 seconds
- Rate limit: 10 imports per day per user
