package com.example.tradingnotebe.domain.exchange.client

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
