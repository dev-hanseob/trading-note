package com.example.tradingnotebe.domain.exchange.service

import com.example.tradingnotebe.domain.exchange.client.ExchangeClient
import com.example.tradingnotebe.domain.exchange.model.ExchangeTrade
import com.example.tradingnotebe.domain.exchange.model.SyncRequest
import com.example.tradingnotebe.domain.exchange.model.SyncResult
import com.example.tradingnotebe.domain.exchange.repository.ExchangeCredentialRepository
import com.example.tradingnotebe.domain.exchange.util.AesEncryptor
import com.example.tradingnotebe.domain.journal.entity.*
import com.example.tradingnotebe.domain.journal.repository.JournalRepository
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.UserEntity
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import jakarta.transaction.Transactional
import java.time.LocalDate
import java.time.ZoneId

@Service
@Transactional
class ExchangeSyncService(
    private val credentialRepository: ExchangeCredentialRepository,
    private val journalRepository: JournalRepository,
    private val encryptor: AesEncryptor,
    private val exchangeClients: List<ExchangeClient>
) {
    private val log = LoggerFactory.getLogger(ExchangeSyncService::class.java)

    fun sync(request: SyncRequest, user: User): SyncResult {
        val userEntity = UserEntity.toEntity(user)
        val credential = credentialRepository.findByIdAndUser(request.credentialId, userEntity)
            ?: throw IllegalArgumentException("Credential not found")

        val client = exchangeClients.find { it.getExchangeName() == credential.exchangeName }
            ?: throw IllegalArgumentException("Unsupported exchange: ${credential.exchangeName}")

        val startMillis = request.startDate.atStartOfDay(ZoneId.of("UTC")).toInstant().toEpochMilli()
        val endMillis = request.endDate.plusDays(1).atStartOfDay(ZoneId.of("UTC")).toInstant().toEpochMilli()

        val fills = client.fetchClosedTrades(
            apiKey = encryptor.decrypt(credential.apiKey),
            secretKey = encryptor.decrypt(credential.secretKey),
            passphrase = credential.passphrase?.let { encryptor.decrypt(it) },
            startTimeMillis = startMillis,
            endTimeMillis = endMillis
        )

        val groupedOrders = groupFillsByOrderId(fills)

        // Separate by trade type
        val spotOrders = groupedOrders.filter { it.tradeType.lowercase() == "spot" }
        val futuresOrders = groupedOrders.filter { it.tradeType.lowercase() == "futures" }

        // Match futures open/close pairs
        val matchResult = matchOpenClosePairs(futuresOrders)

        var imported = 0
        var skipped = 0
        var failed = 0
        val errors = mutableListOf<String>()

        // Import matched futures trades (open + close -> single journal entry)
        for (matched in matchResult.matchedTrades) {
            try {
                val exchangeTradeId = matched.closeOrder.orderId
                val exists = journalRepository.existsByExchangeTradeIdAndUser(exchangeTradeId, userEntity)
                if (exists) {
                    skipped++
                    continue
                }

                val journal = convertMatchedToJournal(matched, credential.exchangeName, credential.id!!, userEntity)
                journalRepository.save(journal)
                imported++
            } catch (e: Exception) {
                failed++
                errors.add("Failed to import matched trade ${matched.closeOrder.orderId}: ${e.message}")
                log.warn("Failed to import matched trade ${matched.closeOrder.orderId}", e)
            }
        }

        // Import unmatched close orders (close order without matching open in sync period)
        for (order in matchResult.unmatchedCloseOrders) {
            try {
                val exists = journalRepository.existsByExchangeTradeIdAndUser(order.orderId, userEntity)
                if (exists) {
                    skipped++
                    continue
                }

                val journal = convertUnmatchedCloseToJournal(order, credential.exchangeName, credential.id!!, userEntity)
                journalRepository.save(journal)
                imported++
            } catch (e: Exception) {
                failed++
                errors.add("Failed to import unmatched close order ${order.orderId}: ${e.message}")
                log.warn("Failed to import unmatched close order ${order.orderId}", e)
            }
        }

        // Import spot orders (no open/close concept)
        for (order in spotOrders) {
            try {
                val exists = journalRepository.existsByExchangeTradeIdAndUser(order.orderId, userEntity)
                if (exists) {
                    skipped++
                    continue
                }

                val journal = convertSpotToJournal(order, credential.exchangeName, credential.id!!, userEntity)
                journalRepository.save(journal)
                imported++
            } catch (e: Exception) {
                failed++
                errors.add("Failed to import spot order ${order.orderId}: ${e.message}")
                log.warn("Failed to import spot order ${order.orderId}", e)
            }
        }

        // Log summary
        if (matchResult.unmatchedOpenOrders.isNotEmpty()) {
            log.info("${matchResult.unmatchedOpenOrders.size} open orders without matching close (position may still be open or opened before sync period)")
        }
        if (matchResult.unmatchedCloseOrders.isNotEmpty()) {
            log.info("${matchResult.unmatchedCloseOrders.size} close orders without matching open (position may have been opened before sync period)")
        }

        log.info(
            "Exchange sync completed: totalOrders=${groupedOrders.size}, fills=${fills.size}, " +
            "matched=${matchResult.matchedTrades.size}, unmatchedClose=${matchResult.unmatchedCloseOrders.size}, " +
            "spot=${spotOrders.size}, imported=$imported, skipped=$skipped, failed=$failed"
        )
        return SyncResult(imported = imported, skipped = skipped, failed = failed, errors = errors)
    }

    /**
     * Group individual fills by orderId and aggregate into AggregatedOrder.
     * - Weighted average price = sum(price * quantity) / sum(quantity)
     * - Total quantity = sum of all fill quantities
     * - Total fee = sum of all fill fees
     * - Total amount = sum of all fill amounts
     * - Profit = sum of all fill profits (futures only)
     * - First fill time used as traded time
     */
    fun groupFillsByOrderId(fills: List<ExchangeTrade>): List<AggregatedOrder> {
        return fills.groupBy { it.orderId }
            .map { (orderId, orderFills) ->
                val first = orderFills.first()
                val totalQuantity = orderFills.sumOf { it.quantity }
                val totalAmount = orderFills.sumOf { it.amount }
                val totalFee = orderFills.sumOf { it.fee }
                val weightedAvgPrice = if (totalQuantity > 0) {
                    orderFills.sumOf { it.price * it.quantity } / totalQuantity
                } else {
                    first.price
                }
                val totalProfit = orderFills.mapNotNull { it.profit }.takeIf { it.isNotEmpty() }?.sum()
                val earliestTime = orderFills.minOf { it.tradedAt }
                val tradeIds = orderFills.map { it.exchangeTradeId }

                AggregatedOrder(
                    orderId = orderId,
                    tradeIds = tradeIds,
                    symbol = first.symbol,
                    side = first.side,
                    avgPrice = weightedAvgPrice,
                    totalQuantity = totalQuantity,
                    totalAmount = totalAmount,
                    totalFee = totalFee,
                    feeCurrency = first.feeCurrency,
                    tradedAt = earliestTime,
                    leverage = first.leverage,
                    tradeType = first.tradeType,
                    profit = totalProfit,
                    tradeSide = first.tradeSide,
                    fillCount = orderFills.size
                )
            }
    }

    /**
     * Match futures open and close orders into round-trip trades.
     *
     * Bitget futures `side` represents POSITION direction:
     *   - BUY = LONG position, SELL = SHORT position
     *   - Both open and close of the same position share the same `side`
     *
     * Matching key: symbol + side (position direction)
     * Strategy: FIFO (earliest open matched with earliest close)
     */
    fun matchOpenClosePairs(futuresOrders: List<AggregatedOrder>): MatchResult {
        val openOrders = futuresOrders
            .filter { it.tradeSide?.lowercase() == "open" }
            .sortedBy { it.tradedAt }
            .toMutableList()

        val closeOrders = futuresOrders
            .filter { it.tradeSide?.lowercase() == "close" }
            .sortedBy { it.tradedAt }

        val matched = mutableListOf<MatchedTrade>()
        val unmatchedClose = mutableListOf<AggregatedOrder>()

        for (close in closeOrders) {
            val matchingOpen = openOrders.find {
                it.symbol == close.symbol && it.side == close.side
            }
            if (matchingOpen != null) {
                matched.add(MatchedTrade(openOrder = matchingOpen, closeOrder = close))
                openOrders.remove(matchingOpen)
            } else {
                unmatchedClose.add(close)
            }
        }

        log.debug(
            "Matching result: matched=${matched.size}, unmatchedOpen=${openOrders.size}, unmatchedClose=${unmatchedClose.size}"
        )

        return MatchResult(
            matchedTrades = matched,
            unmatchedCloseOrders = unmatchedClose,
            unmatchedOpenOrders = openOrders.toList()
        )
    }

    /**
     * Convert a matched open+close pair into a single CLOSED journal entry.
     *
     * Entry price derivation strategy:
     *   - Profit and exit price come from close order (Bitget API, authoritative)
     *   - Entry price is derived from profit to ensure consistency:
     *     LONG:  entryPrice = exitPrice - (profit / quantity)
     *     SHORT: entryPrice = exitPrice + (profit / quantity)
     *   - Falls back to open order's avg price if derivation fails
     */
    private fun convertMatchedToJournal(
        matched: MatchedTrade,
        exchangeName: com.example.tradingnotebe.domain.exchange.entity.ExchangeName,
        credentialId: Long,
        user: UserEntity
    ): Journal {
        val openOrder = matched.openOrder
        val closeOrder = matched.closeOrder

        val entryDate = LocalDate.ofInstant(openOrder.tradedAt, ZoneId.of("UTC"))
        val exitDate = LocalDate.ofInstant(closeOrder.tradedAt, ZoneId.of("UTC"))

        val position = when (openOrder.side.lowercase()) {
            "buy" -> PositionType.LONG
            "sell" -> PositionType.SHORT
            else -> null
        }

        val totalFee = openOrder.totalFee + closeOrder.totalFee
        val profit = closeOrder.profit ?: 0.0
        val exitPrice = closeOrder.avgPrice
        val quantity = closeOrder.totalQuantity

        // Derive entry price from profit for consistency
        val entryPrice = if (quantity > 0 && closeOrder.profit != null) {
            when (position) {
                PositionType.LONG -> exitPrice - (profit / quantity)
                PositionType.SHORT -> exitPrice + (profit / quantity)
                else -> openOrder.avgPrice
            }
        } else {
            openOrder.avgPrice
        }

        val investment = openOrder.totalAmount
        val roi = if (investment > 0) (profit / investment) * 100 else 0.0

        val feeInfo = if (totalFee > 0) " | fee: ${"%.4f".format(totalFee)} ${openOrder.feeCurrency}" else ""
        val fillInfo = " | ${openOrder.fillCount + closeOrder.fillCount} fills"
        val memo = "Imported from ${exchangeName.name}$feeInfo$fillInfo"

        return Journal(
            assetType = AssetType.CRYPTO,
            tradeType = TradeType.FUTURES,
            position = position,
            currency = "USDT",
            symbol = openOrder.symbol,
            entryPrice = entryPrice,
            exitPrice = exitPrice,
            quantity = quantity,
            investment = investment,
            profit = profit,
            roi = roi,
            leverage = openOrder.leverage ?: closeOrder.leverage,
            tradedAt = entryDate,
            exitDate = exitDate,
            user = user,
            tradeStatus = TradeStatus.CLOSED,
            exchangeName = exchangeName,
            exchangeTradeId = closeOrder.orderId,
            exchangeCredentialId = credentialId,
            memo = memo
        )
    }

    /**
     * Convert an unmatched close order (opened before sync period) into a journal entry.
     * Derive entry price from profit for consistency.
     */
    private fun convertUnmatchedCloseToJournal(
        order: AggregatedOrder,
        exchangeName: com.example.tradingnotebe.domain.exchange.entity.ExchangeName,
        credentialId: Long,
        user: UserEntity
    ): Journal {
        val tradedAt = LocalDate.ofInstant(order.tradedAt, ZoneId.of("UTC"))
        val position = when (order.side.lowercase()) {
            "buy" -> PositionType.LONG
            "sell" -> PositionType.SHORT
            else -> null
        }

        val profit = order.profit ?: 0.0
        val exitPrice = order.avgPrice
        val quantity = order.totalQuantity

        // Derive entry price from profit for consistency
        val entryPrice = if (quantity > 0 && order.profit != null) {
            when (position) {
                PositionType.LONG -> exitPrice - (profit / quantity)
                PositionType.SHORT -> exitPrice + (profit / quantity)
                else -> null
            }
        } else {
            null
        }

        val feeInfo = if (order.totalFee > 0) " | fee: ${"%.4f".format(order.totalFee)} ${order.feeCurrency}" else ""
        val fillInfo = if (order.fillCount > 1) " | ${order.fillCount} fills" else ""
        val memo = "Imported from ${exchangeName.name} (close only)$feeInfo$fillInfo"

        return Journal(
            assetType = AssetType.CRYPTO,
            tradeType = TradeType.FUTURES,
            position = position,
            currency = "USDT",
            symbol = order.symbol,
            entryPrice = entryPrice,
            exitPrice = exitPrice,
            quantity = quantity,
            investment = order.totalAmount,
            profit = profit,
            roi = if (order.totalAmount > 0 && order.profit != null) {
                (order.profit / order.totalAmount) * 100
            } else {
                0.0
            },
            leverage = order.leverage,
            tradedAt = tradedAt,
            exitDate = tradedAt,
            user = user,
            tradeStatus = TradeStatus.CLOSED,
            exchangeName = exchangeName,
            exchangeTradeId = order.orderId,
            exchangeCredentialId = credentialId,
            memo = memo
        )
    }

    /**
     * Convert a spot order into a journal entry (no open/close concept).
     */
    private fun convertSpotToJournal(
        order: AggregatedOrder,
        exchangeName: com.example.tradingnotebe.domain.exchange.entity.ExchangeName,
        credentialId: Long,
        user: UserEntity
    ): Journal {
        val tradedAt = LocalDate.ofInstant(order.tradedAt, ZoneId.of("UTC"))
        val position = when (order.side.lowercase()) {
            "buy" -> PositionType.LONG
            "sell" -> PositionType.SHORT
            else -> null
        }

        val feeInfo = if (order.totalFee > 0) " | fee: ${"%.4f".format(order.totalFee)} ${order.feeCurrency}" else ""
        val fillInfo = if (order.fillCount > 1) " | ${order.fillCount} fills" else ""
        val memo = "Imported from ${exchangeName.name}$feeInfo$fillInfo"

        return Journal(
            assetType = AssetType.CRYPTO,
            tradeType = TradeType.SPOT,
            position = position,
            currency = "USDT",
            symbol = order.symbol,
            entryPrice = order.avgPrice,
            quantity = order.totalQuantity,
            investment = order.totalAmount,
            profit = order.profit ?: 0.0,
            roi = if (order.totalAmount > 0 && order.profit != null) {
                (order.profit / order.totalAmount) * 100
            } else {
                0.0
            },
            leverage = null,
            tradedAt = tradedAt,
            user = user,
            tradeStatus = TradeStatus.CLOSED,
            exchangeName = exchangeName,
            exchangeTradeId = order.orderId,
            exchangeCredentialId = credentialId,
            memo = memo
        )
    }
}

data class AggregatedOrder(
    val orderId: String,
    val tradeIds: List<String>,
    val symbol: String,
    val side: String,
    val avgPrice: Double,
    val totalQuantity: Double,
    val totalAmount: Double,
    val totalFee: Double,
    val feeCurrency: String,
    val tradedAt: java.time.Instant,
    val leverage: Int?,
    val tradeType: String,
    val profit: Double?,
    val tradeSide: String?,
    val fillCount: Int
)

data class MatchedTrade(
    val openOrder: AggregatedOrder,
    val closeOrder: AggregatedOrder
)

data class MatchResult(
    val matchedTrades: List<MatchedTrade>,
    val unmatchedCloseOrders: List<AggregatedOrder>,
    val unmatchedOpenOrders: List<AggregatedOrder>
)
