package com.example.tradingnotebe.domain.journal.service

import com.example.tradingnotebe.domain.journal.entity.Journal
import com.example.tradingnotebe.domain.journal.entity.TradeStatus
import com.example.tradingnotebe.domain.journal.model.AddJournalRequest
import com.example.tradingnotebe.domain.journal.model.ClosePositionRequest
import com.example.tradingnotebe.domain.journal.model.JournalResponse
import com.example.tradingnotebe.domain.journal.repository.JournalRepository
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.UserEntity
import com.example.tradingnotebe.domain.user.repository.UserJpaRepository
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime

@Transactional
@Service
class JournalService(
    private val journalRepository: JournalRepository,
    private val userJpaRepository: UserJpaRepository
) {

    fun createJournal(request: AddJournalRequest, user: User): JournalResponse {
        val userEntity = UserEntity.toEntity(user)
        val journal = Journal(
            assetType = request.assetType,
            tradeType = request.tradeType,
            position = request.position,
            currency = request.currency,
            symbol = request.symbol,
            buyPrice = request.buyPrice,
            investment = request.investment,
            profit = request.profit,
            roi = request.roi,
            quantity = request.quantity,
            leverage = request.leverage,
            memo = request.memo,
            tradedAt = request.tradedAt,
            user = userEntity,
            tradeStatus = request.tradeStatus,
            entryPrice = request.entryPrice,
            stopLoss = request.stopLoss,
            takeProfitPrice = request.takeProfitPrice,
            positionSize = request.positionSize,
            accountRiskPercent = request.accountRiskPercent,
            chartScreenshotUrl = request.chartScreenshotUrl,
            timeframes = request.timeframes,
            setupType = request.setupType,
            keyLevels = request.keyLevels,
            emotion = request.emotion,
            physicalCondition = request.physicalCondition,
            influencedByLastTrade = request.influencedByLastTrade,
            checkedRuleIds = request.checkedRuleIds,
            narrative = request.narrative,
            exitPrice = request.exitPrice,
            exitDate = request.exitDate,
            realizedPnl = request.realizedPnl,
            postTradeAnalysis = request.postTradeAnalysis,
            executionResult = request.executionResult,
            wouldTakeAgain = request.wouldTakeAgain,
            parentJournalId = request.parentJournalId
        )
        val saved = journalRepository.save(journal)
        return JournalResponse.from(saved)
    }

    fun updateJournal(id: Long, request: AddJournalRequest, user: User): JournalResponse {
        val existing = journalRepository.findById(id).orElseThrow {
            IllegalArgumentException("Journal not found with id: $id")
        }

        val updated = Journal(
            id = existing.id,
            assetType = request.assetType,
            tradeType = request.tradeType,
            position = request.position,
            currency = request.currency,
            symbol = request.symbol,
            buyPrice = request.buyPrice,
            investment = request.investment,
            profit = request.profit,
            roi = request.roi,
            quantity = request.quantity,
            leverage = request.leverage,
            memo = request.memo,
            tradedAt = request.tradedAt,
            user = existing.user,
            tradeStatus = request.tradeStatus,
            entryPrice = request.entryPrice,
            stopLoss = request.stopLoss,
            takeProfitPrice = request.takeProfitPrice,
            positionSize = request.positionSize,
            accountRiskPercent = request.accountRiskPercent,
            chartScreenshotUrl = request.chartScreenshotUrl,
            timeframes = request.timeframes,
            setupType = request.setupType,
            keyLevels = request.keyLevels,
            emotion = request.emotion,
            physicalCondition = request.physicalCondition,
            influencedByLastTrade = request.influencedByLastTrade,
            checkedRuleIds = request.checkedRuleIds,
            narrative = request.narrative,
            exitPrice = request.exitPrice,
            exitDate = request.exitDate,
            realizedPnl = request.realizedPnl,
            postTradeAnalysis = request.postTradeAnalysis,
            executionResult = request.executionResult,
            wouldTakeAgain = request.wouldTakeAgain,
            parentJournalId = request.parentJournalId,
            updatedAt = LocalDateTime.now()
        )
        val saved = journalRepository.save(updated)
        return JournalResponse.from(saved)
    }

    fun closePosition(id: Long, request: ClosePositionRequest, user: User): JournalResponse {
        val existing = journalRepository.findById(id).orElseThrow {
            IllegalArgumentException("Journal not found with id: $id")
        }

        if (existing.tradeStatus != TradeStatus.OPEN) {
            throw IllegalStateException("Only OPEN positions can be closed")
        }

        val closed = Journal(
            id = existing.id,
            assetType = existing.assetType,
            tradeType = existing.tradeType,
            position = existing.position,
            currency = existing.currency,
            symbol = existing.symbol,
            buyPrice = existing.buyPrice,
            investment = existing.investment,
            profit = existing.profit,
            roi = existing.roi,
            quantity = existing.quantity,
            leverage = existing.leverage,
            memo = existing.memo,
            tradedAt = existing.tradedAt,
            user = existing.user,
            tradeStatus = TradeStatus.CLOSED,
            entryPrice = existing.entryPrice,
            stopLoss = existing.stopLoss,
            takeProfitPrice = existing.takeProfitPrice,
            positionSize = existing.positionSize,
            accountRiskPercent = existing.accountRiskPercent,
            chartScreenshotUrl = existing.chartScreenshotUrl,
            timeframes = existing.timeframes,
            setupType = existing.setupType,
            keyLevels = existing.keyLevels,
            emotion = existing.emotion,
            physicalCondition = existing.physicalCondition,
            influencedByLastTrade = existing.influencedByLastTrade,
            checkedRuleIds = existing.checkedRuleIds,
            narrative = existing.narrative,
            exitPrice = request.exitPrice,
            exitDate = request.exitDate ?: LocalDate.now(),
            realizedPnl = request.realizedPnl,
            postTradeAnalysis = request.postTradeAnalysis,
            executionResult = request.executionResult,
            wouldTakeAgain = request.wouldTakeAgain,
            parentJournalId = existing.parentJournalId,
            updatedAt = LocalDateTime.now()
        )
        val saved = journalRepository.save(closed)
        return JournalResponse.from(saved)
    }

    // TODO: dev workaround - filtering disabled, returns all journals
    fun findByUser(user: User?, pageable: Pageable, status: TradeStatus?, search: String?): Page<JournalResponse> {
        val page = when {
            status != null -> journalRepository.findByTradeStatusOrderByTradedAtDesc(status, pageable)
            !search.isNullOrBlank() -> journalRepository.findBySymbolContainingIgnoreCaseOrderByTradedAtDesc(search, pageable)
            else -> journalRepository.findAllByOrderByTradedAtDesc(pageable)
        }
        return page.map { JournalResponse.from(it) }
    }

    // TODO: dev workaround - returns all OPEN positions regardless of user
    fun getOpenPositions(user: User?, pageable: Pageable): Page<JournalResponse> {
        val page = journalRepository.findByTradeStatusOrderByTradedAtDesc(TradeStatus.OPEN, pageable)
        return page.map { JournalResponse.from(it) }
    }

    fun findByIdAndUser(id: Long, user: User): JournalResponse? {
        val userEntity = UserEntity.toEntity(user)
        val journal = journalRepository.findByIdAndUser(id, userEntity) ?: return null
        return JournalResponse.from(journal)
    }

    fun deleteByIdAndUser(id: Long, user: User) {
        val userId = user.id ?: throw IllegalArgumentException("User ID is required")
        val userEntity = userJpaRepository.findById(userId).orElseThrow {
            IllegalArgumentException("User not found")
        }
        journalRepository.deleteByIdAndUser(id, userEntity)
    }

    // Legacy methods (kept for compatibility)
    fun save(journal: Journal): Journal {
        return journalRepository.save(journal)
    }

    fun findAll(pageable: Pageable): Page<Journal> {
        return journalRepository.findAllByOrderByTradedAtDesc(pageable)
    }

    fun findById(id: Long): Journal? {
        return journalRepository.findById(id).orElse(null)
    }

    fun deleteById(id: Long) {
        journalRepository.deleteById(id)
    }
}
