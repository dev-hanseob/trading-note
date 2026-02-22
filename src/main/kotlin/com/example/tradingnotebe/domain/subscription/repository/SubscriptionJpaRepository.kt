package com.example.tradingnotebe.domain.subscription.repository

import com.example.tradingnotebe.domain.subscription.entity.SubscriptionEntity
import com.example.tradingnotebe.domain.subscription.entity.SubscriptionStatus
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime
import java.util.*

interface SubscriptionJpaRepository : JpaRepository<SubscriptionEntity, UUID> {

    fun findByUserId(userId: UUID): SubscriptionEntity?

    fun findByCustomerKey(customerKey: String): SubscriptionEntity?

    fun findByStatusAndCurrentPeriodEndBefore(
        status: SubscriptionStatus,
        dateTime: LocalDateTime
    ): List<SubscriptionEntity>

    fun findByStatusAndTrialEndDateBefore(
        status: SubscriptionStatus,
        dateTime: LocalDateTime
    ): List<SubscriptionEntity>
}
