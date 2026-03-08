package com.example.tradingnotebe.domain.exchange.model

import com.example.tradingnotebe.domain.exchange.entity.ExchangeName

data class ExchangeCredentialRequest(
    val exchangeName: ExchangeName,
    val apiKey: String,
    val secretKey: String,
    val passphrase: String? = null,
    val label: String? = null
)
