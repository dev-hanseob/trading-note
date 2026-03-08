package com.example.tradingnotebe.domain.subscription.repository

import com.example.tradingnotebe.domain.subscription.entity.PaymentHistoryEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface PaymentHistoryJpaRepository : JpaRepository<PaymentHistoryEntity, UUID> {

    fun findBySubscriptionIdOrderByCreatedAtDesc(
        subscriptionId: UUID,
        pageable: Pageable
    ): Page<PaymentHistoryEntity>

    fun findByOrderId(orderId: String): PaymentHistoryEntity?
}
