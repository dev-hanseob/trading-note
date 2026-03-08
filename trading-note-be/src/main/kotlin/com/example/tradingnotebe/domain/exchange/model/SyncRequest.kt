package com.example.tradingnotebe.domain.exchange.model

import java.time.LocalDate

data class SyncRequest(
    val credentialId: Long,
    val startDate: LocalDate,
    val endDate: LocalDate
)
