package com.example.tradingnotebe.domain.journal.model

import com.example.tradingnotebe.domain.journal.entity.*
import java.time.LocalDate
import java.time.LocalDateTime
import kotlin.math.abs

data class JournalResponse(
    val id: Long?,
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
    val createdAt: LocalDateTime,
    // New fields
    val tradeStatus: TradeStatus?,
    val entryPrice: Double?,
    val stopLoss: Double?,
    val takeProfitPrice: Double?,
    val positionSize: Double?,
    val accountRiskPercent: Double?,
    val chartScreenshotUrl: String?,
    val timeframes: String?,
    val setupType: SetupType?,
    val keyLevels: String?,
    val emotion: EmotionType?,
    val physicalCondition: Int?,
    val influencedByLastTrade: Boolean?,
    val checkedRuleIds: String?,
    val narrative: String?,
    val exitPrice: Double?,
    val exitDate: LocalDate?,
    val realizedPnl: Double?,
    val postTradeAnalysis: String?,
    val executionResult: ExecutionResult?,
    val wouldTakeAgain: Boolean?,
    val parentJournalId: Long?,
    val updatedAt: LocalDateTime?,
    // Computed fields
    val liquidationPrice: Double?,
    val maxLossAmount: Double?,
    val riskRewardRatio: Double?
) {
    companion object {
        fun from(journal: Journal): JournalResponse {
            return JournalResponse(
                id = journal.id,
                assetType = journal.assetType,
                tradeType = journal.tradeType,
                position = journal.position,
                currency = journal.currency,
                symbol = journal.symbol,
                buyPrice = journal.buyPrice,
                investment = journal.investment,
                profit = journal.profit,
                roi = journal.roi,
                quantity = journal.quantity,
                leverage = journal.leverage,
                memo = journal.memo,
                tradedAt = journal.tradedAt,
                createdAt = journal.createdAt,
                tradeStatus = journal.tradeStatus,
                entryPrice = journal.entryPrice,
                stopLoss = journal.stopLoss,
                takeProfitPrice = journal.takeProfitPrice,
                positionSize = journal.positionSize,
                accountRiskPercent = journal.accountRiskPercent,
                chartScreenshotUrl = journal.chartScreenshotUrl,
                timeframes = journal.timeframes,
                setupType = journal.setupType,
                keyLevels = journal.keyLevels,
                emotion = journal.emotion,
                physicalCondition = journal.physicalCondition,
                influencedByLastTrade = journal.influencedByLastTrade,
                checkedRuleIds = journal.checkedRuleIds,
                narrative = journal.narrative,
                exitPrice = journal.exitPrice,
                exitDate = journal.exitDate,
                realizedPnl = journal.realizedPnl,
                postTradeAnalysis = journal.postTradeAnalysis,
                executionResult = journal.executionResult,
                wouldTakeAgain = journal.wouldTakeAgain,
                parentJournalId = journal.parentJournalId,
                updatedAt = journal.updatedAt,
                liquidationPrice = computeLiquidationPrice(journal),
                maxLossAmount = computeMaxLossAmount(journal),
                riskRewardRatio = computeRiskRewardRatio(journal)
            )
        }

        private fun computeLiquidationPrice(journal: Journal): Double? {
            val entryPrice = journal.entryPrice ?: return null
            val leverage = journal.leverage ?: return null
            if (leverage == 0) return null
            val position = journal.position ?: return null

            return when (position) {
                PositionType.LONG -> entryPrice * (1.0 - 1.0 / leverage)
                PositionType.SHORT -> entryPrice * (1.0 + 1.0 / leverage)
            }
        }

        private fun computeMaxLossAmount(journal: Journal): Double? {
            val entryPrice = journal.entryPrice ?: return null
            val stopLoss = journal.stopLoss ?: return null
            val quantity = journal.quantity ?: return null
            val leverage = journal.leverage ?: return null

            return abs(entryPrice - stopLoss) * quantity * leverage
        }

        private fun computeRiskRewardRatio(journal: Journal): Double? {
            val entryPrice = journal.entryPrice ?: return null
            val stopLoss = journal.stopLoss ?: return null
            val takeProfitPrice = journal.takeProfitPrice ?: return null

            val risk = abs(entryPrice - stopLoss)
            if (risk == 0.0) return null

            return abs(takeProfitPrice - entryPrice) / risk
        }
    }
}
