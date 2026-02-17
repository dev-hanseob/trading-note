package com.example.tradingnotebe.domain.journal.repository

import com.example.tradingnotebe.domain.journal.entity.TradingRule
import com.example.tradingnotebe.domain.user.entity.UserEntity
import org.springframework.data.jpa.repository.JpaRepository

interface TradingRuleRepository : JpaRepository<TradingRule, Long> {
    fun findByUserOrderByDisplayOrderAsc(user: UserEntity): List<TradingRule>
    fun findByIdAndUser(id: Long, user: UserEntity): TradingRule?
    fun deleteByIdAndUser(id: Long, user: UserEntity)
    fun findAllByOrderByDisplayOrderAsc(): List<TradingRule>
}
