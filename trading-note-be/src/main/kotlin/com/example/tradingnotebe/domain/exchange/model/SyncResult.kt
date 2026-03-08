package com.example.tradingnotebe.domain.exchange.model

data class SyncResult(
    val imported: Int,
    val skipped: Int,
    val failed: Int,
    val errors: List<String> = emptyList()
)
