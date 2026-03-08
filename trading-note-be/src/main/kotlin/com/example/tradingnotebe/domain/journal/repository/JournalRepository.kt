package com.example.tradingnotebe.domain.journal.repository

import com.example.tradingnotebe.domain.journal.entity.Journal
import com.example.tradingnotebe.domain.journal.entity.TradeStatus
import com.example.tradingnotebe.domain.user.entity.UserEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface JournalRepository : JpaRepository<Journal, Long> {
    fun findAllByOrderByTradedAtDesc(pageable: Pageable): Page<Journal>
    fun findByUserOrderByTradedAtDesc(user: UserEntity, pageable: Pageable): Page<Journal>
    fun findByUser(user: UserEntity): List<Journal>
    fun findByIdAndUser(id: Long, user: UserEntity): Journal?
    fun deleteByIdAndUser(id: Long, user: UserEntity)
    fun findByUserAndTradeStatusOrderByTradedAtDesc(user: UserEntity, tradeStatus: TradeStatus, pageable: Pageable): Page<Journal>
    fun findByUserAndSymbolContainingIgnoreCaseOrderByTradedAtDesc(user: UserEntity, symbol: String, pageable: Pageable): Page<Journal>
    fun findByTradeStatusOrderByTradedAtDesc(tradeStatus: TradeStatus, pageable: Pageable): Page<Journal>
    fun findBySymbolContainingIgnoreCaseOrderByTradedAtDesc(symbol: String, pageable: Pageable): Page<Journal>

    fun countByUser(user: UserEntity): Long

    @Query("SELECT COUNT(j) FROM journal j WHERE j.user = :user AND j.checkedRuleIds IS NOT NULL AND j.checkedRuleIds <> ''")
    fun countByUserWithCheckedRules(user: UserEntity): Long

    @Query("""
        SELECT FUNCTION('TO_CHAR', j.tradedAt, 'YYYY-MM') AS month,
               COUNT(j) AS totalCount,
               SUM(CASE WHEN j.checkedRuleIds IS NOT NULL AND j.checkedRuleIds <> '' THEN 1 ELSE 0 END) AS checkedCount
        FROM journal j
        WHERE j.user = :user
        GROUP BY FUNCTION('TO_CHAR', j.tradedAt, 'YYYY-MM')
        ORDER BY month
    """)
    fun findMonthlyRuleComplianceStats(user: UserEntity): List<Array<Any>>

    fun existsByExchangeTradeIdAndUser(exchangeTradeId: String, user: UserEntity): Boolean
}
