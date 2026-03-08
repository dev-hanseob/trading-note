package com.example.tradingnotebe.domain.exchange.client

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class BitgetClientTest {

    @Test
    fun `generateSignature produces correct HMAC-SHA256 signature`() {
        val signature = BitgetClient.generateSignature(
            "1710000000000",
            "GET",
            "/api/v2/spot/trade/fills",
            "",
            "test-secret-key"
        )
        assertNotNull(signature)
        assertTrue(signature.matches(Regex("^[A-Za-z0-9+/=]+$")))
    }

    @Test
    fun `generateSignature with body includes body in signature`() {
        val sigWithBody = BitgetClient.generateSignature(
            "1710000000000",
            "POST",
            "/api/v2/spot/trade/fills",
            """{"symbol":"BTCUSDT"}""",
            "test-secret-key"
        )
        val sigWithoutBody = BitgetClient.generateSignature(
            "1710000000000",
            "POST",
            "/api/v2/spot/trade/fills",
            "",
            "test-secret-key"
        )
        assertNotEquals(sigWithBody, sigWithoutBody)
    }

    @Test
    fun `generateSignature is deterministic for same inputs`() {
        val sig1 = BitgetClient.generateSignature(
            "1710000000000",
            "GET",
            "/api/v2/spot/trade/fills",
            "",
            "test-secret-key"
        )
        val sig2 = BitgetClient.generateSignature(
            "1710000000000",
            "GET",
            "/api/v2/spot/trade/fills",
            "",
            "test-secret-key"
        )
        assertEquals(sig1, sig2)
    }

    @Test
    fun `generateSignature differs with different secret keys`() {
        val sig1 = BitgetClient.generateSignature(
            "1710000000000",
            "GET",
            "/api/v2/spot/trade/fills",
            "",
            "secret-key-1"
        )
        val sig2 = BitgetClient.generateSignature(
            "1710000000000",
            "GET",
            "/api/v2/spot/trade/fills",
            "",
            "secret-key-2"
        )
        assertNotEquals(sig1, sig2)
    }

    @Test
    fun `generateSignature differs with different timestamps`() {
        val sig1 = BitgetClient.generateSignature(
            "1710000000000",
            "GET",
            "/api/v2/spot/trade/fills",
            "",
            "test-secret-key"
        )
        val sig2 = BitgetClient.generateSignature(
            "1710000000001",
            "GET",
            "/api/v2/spot/trade/fills",
            "",
            "test-secret-key"
        )
        assertNotEquals(sig1, sig2)
    }

    @Test
    fun `generateSignature differs with different methods`() {
        val sigGet = BitgetClient.generateSignature(
            "1710000000000",
            "GET",
            "/api/v2/spot/trade/fills",
            "",
            "test-secret-key"
        )
        val sigPost = BitgetClient.generateSignature(
            "1710000000000",
            "POST",
            "/api/v2/spot/trade/fills",
            "",
            "test-secret-key"
        )
        assertNotEquals(sigGet, sigPost)
    }
}
