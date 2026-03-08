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
        .baseUrl(BASE_URL)
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "en-US")
        .build()

    companion object {
        private const val BASE_URL = "https://api.bitget.com"
        private const val SPOT_FILLS_PATH = "/api/v2/spot/trade/fills"
        private const val FUTURES_FILLS_PATH = "/api/v2/mix/order/fills"
        private const val ACCOUNT_INFO_PATH = "/api/v2/spot/account/info"
        private const val PAGE_LIMIT = 100
        private const val SUCCESS_CODE = "00000"

        fun generateSignature(
            timestamp: String,
            method: String,
            requestPath: String,
            body: String,
            secretKey: String
        ): String {
            val message = timestamp + method + requestPath + body
            val mac = Mac.getInstance("HmacSHA256")
            val keySpec = SecretKeySpec(secretKey.toByteArray(Charsets.UTF_8), "HmacSHA256")
            mac.init(keySpec)
            val rawHmac = mac.doFinal(message.toByteArray(Charsets.UTF_8))
            return Base64.getEncoder().encodeToString(rawHmac)
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
            val timestamp = System.currentTimeMillis().toString()
            val signature = generateSignature(timestamp, "GET", ACCOUNT_INFO_PATH, "", secretKey)

            val responseBody = webClient.get()
                .uri(ACCOUNT_INFO_PATH)
                .headers { headers -> applyHeaders(headers, apiKey, signature, timestamp, passphrase) }
                .retrieve()
                .bodyToMono(String::class.java)
                .block() ?: return false

            val root = objectMapper.readTree(responseBody)
            root.path("code").asText() == SUCCESS_CODE
        } catch (e: WebClientResponseException) {
            log.warn("Bitget credential validation failed: {}", e.responseBodyAsString)
            false
        } catch (e: Exception) {
            log.warn("Bitget credential validation error: {}", e.message)
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
            val queryParams = buildQueryString(
                "startTime" to startTimeMillis.toString(),
                "endTime" to endTimeMillis.toString(),
                "limit" to PAGE_LIMIT.toString(),
                *listOfNotNull(idLessThan?.let { "idLessThan" to it }).toTypedArray()
            )
            val requestPath = "$SPOT_FILLS_PATH?$queryParams"
            val timestamp = System.currentTimeMillis().toString()
            val signature = generateSignature(timestamp, "GET", requestPath, "", secretKey)

            val responseBody = try {
                webClient.get()
                    .uri(requestPath)
                    .headers { headers -> applyHeaders(headers, apiKey, signature, timestamp, passphrase) }
                    .retrieve()
                    .bodyToMono(String::class.java)
                    .block()
            } catch (e: WebClientResponseException) {
                log.error("Bitget spot fills API error: {}", e.responseBodyAsString)
                throw RuntimeException("Bitget spot fills API error: ${e.responseBodyAsString}", e)
            }

            if (responseBody == null) {
                log.error("Bitget spot fills API returned empty response")
                throw RuntimeException("Bitget spot fills API returned empty response")
            }

            val root = objectMapper.readTree(responseBody)
            val code = root.path("code").asText()
            if (code != SUCCESS_CODE) {
                log.error("Bitget spot fills API returned error code: {}, message: {}", code, root.path("msg").asText())
                throw RuntimeException("Bitget spot fills API error: code=$code, msg=${root.path("msg").asText()}")
            }

            val fillList = extractFillList(root)
            val trades = fillList.mapNotNull { node -> parseSpotTrade(node) }
            allTrades.addAll(trades)

            if (fillList.size() >= PAGE_LIMIT) {
                val lastNode = fillList.last()
                idLessThan = lastNode.path("tradeId").asText()
            } else {
                idLessThan = null
            }
        } while (idLessThan != null)

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
            val queryParams = buildQueryString(
                "productType" to "USDT-FUTURES",
                "startTime" to startTimeMillis.toString(),
                "endTime" to endTimeMillis.toString(),
                "limit" to PAGE_LIMIT.toString(),
                *listOfNotNull(idLessThan?.let { "idLessThan" to it }).toTypedArray()
            )
            val requestPath = "$FUTURES_FILLS_PATH?$queryParams"
            val timestamp = System.currentTimeMillis().toString()
            val signature = generateSignature(timestamp, "GET", requestPath, "", secretKey)

            val responseBody = try {
                webClient.get()
                    .uri(requestPath)
                    .headers { headers -> applyHeaders(headers, apiKey, signature, timestamp, passphrase) }
                    .retrieve()
                    .bodyToMono(String::class.java)
                    .block()
            } catch (e: WebClientResponseException) {
                log.error("Bitget futures fills API error: {}", e.responseBodyAsString)
                throw RuntimeException("Bitget futures fills API error: ${e.responseBodyAsString}", e)
            }

            if (responseBody == null) {
                log.error("Bitget futures fills API returned empty response")
                throw RuntimeException("Bitget futures fills API returned empty response")
            }

            val root = objectMapper.readTree(responseBody)
            val code = root.path("code").asText()
            if (code != SUCCESS_CODE) {
                log.error("Bitget futures fills API returned error code: {}, message: {}", code, root.path("msg").asText())
                throw RuntimeException("Bitget futures fills API error: code=$code, msg=${root.path("msg").asText()}")
            }

            val fillList = extractFillList(root)
            val trades = fillList.mapNotNull { node -> parseFuturesTrade(node) }
            allTrades.addAll(trades)

            if (fillList.size() >= PAGE_LIMIT) {
                val lastNode = fillList.last()
                idLessThan = lastNode.path("tradeId").asText()
            } else {
                idLessThan = null
            }
        } while (idLessThan != null)

        return allTrades
    }

    private fun extractFillList(root: JsonNode): JsonNode {
        val data = root.path("data")
        // Bitget returns either {"data":{"fillList":[...]}} or {"data":[...]}
        return when {
            data.has("fillList") -> data.path("fillList")
            data.isArray -> data
            else -> objectMapper.createArrayNode()
        }
    }

    private fun parseSpotTrade(node: JsonNode): ExchangeTrade? {
        return try {
            val price = node.path("priceAvg").asDouble().takeIf { it > 0 }
                ?: node.path("price").asDouble()
            val quantity = node.path("size").asDouble().takeIf { it > 0 }
                ?: node.path("baseVolume").asDouble()
            val amount = node.path("amount").asDouble().takeIf { it > 0 }
                ?: (price * quantity)

            ExchangeTrade(
                exchangeTradeId = node.path("tradeId").asText(),
                orderId = node.path("orderId").asText(),
                symbol = node.path("symbol").asText(),
                side = node.path("side").asText().uppercase(),
                price = price,
                quantity = quantity,
                amount = amount,
                fee = Math.abs(node.path("fee").asDouble()),
                feeCurrency = extractFeeCurrency(node),
                tradedAt = Instant.ofEpochMilli(node.path("cTime").asLong()),
                leverage = null,
                tradeType = "SPOT",
                profit = null,
                tradeSide = null
            )
        } catch (e: Exception) {
            log.warn("Failed to parse spot trade: {}", e.message)
            null
        }
    }

    private fun parseFuturesTrade(node: JsonNode): ExchangeTrade? {
        return try {
            val leverage = node.path("leverage").asText("")
                .takeIf { it.isNotBlank() }
                ?.toIntOrNull()
            val price = node.path("price").asDouble()
            val quantity = node.path("size").asDouble().takeIf { it > 0 }
                ?: node.path("baseVolume").asDouble()
            val quoteVolume = node.path("quoteVolume").asDouble().takeIf { it > 0 }
                ?: (price * quantity)
            val profit = node.path("profit").asText("")
                .takeIf { it.isNotBlank() }
                ?.toDoubleOrNull()

            ExchangeTrade(
                exchangeTradeId = node.path("tradeId").asText(),
                orderId = node.path("orderId").asText(),
                symbol = node.path("symbol").asText(),
                side = node.path("side").asText().uppercase(),
                price = price,
                quantity = quantity,
                amount = quoteVolume,
                fee = Math.abs(node.path("fee").asDouble()),
                feeCurrency = extractFeeCurrency(node),
                tradedAt = Instant.ofEpochMilli(
                    node.path("cTime").asLong().takeIf { it > 0 }
                        ?: node.path("updatedTime").asLong()
                ),
                leverage = leverage,
                tradeType = "FUTURES",
                profit = profit,
                tradeSide = node.path("tradeSide").asText("").takeIf { it.isNotBlank() }
            )
        } catch (e: Exception) {
            log.warn("Failed to parse futures trade: {}", e.message)
            null
        }
    }

    private fun extractFeeCurrency(node: JsonNode): String {
        // Try feeCcy first, then feeDetail array
        val feeCcy = node.path("feeCcy").asText("")
        if (feeCcy.isNotBlank()) return feeCcy

        val feeDetail = node.path("feeDetail")
        if (feeDetail.isArray && feeDetail.size() > 0) {
            val currency = feeDetail[0].path("feeCoin").asText("")
            if (currency.isNotBlank()) return currency
        }

        return "UNKNOWN"
    }

    private fun applyHeaders(
        headers: HttpHeaders,
        apiKey: String,
        signature: String,
        timestamp: String,
        passphrase: String?
    ) {
        headers["ACCESS-KEY"] = apiKey
        headers["ACCESS-SIGN"] = signature
        headers["ACCESS-TIMESTAMP"] = timestamp
        headers["ACCESS-PASSPHRASE"] = passphrase ?: ""
    }

    private fun buildQueryString(vararg params: Pair<String, String>): String {
        return params.joinToString("&") { (key, value) -> "$key=$value" }
    }
}
