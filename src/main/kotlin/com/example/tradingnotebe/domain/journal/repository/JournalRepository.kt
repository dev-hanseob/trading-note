package com.example.tradingnotebe.domain.journal.repository

import com.example.tradingnotebe.domain.journal.entity.Journal
import com.example.tradingnotebe.domain.journal.entity.TradeStatus
import com.example.tradingnotebe.domain.user.entity.UserEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface JournalRepository : JpaRepository<Journal, Long> {
    fun findAllByOrderByTradedAtDesc(pageable: Pageable): Page<Journal>
    fun findByUserOrderByTradedAtDesc(user: UserEntity, pageable: Pageable): Page<Journal>
    fun findByIdAndUser(id: Long, user: UserEntity): Journal?
    fun deleteByIdAndUser(id: Long, user: UserEntity)
    fun findByUserAndTradeStatusOrderByTradedAtDesc(user: UserEntity, tradeStatus: TradeStatus, pageable: Pageable): Page<Journal>
    fun findByUserAndSymbolContainingIgnoreCaseOrderByTradedAtDesc(user: UserEntity, symbol: String, pageable: Pageable): Page<Journal>
    fun findByTradeStatusOrderByTradedAtDesc(tradeStatus: TradeStatus, pageable: Pageable): Page<Journal>
    fun findBySymbolContainingIgnoreCaseOrderByTradedAtDesc(symbol: String, pageable: Pageable): Page<Journal>
}
