package com.example.tradingnotebe.domain.exchange.repository

import com.example.tradingnotebe.domain.exchange.entity.ExchangeCredential
import com.example.tradingnotebe.domain.exchange.entity.ExchangeName
import com.example.tradingnotebe.domain.user.entity.UserEntity
import org.springframework.data.jpa.repository.JpaRepository

interface ExchangeCredentialRepository : JpaRepository<ExchangeCredential, Long> {
    fun findByUserOrderByCreatedAtDesc(user: UserEntity): List<ExchangeCredential>
    fun findByIdAndUser(id: Long, user: UserEntity): ExchangeCredential?
    fun findByUserAndExchangeName(user: UserEntity, exchangeName: ExchangeName): List<ExchangeCredential>
}
