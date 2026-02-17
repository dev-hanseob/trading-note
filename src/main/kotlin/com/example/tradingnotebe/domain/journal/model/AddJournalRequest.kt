package com.example.tradingnotebe.domain.journal.model

import com.example.tradingnotebe.domain.journal.entity.*
import java.time.LocalDate

data class AddJournalRequest(
    val assetType: AssetType,
    val tradeType: TradeType,
    val position: PositionType?,
    val currency: String,
    val symbol: String?,
    val buyPrice: Double?,
    val investment: Double,
    val profit: Double,
    val roi: Double,
    val quantity: Double?,
    val leverage: Int?,
    val memo: String?,
    val tradedAt: LocalDate,
    // --- New fields ---
    val tradeStatus: TradeStatus? = null,
    val entryPrice: Double? = null,
    val stopLoss: Double? = null,
    val takeProfitPrice: Double? = null,
    val positionSize: Double? = null,
    val accountRiskPercent: Double? = null,
    val chartScreenshotUrl: String? = null,
    val timeframes: String? = null,
    val setupType: SetupType? = null,
    val keyLevels: String? = null,
    val emotion: EmotionType? = null,
    val physicalCondition: Int? = null,
    val influencedByLastTrade: Boolean? = null,
    val checkedRuleIds: String? = null,
    val narrative: String? = null,
    val exitPrice: Double? = null,
    val exitDate: LocalDate? = null,
    val realizedPnl: Double? = null,
    val postTradeAnalysis: String? = null,
    val executionResult: ExecutionResult? = null,
    val wouldTakeAgain: Boolean? = null,
    val parentJournalId: Long? = null
)
