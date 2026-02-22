package com.example.tradingnotebe.domain.subscription.service

import com.example.tradingnotebe.domain.journal.repository.JournalRepository
import com.example.tradingnotebe.domain.subscription.client.TossPaymentsClient
import com.example.tradingnotebe.domain.subscription.entity.*
import com.example.tradingnotebe.domain.subscription.repository.PaymentHistoryJpaRepository
import com.example.tradingnotebe.domain.subscription.repository.SubscriptionJpaRepository
import com.example.tradingnotebe.domain.user.entity.UserEntity
import com.example.tradingnotebe.domain.user.repository.UserJpaRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.YearMonth
import java.util.*

@Service
class SubscriptionService(
    private val subscriptionRepo: SubscriptionJpaRepository,
    private val paymentHistoryRepo: PaymentHistoryJpaRepository,
    private val userJpaRepo: UserJpaRepository,
    private val journalRepo: JournalRepository,
    private val tossClient: TossPaymentsClient
) {
    private val log = LoggerFactory.getLogger(javaClass)

    fun getSubscription(userId: UUID): SubscriptionEntity? {
        return subscriptionRepo.findByUserId(userId)
    }

    @Transactional
    fun createTrialSubscription(user: UserEntity): SubscriptionEntity {
        val existing = subscriptionRepo.findByUserId(user.id!!)
        if (existing != null) return existing

        val now = LocalDateTime.now()
        val subscription = SubscriptionEntity(
            user = user,
            tier = PlanTier.BASIC,
            status = SubscriptionStatus.TRIALING,
            customerKey = user.id.toString(),
            trialStartDate = now,
            trialEndDate = now.plusDays(PricingConstants.TRIAL_DAYS)
        )
        return subscriptionRepo.save(subscription)
    }

    @Transactional
    fun confirmBillingAuth(
        userId: UUID,
        authKey: String,
        billingCycle: BillingCycle
    ): SubscriptionEntity {
        val user = userJpaRepo.findById(userId)
            .orElseThrow { IllegalStateException("User not found: $userId") }
        val subscription = subscriptionRepo.findByUserId(userId)
            ?: SubscriptionEntity(
                user = user,
                tier = PlanTier.FREE,
                status = SubscriptionStatus.EXPIRED,
                customerKey = userId.toString()
            ).let { subscriptionRepo.save(it) }

        val billingKeyResponse = tossClient.issueBillingKey(authKey, userId.toString())

        subscription.billingKey = billingKeyResponse.billingKey
        subscription.billingCycle = billingCycle
        subscription.amount = PricingConstants.getAmount(billingCycle)

        val orderId = generateOrderId()
        val orderName = getOrderName(billingCycle)

        val paymentResponse = tossClient.executeBilling(
            billingKey = billingKeyResponse.billingKey,
            customerKey = userId.toString(),
            amount = subscription.amount!!,
            orderId = orderId,
            orderName = orderName
        )

        val paymentHistory = PaymentHistoryEntity(
            subscription = subscription,
            orderId = orderId,
            paymentKey = paymentResponse.paymentKey,
            amount = subscription.amount!!,
            status = PaymentStatus.DONE,
            billingCycle = billingCycle,
            paidAt = LocalDateTime.now()
        )
        paymentHistoryRepo.save(paymentHistory)

        val now = LocalDateTime.now()
        subscription.tier = PlanTier.BASIC
        subscription.status = SubscriptionStatus.ACTIVE
        subscription.currentPeriodStart = now
        subscription.currentPeriodEnd = calculatePeriodEnd(now, billingCycle)
        subscription.failCount = 0
        subscription.cancelledAt = null
        subscription.cancelReason = null

        return subscriptionRepo.save(subscription)
    }

    @Transactional
    fun cancelSubscription(userId: UUID, reason: String?): SubscriptionEntity {
        val subscription = subscriptionRepo.findByUserId(userId)
            ?: throw IllegalStateException("Subscription not found for user: $userId")

        if (subscription.status != SubscriptionStatus.ACTIVE) {
            throw IllegalStateException("Can only cancel an active subscription")
        }

        subscription.status = SubscriptionStatus.CANCELLED
        subscription.cancelledAt = LocalDateTime.now()
        subscription.cancelReason = reason

        return subscriptionRepo.save(subscription)
    }

    @Transactional
    fun reactivateSubscription(userId: UUID): SubscriptionEntity {
        val subscription = subscriptionRepo.findByUserId(userId)
            ?: throw IllegalStateException("Subscription not found for user: $userId")

        if (subscription.status != SubscriptionStatus.CANCELLED) {
            throw IllegalStateException("Can only reactivate a cancelled subscription")
        }

        if (subscription.currentPeriodEnd != null && subscription.currentPeriodEnd!!.isBefore(LocalDateTime.now())) {
            throw IllegalStateException("Subscription period has already ended, please subscribe again")
        }

        subscription.status = SubscriptionStatus.ACTIVE
        subscription.cancelledAt = null
        subscription.cancelReason = null

        return subscriptionRepo.save(subscription)
    }

    @Transactional
    fun processRenewal(subscription: SubscriptionEntity) {
        val billingKey = subscription.billingKey
            ?: run {
                log.warn("No billing key for subscription ${subscription.id}, expiring")
                expireSubscription(subscription)
                return
            }

        val orderId = generateOrderId()
        val orderName = getOrderName(subscription.billingCycle!!)
        val amount = subscription.amount!!

        try {
            val paymentResponse = tossClient.executeBilling(
                billingKey = billingKey,
                customerKey = subscription.customerKey,
                amount = amount,
                orderId = orderId,
                orderName = orderName
            )

            val paymentHistory = PaymentHistoryEntity(
                subscription = subscription,
                orderId = orderId,
                paymentKey = paymentResponse.paymentKey,
                amount = amount,
                status = PaymentStatus.DONE,
                billingCycle = subscription.billingCycle!!,
                paidAt = LocalDateTime.now()
            )
            paymentHistoryRepo.save(paymentHistory)

            val now = LocalDateTime.now()
            subscription.currentPeriodStart = now
            subscription.currentPeriodEnd = calculatePeriodEnd(now, subscription.billingCycle!!)
            subscription.failCount = 0
            subscriptionRepo.save(subscription)

            log.info("Renewal successful for subscription ${subscription.id}")
        } catch (e: Exception) {
            log.error("Renewal failed for subscription ${subscription.id}: ${e.message}")
            handlePaymentFailure(subscription, orderId, e.message)
        }
    }

    @Transactional
    fun handlePaymentFailure(subscription: SubscriptionEntity, orderId: String, failReason: String?) {
        val paymentHistory = PaymentHistoryEntity(
            subscription = subscription,
            orderId = orderId,
            amount = subscription.amount ?: 0,
            status = PaymentStatus.FAILED,
            billingCycle = subscription.billingCycle ?: BillingCycle.MONTHLY,
            failReason = failReason
        )
        paymentHistoryRepo.save(paymentHistory)

        subscription.failCount += 1

        if (subscription.failCount >= PricingConstants.MAX_FAIL_COUNT) {
            expireSubscription(subscription)
            log.warn("Subscription ${subscription.id} expired after ${PricingConstants.MAX_FAIL_COUNT} payment failures")
        } else {
            subscription.status = SubscriptionStatus.PAST_DUE
            subscriptionRepo.save(subscription)
            log.warn("Subscription ${subscription.id} marked as PAST_DUE (fail count: ${subscription.failCount})")
        }
    }

    @Transactional
    fun expireSubscription(subscription: SubscriptionEntity) {
        subscription.tier = PlanTier.FREE
        subscription.status = SubscriptionStatus.EXPIRED
        subscription.billingKey = null
        subscriptionRepo.save(subscription)
    }

    @Transactional
    fun expireTrials() {
        val now = LocalDateTime.now()
        val expiredTrials = subscriptionRepo.findByStatusAndTrialEndDateBefore(
            SubscriptionStatus.TRIALING, now
        )

        for (sub in expiredTrials) {
            sub.tier = PlanTier.FREE
            sub.status = SubscriptionStatus.EXPIRED
            subscriptionRepo.save(sub)
            log.info("Trial expired for subscription ${sub.id}")
        }
    }

    @Transactional
    fun processExpiredCancellations() {
        val now = LocalDateTime.now()
        val cancelled = subscriptionRepo.findByStatusAndCurrentPeriodEndBefore(
            SubscriptionStatus.CANCELLED, now
        )

        for (sub in cancelled) {
            sub.tier = PlanTier.FREE
            sub.status = SubscriptionStatus.EXPIRED
            sub.billingKey = null
            subscriptionRepo.save(sub)
            log.info("Cancelled subscription ${sub.id} expired")
        }
    }

    fun getPaymentHistory(userId: UUID, page: Int, size: Int): Page<PaymentHistoryEntity> {
        val subscription = subscriptionRepo.findByUserId(userId)
            ?: return Page.empty()
        return paymentHistoryRepo.findBySubscriptionIdOrderByCreatedAtDesc(
            subscription.id!!, PageRequest.of(page, size)
        )
    }

    fun getMonthlyTradeCount(userId: UUID): Int {
        val user = userJpaRepo.findById(userId).orElse(null) ?: return 0
        val journals = journalRepo.findByUser(user)
        val monthStart = YearMonth.now().atDay(1).atStartOfDay()
        return journals.count { it.createdAt != null && it.createdAt!! >= monthStart }
    }

    fun getEffectiveTier(userId: UUID): PlanTier {
        val subscription = subscriptionRepo.findByUserId(userId) ?: return PlanTier.FREE
        return when (subscription.status) {
            SubscriptionStatus.TRIALING -> PlanTier.BASIC
            SubscriptionStatus.ACTIVE -> subscription.tier
            SubscriptionStatus.PAST_DUE -> subscription.tier
            SubscriptionStatus.CANCELLED -> {
                if (subscription.currentPeriodEnd != null && subscription.currentPeriodEnd!!.isAfter(LocalDateTime.now())) {
                    subscription.tier
                } else {
                    PlanTier.FREE
                }
            }
            SubscriptionStatus.EXPIRED -> PlanTier.FREE
        }
    }

    private fun calculatePeriodEnd(start: LocalDateTime, cycle: BillingCycle): LocalDateTime {
        return when (cycle) {
            BillingCycle.MONTHLY -> start.plusMonths(1)
            BillingCycle.YEARLY -> start.plusYears(1)
        }
    }

    private fun generateOrderId(): String {
        return "TN-${System.currentTimeMillis()}-${UUID.randomUUID().toString().take(8)}"
    }

    private fun getOrderName(cycle: BillingCycle): String {
        return when (cycle) {
            BillingCycle.MONTHLY -> "Trabit Basic (Monthly)"
            BillingCycle.YEARLY -> "Trabit Basic (Yearly)"
        }
    }
}
