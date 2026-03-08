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
