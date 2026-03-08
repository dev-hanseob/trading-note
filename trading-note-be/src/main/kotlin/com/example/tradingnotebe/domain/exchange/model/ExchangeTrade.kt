package com.example.tradingnotebe.domain.exchange.model

import java.time.Instant

data class ExchangeTrade(
    val exchangeTradeId: String,
    val orderId: String,
    val symbol: String,
    val side: String,
    val price: Double,
    val quantity: Double,
    val amount: Double,
    val fee: Double,
    val feeCurrency: String,
    val tradedAt: Instant,
    val leverage: Int?,
    val tradeType: String,
    val profit: Double?,
    val tradeSide: String?
)
