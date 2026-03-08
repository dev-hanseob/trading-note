package com.example.tradingnotebe.domain.subscription.scheduler

import com.example.tradingnotebe.domain.subscription.entity.SubscriptionStatus
import com.example.tradingnotebe.domain.subscription.repository.SubscriptionJpaRepository
import com.example.tradingnotebe.domain.subscription.service.SubscriptionService
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDateTime

@Component
class BillingScheduler(
    private val subscriptionRepo: SubscriptionJpaRepository,
    private val subscriptionService: SubscriptionService
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(cron = "0 5 0 * * *")
    fun processRenewals() {
        log.info("Starting billing renewal process")
        val now = LocalDateTime.now()

        val dueSubscriptions = subscriptionRepo.findByStatusAndCurrentPeriodEndBefore(
            SubscriptionStatus.ACTIVE, now
        )

        log.info("Found ${dueSubscriptions.size} subscriptions due for renewal")

        for (sub in dueSubscriptions) {
            try {
                subscriptionService.processRenewal(sub)
            } catch (e: Exception) {
                log.error("Failed to process renewal for subscription ${sub.id}: ${e.message}")
            }
        }

        val pastDue = subscriptionRepo.findByStatusAndCurrentPeriodEndBefore(
            SubscriptionStatus.PAST_DUE, now
        )

        log.info("Found ${pastDue.size} past-due subscriptions to retry")

        for (sub in pastDue) {
            try {
                subscriptionService.processRenewal(sub)
            } catch (e: Exception) {
                log.error("Failed to retry payment for subscription ${sub.id}: ${e.message}")
            }
        }
    }

    @Scheduled(cron = "0 10 0 * * *")
    fun processTrialExpirations() {
        log.info("Starting trial expiration process")
        subscriptionService.expireTrials()
    }

    @Scheduled(cron = "0 15 0 * * *")
    fun processCancelledExpirations() {
        log.info("Starting cancelled subscription expiration process")
        subscriptionService.processExpiredCancellations()
    }
}
