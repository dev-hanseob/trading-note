package com.example.tradingnotebe.domain.journal.model

import com.example.tradingnotebe.domain.journal.entity.ExecutionResult
import java.time.LocalDate

data class ClosePositionRequest(
    val exitPrice: Double,
    val exitDate: LocalDate? = null,
    val realizedPnl: Double? = null,
    val postTradeAnalysis: String? = null,
    val executionResult: ExecutionResult? = null,
    val wouldTakeAgain: Boolean? = null
)
