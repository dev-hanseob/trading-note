# Exchange API Integration Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bitget 거래소 API를 통해 체결 내역을 자동으로 가져와 Journal에 저장하는 모듈 구현 (다중 거래소 확장 가능한 인터페이스 설계)

**Architecture:** `domain/exchange/` Spring Modulith 도메인 모듈. `ExchangeClient` 인터페이스로 거래소별 구현체를 추상화하고, BitgetClient를 첫 번째 구현체로 제공. AES-256-GCM으로 API 키를 암호화 저장하고, 사용자가 수동으로 동기화를 트리거하면 체결 내역을 조회하여 Journal로 변환/저장.

**Tech Stack:** Spring Boot 3.4.4, Kotlin, Spring WebClient, HMAC-SHA256 (Bitget 인증), AES-256-GCM (키 암호화), PostgreSQL, JUnit 5

**Design Doc:** `docs/plans/2026-03-07-exchange-api-design.md`

---

### Task 1: ExchangeName Enum & ExchangeTrade DTO

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/entity/ExchangeName.kt`
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/model/ExchangeTrade.kt`

**Step 1: Create ExchangeName enum**

```kotlin
package com.example.tradingnotebe.domain.exchange.entity

enum class ExchangeName {
    BITGET,
    BINANCE,
    BYBIT,
    UPBIT
}
```

**Step 2: Create ExchangeTrade DTO**

```kotlin
package com.example.tradingnotebe.domain.exchange.model

import java.time.Instant

data class ExchangeTrade(
    val exchangeTradeId: String,
    val symbol: String,
    val side: String,
    val price: Double,
    val quantity: Double,
    val fee: Double,
    val feeCurrency: String,
    val tradedAt: Instant,
    val leverage: Int?,
    val tradeType: String
)
```

**Step 3: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/
git commit -m "feat(exchange): add ExchangeName enum and ExchangeTrade DTO"
```

---

### Task 2: AES-256-GCM Encryption Utility

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/util/AesEncryptor.kt`
- Create: `trading-note-be/src/test/kotlin/com/example/tradingnotebe/domain/exchange/util/AesEncryptorTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.example.tradingnotebe.domain.exchange.util

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class AesEncryptorTest {

    private val encryptor = AesEncryptor("12345678901234567890123456789012") // 32-byte key

    @Test
    fun `encrypt and decrypt returns original text`() {
        val original = "my-secret-api-key-12345"
        val encrypted = encryptor.encrypt(original)

        assertNotEquals(original, encrypted)
        assertEquals(original, encryptor.decrypt(encrypted))
    }

    @Test
    fun `encrypt produces different ciphertext each time due to random IV`() {
        val original = "same-plaintext"
        val encrypted1 = encryptor.encrypt(original)
        val encrypted2 = encryptor.encrypt(original)

        assertNotEquals(encrypted1, encrypted2)
        assertEquals(original, encryptor.decrypt(encrypted1))
        assertEquals(original, encryptor.decrypt(encrypted2))
    }

    @Test
    fun `encrypt empty string works`() {
        val encrypted = encryptor.encrypt("")
        assertEquals("", encryptor.decrypt(encrypted))
    }
}
```

**Step 2: Run test to verify it fails**

Run: `cd trading-note-be && ./mvnw test -pl . -Dtest="com.example.tradingnotebe.domain.exchange.util.AesEncryptorTest" -DfailIfNoTests=false`
Expected: FAIL - class not found

**Step 3: Write minimal implementation**

```kotlin
package com.example.tradingnotebe.domain.exchange.util

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

@Component
class AesEncryptor(
    @Value("\${exchange.encryption-key:default-key-must-be-32-bytes!!}") private val encryptionKey: String
) {
    companion object {
        private const val ALGORITHM = "AES/GCM/NoPadding"
        private const val GCM_TAG_LENGTH = 128
        private const val IV_LENGTH = 12
    }

    private val keySpec: SecretKeySpec by lazy {
        SecretKeySpec(encryptionKey.toByteArray().copyOf(32), "AES")
    }

    fun encrypt(plainText: String): String {
        if (plainText.isEmpty()) return plainText

        val iv = ByteArray(IV_LENGTH)
        SecureRandom().nextBytes(iv)

        val cipher = Cipher.getInstance(ALGORITHM)
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, GCMParameterSpec(GCM_TAG_LENGTH, iv))
        val encrypted = cipher.doFinal(plainText.toByteArray())

        val combined = iv + encrypted
        return Base64.getEncoder().encodeToString(combined)
    }

    fun decrypt(cipherText: String): String {
        if (cipherText.isEmpty()) return cipherText

        val combined = Base64.getDecoder().decode(cipherText)
        val iv = combined.copyOfRange(0, IV_LENGTH)
        val encrypted = combined.copyOfRange(IV_LENGTH, combined.size)

        val cipher = Cipher.getInstance(ALGORITHM)
        cipher.init(Cipher.DECRYPT_MODE, keySpec, GCMParameterSpec(GCM_TAG_LENGTH, iv))
        return String(cipher.doFinal(encrypted))
    }
}
```

**Step 4: Run test to verify it passes**

Run: `cd trading-note-be && ./mvnw test -pl . -Dtest="com.example.tradingnotebe.domain.exchange.util.AesEncryptorTest" -DfailIfNoTests=false`
Expected: 3 tests PASS

**Step 5: Add config to application.yml**

Add at bottom of `trading-note-be/src/main/resources/application.yml`:

```yaml

# Exchange API Configuration
exchange:
  encryption-key: ${EXCHANGE_ENCRYPTION_KEY:default-key-must-be-32-bytes!!}
```

**Step 6: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/util/AesEncryptor.kt
git add trading-note-be/src/test/kotlin/com/example/tradingnotebe/domain/exchange/util/AesEncryptorTest.kt
git add trading-note-be/src/main/resources/application.yml
git commit -m "feat(exchange): add AES-256-GCM encryption utility for API key storage"
```

---

### Task 3: ExchangeCredential Entity & Repository

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/entity/ExchangeCredential.kt`
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/repository/ExchangeCredentialRepository.kt`

**Step 1: Create ExchangeCredential entity**

Follow existing pattern from `Journal.kt` - JPA entity with `@ManyToOne` user relation.

```kotlin
package com.example.tradingnotebe.domain.exchange.entity

import com.example.tradingnotebe.domain.user.entity.UserEntity
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity(name = "exchange_credential")
@Table(
    indexes = [
        Index(name = "idx_exchange_credential_user_id", columnList = "user_id")
    ]
)
class ExchangeCredential(

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: Long? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "exchange_name", nullable = false)
    val exchangeName: ExchangeName,

    @Column(name = "api_key", nullable = false)
    val apiKey: String,

    @Column(name = "secret_key", nullable = false)
    val secretKey: String,

    @Column(name = "passphrase")
    val passphrase: String? = null,

    @Column(name = "label")
    val label: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: UserEntity,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime? = null
) {
    constructor() : this(
        exchangeName = ExchangeName.BITGET,
        apiKey = "",
        secretKey = "",
        user = UserEntity(email = "default@example.com")
    )
}
```

**Step 2: Create repository**

```kotlin
package com.example.tradingnotebe.domain.exchange.repository

import com.example.tradingnotebe.domain.exchange.entity.ExchangeCredential
import com.example.tradingnotebe.domain.exchange.entity.ExchangeName
import com.example.tradingnotebe.domain.user.entity.UserEntity
import org.springframework.data.jpa.repository.JpaRepository

interface ExchangeCredentialRepository : JpaRepository<ExchangeCredential, Long> {
    fun findByUserOrderByCreatedAtDesc(user: UserEntity): List<ExchangeCredential>
    fun findByIdAndUser(id: Long, user: UserEntity): ExchangeCredential?
    fun findByUserAndExchangeName(user: UserEntity, exchangeName: ExchangeName): List<ExchangeCredential>
}
```

**Step 3: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/entity/ExchangeCredential.kt
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/repository/ExchangeCredentialRepository.kt
git commit -m "feat(exchange): add ExchangeCredential entity and repository"
```

---

### Task 4: Journal Entity - Add Exchange Fields

**Files:**
- Modify: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/entity/Journal.kt`

**Step 1: Add exchange-related fields to Journal entity**

Add these 3 fields to the Journal class, after `parentJournalId` (line 143) and before `updatedAt` (line 145):

```kotlin
    @Enumerated(EnumType.STRING)
    @Column(name = "exchange_name")
    val exchangeName: com.example.tradingnotebe.domain.exchange.entity.ExchangeName? = null,

    @Column(name = "exchange_trade_id")
    val exchangeTradeId: String? = null,

    @Column(name = "exchange_credential_id")
    val exchangeCredentialId: Long? = null,
```

Also add a new index for deduplication in the `@Table` annotation:

```kotlin
Index(name = "idx_journal_exchange_trade_id", columnList = "exchange_trade_id")
```

**Important:** Also update the `updateFrom()` and `close()` methods to carry over these fields:
- In `updateFrom()`: add `exchangeName = this.exchangeName`, `exchangeTradeId = this.exchangeTradeId`, `exchangeCredentialId = this.exchangeCredentialId`
- In `close()`: add `exchangeName = this.exchangeName`, `exchangeTradeId = this.exchangeTradeId`, `exchangeCredentialId = this.exchangeCredentialId`

And add `exchangeTradeId` parameter to the no-arg constructor with default `null`.

**Step 2: Add query method to JournalRepository**

Open `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/repository/JournalRepository.kt` and add:

```kotlin
fun existsByExchangeTradeIdAndUser(exchangeTradeId: String, user: UserEntity): Boolean
```

**Step 3: Run compile to verify**

Run: `cd trading-note-be && JAVA_HOME=/Users/seob/Library/Java/JavaVirtualMachines/corretto-17.0.6/Contents/Home ./mvnw clean compile`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/entity/Journal.kt
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/repository/JournalRepository.kt
git commit -m "feat(journal): add exchange tracking fields (exchangeName, exchangeTradeId)"
```

---

### Task 5: ExchangeClient Interface

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/client/ExchangeClient.kt`

**Step 1: Create the interface**

```kotlin
package com.example.tradingnotebe.domain.exchange.client

import com.example.tradingnotebe.domain.exchange.entity.ExchangeCredential
import com.example.tradingnotebe.domain.exchange.entity.ExchangeName
import com.example.tradingnotebe.domain.exchange.model.ExchangeTrade

interface ExchangeClient {
    fun getExchangeName(): ExchangeName
    fun fetchClosedTrades(
        apiKey: String,
        secretKey: String,
        passphrase: String?,
        startTimeMillis: Long,
        endTimeMillis: Long
    ): List<ExchangeTrade>

    fun validateCredential(apiKey: String, secretKey: String, passphrase: String?): Boolean
}
```

**Step 2: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/client/ExchangeClient.kt
git commit -m "feat(exchange): add ExchangeClient interface for multi-exchange abstraction"
```

---

### Task 6: BitgetClient - HMAC Signature & Spot Trade Fetching

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/client/BitgetClient.kt`
- Create: `trading-note-be/src/test/kotlin/com/example/tradingnotebe/domain/exchange/client/BitgetClientTest.kt`

**Step 1: Write the failing test for HMAC signature generation**

```kotlin
package com.example.tradingnotebe.domain.exchange.client

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test

class BitgetClientTest {

    @Test
    fun `generateSignature produces correct HMAC-SHA256 signature`() {
        // Bitget V2 docs: sign = Base64(HMAC-SHA256(timestamp + method + requestPath + body, secretKey))
        val timestamp = "1710000000000"
        val method = "GET"
        val requestPath = "/api/v2/spot/trade/fills"
        val body = ""
        val secretKey = "test-secret-key"

        val signature = BitgetClient.generateSignature(timestamp, method, requestPath, body, secretKey)

        assertNotNull(signature)
        // Signature should be base64-encoded
        assert(signature.matches(Regex("^[A-Za-z0-9+/=]+$"))) { "Signature should be valid base64" }
    }

    @Test
    fun `generateSignature with body includes body in signature`() {
        val timestamp = "1710000000000"
        val method = "POST"
        val requestPath = "/api/v2/spot/trade/fills"
        val body = """{"symbol":"BTCUSDT"}"""
        val secretKey = "test-secret-key"

        val sigWithBody = BitgetClient.generateSignature(timestamp, method, requestPath, body, secretKey)
        val sigWithoutBody = BitgetClient.generateSignature(timestamp, method, requestPath, "", secretKey)

        assertNotNull(sigWithBody)
        assertNotNull(sigWithoutBody)
        assert(sigWithBody != sigWithoutBody) { "Signatures with different bodies should differ" }
    }
}
```

**Step 2: Run test to verify it fails**

Run: `cd trading-note-be && JAVA_HOME=/Users/seob/Library/Java/JavaVirtualMachines/corretto-17.0.6/Contents/Home ./mvnw test -Dtest="com.example.tradingnotebe.domain.exchange.client.BitgetClientTest" -DfailIfNoTests=false`
Expected: FAIL - class not found

**Step 3: Implement BitgetClient**

```kotlin
package com.example.tradingnotebe.domain.exchange.client

import com.example.tradingnotebe.domain.exchange.entity.ExchangeName
import com.example.tradingnotebe.domain.exchange.model.ExchangeTrade
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
import java.time.Instant
import java.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

@Component
class BitgetClient(
    private val objectMapper: ObjectMapper
) : ExchangeClient {

    private val log = LoggerFactory.getLogger(BitgetClient::class.java)

    private val webClient: WebClient = WebClient.builder()
        .baseUrl("https://api.bitget.com")
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .defaultHeader("locale", "en-US")
        .build()

    companion object {
        fun generateSignature(
            timestamp: String,
            method: String,
            requestPath: String,
            body: String,
            secretKey: String
        ): String {
            val message = timestamp + method.uppercase() + requestPath + body
            val mac = Mac.getInstance("HmacSHA256")
            mac.init(SecretKeySpec(secretKey.toByteArray(), "HmacSHA256"))
            val hash = mac.doFinal(message.toByteArray())
            return Base64.getEncoder().encodeToString(hash)
        }
    }

    override fun getExchangeName(): ExchangeName = ExchangeName.BITGET

    override fun fetchClosedTrades(
        apiKey: String,
        secretKey: String,
        passphrase: String?,
        startTimeMillis: Long,
        endTimeMillis: Long
    ): List<ExchangeTrade> {
        val spotTrades = fetchSpotFills(apiKey, secretKey, passphrase, startTimeMillis, endTimeMillis)
        val futuresTrades = fetchFuturesFills(apiKey, secretKey, passphrase, startTimeMillis, endTimeMillis)
        return spotTrades + futuresTrades
    }

    override fun validateCredential(apiKey: String, secretKey: String, passphrase: String?): Boolean {
        return try {
            val timestamp = Instant.now().toEpochMilli().toString()
            val requestPath = "/api/v2/spot/account/info"
            val signature = generateSignature(timestamp, "GET", requestPath, "", secretKey)

            val response = webClient.get()
                .uri(requestPath)
                .header("ACCESS-KEY", apiKey)
                .header("ACCESS-SIGN", signature)
                .header("ACCESS-TIMESTAMP", timestamp)
                .header("ACCESS-PASSPHRASE", passphrase ?: "")
                .retrieve()
                .bodyToMono(String::class.java)
                .block()

            val node = objectMapper.readTree(response)
            node.get("code")?.asText() == "00000"
        } catch (e: Exception) {
            log.warn("Bitget credential validation failed: ${e.message}")
            false
        }
    }

    private fun fetchSpotFills(
        apiKey: String,
        secretKey: String,
        passphrase: String?,
        startTimeMillis: Long,
        endTimeMillis: Long
    ): List<ExchangeTrade> {
        val allTrades = mutableListOf<ExchangeTrade>()
        var idLessThan: String? = null

        do {
            val requestPath = buildSpotFillsPath(startTimeMillis, endTimeMillis, idLessThan)
            val trades = callBitgetApi(apiKey, secretKey, passphrase, requestPath, "spot")

            if (trades.isEmpty()) break
            allTrades.addAll(trades)

            // Pagination: if we got max results (100), there may be more
            if (trades.size < 100) break
            idLessThan = trades.last().exchangeTradeId
        } while (true)

        return allTrades
    }

    private fun fetchFuturesFills(
        apiKey: String,
        secretKey: String,
        passphrase: String?,
        startTimeMillis: Long,
        endTimeMillis: Long
    ): List<ExchangeTrade> {
        val allTrades = mutableListOf<ExchangeTrade>()
        var idLessThan: String? = null

        do {
            val requestPath = buildFuturesFillsPath(startTimeMillis, endTimeMillis, idLessThan)
            val trades = callBitgetApi(apiKey, secretKey, passphrase, requestPath, "futures")

            if (trades.isEmpty()) break
            allTrades.addAll(trades)

            if (trades.size < 100) break
            idLessThan = trades.last().exchangeTradeId
        } while (true)

        return allTrades
    }

    private fun buildSpotFillsPath(startTime: Long, endTime: Long, idLessThan: String?): String {
        val sb = StringBuilder("/api/v2/spot/trade/fills?startTime=$startTime&endTime=$endTime&limit=100")
        if (idLessThan != null) sb.append("&idLessThan=$idLessThan")
        return sb.toString()
    }

    private fun buildFuturesFillsPath(startTime: Long, endTime: Long, idLessThan: String?): String {
        val sb = StringBuilder("/api/v2/mix/order/fills?productType=USDT-FUTURES&startTime=$startTime&endTime=$endTime&limit=100")
        if (idLessThan != null) sb.append("&idLessThan=$idLessThan")
        return sb.toString()
    }

    private fun callBitgetApi(
        apiKey: String,
        secretKey: String,
        passphrase: String?,
        requestPath: String,
        tradeType: String
    ): List<ExchangeTrade> {
        return try {
            val timestamp = Instant.now().toEpochMilli().toString()
            val signature = generateSignature(timestamp, "GET", requestPath, "", secretKey)

            val response = webClient.get()
                .uri(requestPath)
                .header("ACCESS-KEY", apiKey)
                .header("ACCESS-SIGN", signature)
                .header("ACCESS-TIMESTAMP", timestamp)
                .header("ACCESS-PASSPHRASE", passphrase ?: "")
                .retrieve()
                .bodyToMono(String::class.java)
                .block() ?: return emptyList()

            parseBitgetResponse(response, tradeType)
        } catch (e: WebClientResponseException) {
            log.error("Bitget API error (${e.statusCode}): ${e.responseBodyAsString}")
            throw RuntimeException("Bitget API error: ${e.responseBodyAsString}", e)
        }
    }

    private fun parseBitgetResponse(response: String, tradeType: String): List<ExchangeTrade> {
        val root = objectMapper.readTree(response)
        val code = root.get("code")?.asText()
        if (code != "00000") {
            val msg = root.get("msg")?.asText() ?: "Unknown error"
            throw RuntimeException("Bitget API returned error: code=$code, msg=$msg")
        }

        val dataNode = root.get("data") ?: return emptyList()
        val fillList: JsonNode = if (dataNode.has("fillList")) {
            dataNode.get("fillList")
        } else if (dataNode.isArray) {
            dataNode
        } else {
            return emptyList()
        }

        return fillList.mapNotNull { fill ->
            try {
                ExchangeTrade(
                    exchangeTradeId = fill.get("tradeId")?.asText() ?: return@mapNotNull null,
                    symbol = fill.get("symbol")?.asText() ?: "",
                    side = fill.get("side")?.asText() ?: "",
                    price = fill.get("price")?.asText()?.toDoubleOrNull() ?: 0.0,
                    quantity = fill.get("size")?.asText()?.toDoubleOrNull()
                        ?: fill.get("baseVolume")?.asText()?.toDoubleOrNull() ?: 0.0,
                    fee = fill.get("fee")?.asText()?.toDoubleOrNull()?.let { kotlin.math.abs(it) } ?: 0.0,
                    feeCurrency = fill.get("feeCcy")?.asText()
                        ?: fill.get("feeDetail")?.firstOrNull()?.get("feeCoin")?.asText() ?: "",
                    tradedAt = Instant.ofEpochMilli(
                        fill.get("cTime")?.asText()?.toLongOrNull()
                            ?: fill.get("updatedTime")?.asText()?.toLongOrNull()
                            ?: System.currentTimeMillis()
                    ),
                    leverage = fill.get("leverage")?.asText()?.toIntOrNull(),
                    tradeType = tradeType
                )
            } catch (e: Exception) {
                log.warn("Failed to parse Bitget fill: ${e.message}")
                null
            }
        }
    }
}
```

**Step 4: Run test to verify it passes**

Run: `cd trading-note-be && JAVA_HOME=/Users/seob/Library/Java/JavaVirtualMachines/corretto-17.0.6/Contents/Home ./mvnw test -Dtest="com.example.tradingnotebe.domain.exchange.client.BitgetClientTest" -DfailIfNoTests=false`
Expected: 2 tests PASS

**Step 5: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/client/BitgetClient.kt
git add trading-note-be/src/test/kotlin/com/example/tradingnotebe/domain/exchange/client/BitgetClientTest.kt
git commit -m "feat(exchange): implement BitgetClient with HMAC-SHA256 auth and V2 API"
```

---

### Task 7: ExchangeCredentialService

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/service/ExchangeCredentialService.kt`
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/model/ExchangeCredentialRequest.kt`
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/model/ExchangeCredentialResponse.kt`

**Step 1: Create request/response DTOs**

```kotlin
// ExchangeCredentialRequest.kt
package com.example.tradingnotebe.domain.exchange.model

import com.example.tradingnotebe.domain.exchange.entity.ExchangeName

data class ExchangeCredentialRequest(
    val exchangeName: ExchangeName,
    val apiKey: String,
    val secretKey: String,
    val passphrase: String? = null,
    val label: String? = null
)
```

```kotlin
// ExchangeCredentialResponse.kt
package com.example.tradingnotebe.domain.exchange.model

import com.example.tradingnotebe.domain.exchange.entity.ExchangeCredential
import com.example.tradingnotebe.domain.exchange.entity.ExchangeName
import java.time.LocalDateTime

data class ExchangeCredentialResponse(
    val id: Long,
    val exchangeName: ExchangeName,
    val apiKeyMasked: String,
    val label: String?,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(credential: ExchangeCredential, decryptedApiKey: String): ExchangeCredentialResponse {
            return ExchangeCredentialResponse(
                id = credential.id!!,
                exchangeName = credential.exchangeName,
                apiKeyMasked = maskApiKey(decryptedApiKey),
                label = credential.label,
                createdAt = credential.createdAt
            )
        }

        private fun maskApiKey(apiKey: String): String {
            if (apiKey.length <= 8) return "****"
            return apiKey.take(4) + "****" + apiKey.takeLast(4)
        }
    }
}
```

**Step 2: Create ExchangeCredentialService**

```kotlin
package com.example.tradingnotebe.domain.exchange.service

import com.example.tradingnotebe.domain.exchange.client.ExchangeClient
import com.example.tradingnotebe.domain.exchange.entity.ExchangeCredential
import com.example.tradingnotebe.domain.exchange.model.ExchangeCredentialRequest
import com.example.tradingnotebe.domain.exchange.model.ExchangeCredentialResponse
import com.example.tradingnotebe.domain.exchange.repository.ExchangeCredentialRepository
import com.example.tradingnotebe.domain.exchange.util.AesEncryptor
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.UserEntity
import org.springframework.stereotype.Service
import jakarta.transaction.Transactional

@Service
@Transactional
class ExchangeCredentialService(
    private val credentialRepository: ExchangeCredentialRepository,
    private val encryptor: AesEncryptor,
    private val exchangeClients: List<ExchangeClient>
) {

    fun register(request: ExchangeCredentialRequest, user: User): ExchangeCredentialResponse {
        val client = findClient(request.exchangeName)
        val isValid = client.validateCredential(request.apiKey, request.secretKey, request.passphrase)
        if (!isValid) {
            throw IllegalArgumentException("Invalid exchange credentials for ${request.exchangeName}")
        }

        val credential = ExchangeCredential(
            exchangeName = request.exchangeName,
            apiKey = encryptor.encrypt(request.apiKey),
            secretKey = encryptor.encrypt(request.secretKey),
            passphrase = request.passphrase?.let { encryptor.encrypt(it) },
            label = request.label,
            user = UserEntity.toEntity(user)
        )
        val saved = credentialRepository.save(credential)
        return ExchangeCredentialResponse.from(saved, request.apiKey)
    }

    fun getCredentials(user: User): List<ExchangeCredentialResponse> {
        val userEntity = UserEntity.toEntity(user)
        return credentialRepository.findByUserOrderByCreatedAtDesc(userEntity).map { credential ->
            val decryptedApiKey = encryptor.decrypt(credential.apiKey)
            ExchangeCredentialResponse.from(credential, decryptedApiKey)
        }
    }

    fun deleteCredential(id: Long, user: User) {
        val userEntity = UserEntity.toEntity(user)
        val credential = credentialRepository.findByIdAndUser(id, userEntity)
            ?: throw IllegalArgumentException("Credential not found")
        credentialRepository.delete(credential)
    }

    fun validateCredential(id: Long, user: User): Boolean {
        val userEntity = UserEntity.toEntity(user)
        val credential = credentialRepository.findByIdAndUser(id, userEntity)
            ?: throw IllegalArgumentException("Credential not found")

        val client = findClient(credential.exchangeName)
        return client.validateCredential(
            encryptor.decrypt(credential.apiKey),
            encryptor.decrypt(credential.secretKey),
            credential.passphrase?.let { encryptor.decrypt(it) }
        )
    }

    private fun findClient(exchangeName: com.example.tradingnotebe.domain.exchange.entity.ExchangeName): ExchangeClient {
        return exchangeClients.find { it.getExchangeName() == exchangeName }
            ?: throw IllegalArgumentException("Unsupported exchange: $exchangeName")
    }
}
```

**Step 3: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/service/ExchangeCredentialService.kt
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/model/ExchangeCredentialRequest.kt
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/model/ExchangeCredentialResponse.kt
git commit -m "feat(exchange): add ExchangeCredentialService with encrypt/decrypt and validation"
```

---

### Task 8: ExchangeSyncService - Trade Import Logic

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/service/ExchangeSyncService.kt`
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/model/SyncRequest.kt`
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/model/SyncResult.kt`

**Step 1: Create request/response models**

```kotlin
// SyncRequest.kt
package com.example.tradingnotebe.domain.exchange.model

import java.time.LocalDate

data class SyncRequest(
    val credentialId: Long,
    val startDate: LocalDate,
    val endDate: LocalDate
)
```

```kotlin
// SyncResult.kt
package com.example.tradingnotebe.domain.exchange.model

data class SyncResult(
    val imported: Int,
    val skipped: Int,
    val failed: Int,
    val errors: List<String> = emptyList()
)
```

**Step 2: Implement ExchangeSyncService**

```kotlin
package com.example.tradingnotebe.domain.exchange.service

import com.example.tradingnotebe.domain.exchange.client.ExchangeClient
import com.example.tradingnotebe.domain.exchange.model.ExchangeTrade
import com.example.tradingnotebe.domain.exchange.model.SyncRequest
import com.example.tradingnotebe.domain.exchange.model.SyncResult
import com.example.tradingnotebe.domain.exchange.repository.ExchangeCredentialRepository
import com.example.tradingnotebe.domain.exchange.util.AesEncryptor
import com.example.tradingnotebe.domain.journal.entity.*
import com.example.tradingnotebe.domain.journal.repository.JournalRepository
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.UserEntity
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import jakarta.transaction.Transactional
import java.time.LocalDate
import java.time.ZoneId

@Service
@Transactional
class ExchangeSyncService(
    private val credentialRepository: ExchangeCredentialRepository,
    private val journalRepository: JournalRepository,
    private val encryptor: AesEncryptor,
    private val exchangeClients: List<ExchangeClient>
) {
    private val log = LoggerFactory.getLogger(ExchangeSyncService::class.java)

    fun sync(request: SyncRequest, user: User): SyncResult {
        val userEntity = UserEntity.toEntity(user)
        val credential = credentialRepository.findByIdAndUser(request.credentialId, userEntity)
            ?: throw IllegalArgumentException("Credential not found")

        val client = exchangeClients.find { it.getExchangeName() == credential.exchangeName }
            ?: throw IllegalArgumentException("Unsupported exchange: ${credential.exchangeName}")

        val startMillis = request.startDate.atStartOfDay(ZoneId.of("UTC")).toInstant().toEpochMilli()
        val endMillis = request.endDate.plusDays(1).atStartOfDay(ZoneId.of("UTC")).toInstant().toEpochMilli()

        val trades = client.fetchClosedTrades(
            apiKey = encryptor.decrypt(credential.apiKey),
            secretKey = encryptor.decrypt(credential.secretKey),
            passphrase = credential.passphrase?.let { encryptor.decrypt(it) },
            startTimeMillis = startMillis,
            endTimeMillis = endMillis
        )

        var imported = 0
        var skipped = 0
        var failed = 0
        val errors = mutableListOf<String>()

        for (trade in trades) {
            try {
                val exists = journalRepository.existsByExchangeTradeIdAndUser(trade.exchangeTradeId, userEntity)
                if (exists) {
                    skipped++
                    continue
                }

                val journal = convertToJournal(trade, credential.exchangeName, credential.id!!, userEntity)
                journalRepository.save(journal)
                imported++
            } catch (e: Exception) {
                failed++
                errors.add("Failed to import trade ${trade.exchangeTradeId}: ${e.message}")
                log.warn("Failed to import trade ${trade.exchangeTradeId}", e)
            }
        }

        log.info("Exchange sync completed: imported=$imported, skipped=$skipped, failed=$failed")
        return SyncResult(imported = imported, skipped = skipped, failed = failed, errors = errors)
    }

    private fun convertToJournal(
        trade: ExchangeTrade,
        exchangeName: com.example.tradingnotebe.domain.exchange.entity.ExchangeName,
        credentialId: Long,
        user: UserEntity
    ): Journal {
        val tradedAt = LocalDate.ofInstant(trade.tradedAt, ZoneId.of("UTC"))
        val investment = trade.price * trade.quantity
        val position = when (trade.side.lowercase()) {
            "buy" -> PositionType.LONG
            "sell" -> PositionType.SHORT
            else -> null
        }
        val tradeType = when (trade.tradeType.lowercase()) {
            "spot" -> TradeType.SPOT
            "futures" -> TradeType.FUTURES
            else -> TradeType.SPOT
        }

        return Journal(
            assetType = AssetType.CRYPTO,
            tradeType = tradeType,
            position = position,
            currency = "USDT",
            symbol = trade.symbol,
            entryPrice = trade.price,
            quantity = trade.quantity,
            investment = investment,
            profit = 0.0,
            roi = 0.0,
            leverage = trade.leverage,
            tradedAt = tradedAt,
            user = user,
            tradeStatus = TradeStatus.CLOSED,
            exchangeName = exchangeName,
            exchangeTradeId = trade.exchangeTradeId,
            exchangeCredentialId = credentialId,
            memo = "Imported from ${exchangeName.name} (fee: ${trade.fee} ${trade.feeCurrency})"
        )
    }
}
```

**Step 3: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/service/ExchangeSyncService.kt
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/model/SyncRequest.kt
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/model/SyncResult.kt
git commit -m "feat(exchange): add ExchangeSyncService with trade-to-journal conversion and dedup"
```

---

### Task 9: ExchangeController - REST API Endpoints

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/controller/ExchangeController.kt`

**Step 1: Implement the controller**

Follow existing pattern from `JournalController.kt` - uses `@CurrentUser`, `ResponseEntity`, constructor injection.

```kotlin
package com.example.tradingnotebe.domain.exchange.controller

import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.exchange.model.ExchangeCredentialRequest
import com.example.tradingnotebe.domain.exchange.model.ExchangeCredentialResponse
import com.example.tradingnotebe.domain.exchange.model.SyncRequest
import com.example.tradingnotebe.domain.exchange.model.SyncResult
import com.example.tradingnotebe.domain.exchange.service.ExchangeCredentialService
import com.example.tradingnotebe.domain.exchange.service.ExchangeSyncService
import com.example.tradingnotebe.domain.user.domain.User
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/exchange")
class ExchangeController(
    private val credentialService: ExchangeCredentialService,
    private val syncService: ExchangeSyncService
) {

    @PostMapping("/credentials")
    fun registerCredential(
        @RequestBody request: ExchangeCredentialRequest,
        @CurrentUser user: User
    ): ResponseEntity<ExchangeCredentialResponse> {
        val response = credentialService.register(request, user)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/credentials")
    fun getCredentials(
        @CurrentUser user: User
    ): ResponseEntity<List<ExchangeCredentialResponse>> {
        val credentials = credentialService.getCredentials(user)
        return ResponseEntity.ok(credentials)
    }

    @DeleteMapping("/credentials/{id}")
    fun deleteCredential(
        @PathVariable id: Long,
        @CurrentUser user: User
    ): ResponseEntity<Void> {
        credentialService.deleteCredential(id, user)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/credentials/{id}/validate")
    fun validateCredential(
        @PathVariable id: Long,
        @CurrentUser user: User
    ): ResponseEntity<Map<String, Boolean>> {
        val valid = credentialService.validateCredential(id, user)
        return ResponseEntity.ok(mapOf("valid" to valid))
    }

    @PostMapping("/sync")
    fun syncTrades(
        @RequestBody request: SyncRequest,
        @CurrentUser user: User
    ): ResponseEntity<SyncResult> {
        val result = syncService.sync(request, user)
        return ResponseEntity.ok(result)
    }
}
```

**Step 2: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/exchange/controller/ExchangeController.kt
git commit -m "feat(exchange): add ExchangeController REST endpoints for credentials and sync"
```

---

### Task 10: Build & Integration Test

**Step 1: Run full build to ensure everything compiles**

Run: `cd trading-note-be && JAVA_HOME=/Users/seob/Library/Java/JavaVirtualMachines/corretto-17.0.6/Contents/Home ./mvnw clean compile`
Expected: BUILD SUCCESS

**Step 2: Run all tests**

Run: `cd trading-note-be && JAVA_HOME=/Users/seob/Library/Java/JavaVirtualMachines/corretto-17.0.6/Contents/Home ./mvnw test`
Expected: All tests PASS

**Step 3: Start backend and test endpoint manually**

Run backend: `cd trading-note-be && JAVA_HOME=/Users/seob/Library/Java/JavaVirtualMachines/corretto-17.0.6/Contents/Home ./mvnw spring-boot:run`

Test that the new table is created (check logs for `exchange_credential` table creation).

Test endpoint (should return 401 without auth, confirming route exists):
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/exchange/credentials
```
Expected: `401`

**Step 4: Final commit with any fixes**

```bash
git add -A
git commit -m "feat(exchange): complete exchange API integration module with Bitget support"
```

---

## File Summary

### New Files (13)
| Path | Description |
|------|-------------|
| `domain/exchange/entity/ExchangeName.kt` | Exchange name enum |
| `domain/exchange/entity/ExchangeCredential.kt` | API key storage entity |
| `domain/exchange/model/ExchangeTrade.kt` | Exchange-agnostic trade DTO |
| `domain/exchange/model/ExchangeCredentialRequest.kt` | Credential registration request |
| `domain/exchange/model/ExchangeCredentialResponse.kt` | Credential response (masked) |
| `domain/exchange/model/SyncRequest.kt` | Sync request DTO |
| `domain/exchange/model/SyncResult.kt` | Sync result DTO |
| `domain/exchange/util/AesEncryptor.kt` | AES-256-GCM encryption |
| `domain/exchange/client/ExchangeClient.kt` | Multi-exchange interface |
| `domain/exchange/client/BitgetClient.kt` | Bitget V2 API client |
| `domain/exchange/repository/ExchangeCredentialRepository.kt` | Credential data access |
| `domain/exchange/service/ExchangeCredentialService.kt` | Credential CRUD + validation |
| `domain/exchange/service/ExchangeSyncService.kt` | Trade sync logic |
| `domain/exchange/controller/ExchangeController.kt` | REST endpoints |

### Modified Files (3)
| Path | Change |
|------|--------|
| `domain/journal/entity/Journal.kt` | Add exchangeName, exchangeTradeId, exchangeCredentialId fields |
| `domain/journal/repository/JournalRepository.kt` | Add existsByExchangeTradeIdAndUser method |
| `src/main/resources/application.yml` | Add exchange.encryption-key config |

### Test Files (2)
| Path | Description |
|------|-------------|
| `test/.../exchange/util/AesEncryptorTest.kt` | Encrypt/decrypt tests |
| `test/.../exchange/client/BitgetClientTest.kt` | HMAC signature tests |
