# Exchange API Integration Module Design

## Goal
거래소 API를 통해 체결 내역을 자동으로 가져와 Journal에 저장하는 모듈. 다중 거래소 지원을 위한 인터페이스 기반 설계, Bitget 우선 구현.

## Architecture

Spring Modulith 도메인 모듈 `domain/exchange/`로 구성. `ExchangeClient` 인터페이스를 정의하고 거래소별 구현체를 제공. 사용자가 "동기화" 버튼을 클릭하면 거래소에서 체결 내역을 조회하고, Journal 엔티티로 변환하여 중복 없이 저장.

## Tech Stack
- Spring WebClient (비동기 HTTP)
- HMAC-SHA256 서명 (Bitget API 인증)
- AES-256 암호화 (API Key 저장)
- PostgreSQL (credential 저장)

---

## Components

### 1. ExchangeClient Interface

```kotlin
interface ExchangeClient {
    fun getExchangeName(): ExchangeName
    fun fetchClosedTrades(credential: ExchangeCredential, startTime: Long, endTime: Long): List<ExchangeTrade>
    fun validateCredential(credential: ExchangeCredential): Boolean
}
```

- 거래소별 구현체가 이 인터페이스를 구현
- `ExchangeTrade`: 거래소-독립적 중간 DTO
- `validateCredential`: API 키 유효성 검증 (연결 시 호출)

### 2. ExchangeTrade (중간 DTO)

```kotlin
data class ExchangeTrade(
    val exchangeTradeId: String,   // 거래소 고유 거래 ID (중복 체크용)
    val symbol: String,            // BTC/USDT
    val side: String,              // buy / sell
    val price: Double,
    val quantity: Double,
    val fee: Double,
    val feeCurrency: String,
    val tradedAt: Instant,
    val leverage: Int?,
    val tradeType: String          // spot / futures
)
```

### 3. ExchangeCredential Entity

```kotlin
@Entity
class ExchangeCredential(
    val exchangeName: ExchangeName,   // BITGET, BINANCE, ...
    val apiKey: String,               // AES-256 encrypted
    val secretKey: String,            // AES-256 encrypted
    val passphrase: String?,          // AES-256 encrypted (Bitget only)
    val label: String?,               // 사용자 지정 라벨
    @ManyToOne val user: UserEntity,
    @Id @GeneratedValue val id: Long? = null
) : DateEntity()
```

### 4. ExchangeName Enum

```kotlin
enum class ExchangeName {
    BITGET, BINANCE, BYBIT, UPBIT  // 확장 가능
}
```

### 5. BitgetClient (첫 번째 구현체)

Bitget V2 REST API 사용:
- **Base URL**: `https://api.bitget.com`
- **Spot 체결**: `GET /api/v2/spot/trade/fills`
- **Futures 체결**: `GET /api/v2/mix/order/fills`
- **인증**: HMAC-SHA256 (timestamp + method + path + body)
- **Rate Limit**: 10 req/sec

요청 헤더:
```
ACCESS-KEY: apiKey
ACCESS-SIGN: HMAC-SHA256(timestamp + method + requestPath + body, secretKey)
ACCESS-TIMESTAMP: Unix ms
ACCESS-PASSPHRASE: passphrase
Content-Type: application/json
locale: en-US
```

### 6. AES Encryption Utility

```kotlin
@Component
class AesEncryptor {
    fun encrypt(plainText: String): String    // AES-256-GCM
    fun decrypt(cipherText: String): String
}
```

- `@Value`로 암호화 키 주입 (`exchange.encryption-key`)
- API 키 저장/조회 시 자동 암복호화

### 7. ExchangeSyncService

```kotlin
@Service
class ExchangeSyncService(
    private val exchangeClients: List<ExchangeClient>,
    private val credentialRepository: ExchangeCredentialRepository,
    private val journalRepository: JournalRepository,
    private val encryptor: AesEncryptor
) {
    fun sync(userId: UUID, credentialId: Long, startDate: LocalDate, endDate: LocalDate): SyncResult
}
```

동기화 흐름:
1. credentialId로 자격증명 조회 + 복호화
2. exchangeName에 맞는 ExchangeClient 선택
3. 기간 내 체결 내역 조회
4. ExchangeTrade -> Journal 변환
5. exchangeTradeId로 중복 체크 (이미 있으면 skip)
6. 새 거래만 저장
7. SyncResult(imported, skipped, failed) 반환

### 8. ExchangeController

```kotlin
@RestController
@RequestMapping("/api/exchange")
class ExchangeController {
    POST /credentials          - API 키 등록
    GET  /credentials          - 등록된 키 목록
    DELETE /credentials/{id}   - API 키 삭제
    POST /credentials/{id}/validate - 키 유효성 검증
    POST /sync                 - 동기화 실행
}
```

---

## Data Flow

```
User clicks "Sync"
  -> ExchangeController.sync()
  -> ExchangeSyncService.sync()
    -> ExchangeCredentialRepository.findById()
    -> AesEncryptor.decrypt(apiKey, secretKey, passphrase)
    -> BitgetClient.fetchClosedTrades()
      -> WebClient GET /api/v2/spot/trade/fills (HMAC signed)
      -> Parse response -> List<ExchangeTrade>
    -> For each ExchangeTrade:
      -> Check Journal.exchangeTradeId exists?
      -> If not: convert to Journal, save
    -> Return SyncResult(imported=N, skipped=M)
```

## Journal Entity Changes

Journal 엔티티에 추가 필드:
```kotlin
val exchangeName: ExchangeName?       // null = 수동 입력
val exchangeTradeId: String?          // 거래소 고유 ID (중복 방지)
val exchangeCredentialId: Long?       // 어떤 API 키로 가져왔는지
```

`exchangeTradeId`에 unique index 추가 (null 허용, 수동 입력 거래는 null).

## Error Handling

- **Invalid API Key**: 401 -> "Invalid exchange credentials"
- **Rate Limited**: 429 -> 재시도 or 사용자에게 알림
- **Network Error**: 연결 실패 시 SyncResult.failed에 포함
- **Partial Failure**: 가능한 거래는 저장, 실패 건은 에러 로그

## Security

- API Key/Secret/Passphrase는 DB에 AES-256-GCM 암호화 저장
- 암호화 키는 환경 변수로 관리 (`EXCHANGE_ENCRYPTION_KEY`)
- API 응답에서 secretKey/passphrase는 마스킹 처리
- credential은 소유 사용자만 접근 가능 (userId 검증)
