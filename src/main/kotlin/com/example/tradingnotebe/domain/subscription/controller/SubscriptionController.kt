package com.example.tradingnotebe.domain.subscription.controller

import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.subscription.entity.BillingCycle
import com.example.tradingnotebe.domain.subscription.entity.PlanTier
import com.example.tradingnotebe.domain.subscription.entity.PricingConstants
import com.example.tradingnotebe.domain.subscription.entity.SubscriptionStatus
import com.example.tradingnotebe.domain.subscription.service.SubscriptionService
import com.example.tradingnotebe.domain.user.domain.User
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/subscription")
class SubscriptionController(
    private val subscriptionService: SubscriptionService,
    @Value("\${toss.payments.client-key}") private val clientKey: String
) {

    @GetMapping
    fun getSubscription(@CurrentUser user: User): ResponseEntity<*> {
        val userId = user.id ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("message" to "Unauthorized"))
        val subscription = subscriptionService.getSubscription(userId)
        val monthlyTradeCount = subscriptionService.getMonthlyTradeCount(userId)
        val effectiveTier = subscriptionService.getEffectiveTier(userId)

        val tradeLimit = if (effectiveTier == PlanTier.FREE) PricingConstants.FREE_MONTHLY_TRADE_LIMIT else null

        val response = SubscriptionResponse(
            tier = subscription?.tier?.name ?: PlanTier.FREE.name,
            status = subscription?.status?.name ?: SubscriptionStatus.EXPIRED.name,
            billingCycle = subscription?.billingCycle?.name,
            amount = subscription?.amount,
            currentPeriodStart = subscription?.currentPeriodStart?.toString(),
            currentPeriodEnd = subscription?.currentPeriodEnd?.toString(),
            trialEndDate = subscription?.trialEndDate?.toString(),
            cancelledAt = subscription?.cancelledAt?.toString(),
            tradesUsed = monthlyTradeCount,
            tradeLimit = tradeLimit,
            effectiveTier = effectiveTier.name
        )
        return ResponseEntity.ok(response)
    }

    @PostMapping("/billing")
    fun confirmBilling(
        @CurrentUser user: User,
        @RequestBody request: BillingRequest
    ): ResponseEntity<*> {
        val userId = user.id ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("message" to "Unauthorized"))
        return try {
            val cycle = BillingCycle.valueOf(request.billingCycle)
            val subscription = subscriptionService.confirmBillingAuth(userId, request.authKey, cycle)
            ResponseEntity.ok(mapOf(
                "message" to "Subscription activated",
                "tier" to subscription.tier.name,
                "status" to subscription.status.name,
                "currentPeriodEnd" to subscription.currentPeriodEnd?.toString()
            ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(mapOf("message" to (e.message ?: "Billing confirmation failed")))
        }
    }

    @PostMapping("/cancel")
    fun cancelSubscription(
        @CurrentUser user: User,
        @RequestBody request: CancelRequest?
    ): ResponseEntity<*> {
        val userId = user.id ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("message" to "Unauthorized"))
        return try {
            subscriptionService.cancelSubscription(userId, request?.reason)
            ResponseEntity.ok(mapOf("message" to "Subscription cancelled"))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(mapOf("message" to (e.message ?: "Cancellation failed")))
        }
    }

    @PostMapping("/reactivate")
    fun reactivateSubscription(@CurrentUser user: User): ResponseEntity<*> {
        val userId = user.id ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("message" to "Unauthorized"))
        return try {
            subscriptionService.reactivateSubscription(userId)
            ResponseEntity.ok(mapOf("message" to "Subscription reactivated"))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(mapOf("message" to (e.message ?: "Reactivation failed")))
        }
    }

    @GetMapping("/payments")
    fun getPaymentHistory(
        @CurrentUser user: User,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") pageSize: Int
    ): ResponseEntity<*> {
        val userId = user.id ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("message" to "Unauthorized"))
        val payments = subscriptionService.getPaymentHistory(userId, page - 1, pageSize)
        val items = payments.content.map { p ->
            PaymentHistoryResponse(
                orderId = p.orderId,
                amount = p.amount,
                status = p.status.name,
                billingCycle = p.billingCycle.name,
                paidAt = p.paidAt?.toString(),
                failReason = p.failReason,
                createdAt = p.createdAt.toString()
            )
        }
        return ResponseEntity.ok(mapOf(
            "payments" to items,
            "total" to payments.totalElements,
            "page" to page,
            "pageSize" to pageSize
        ))
    }

    @GetMapping("/client-key")
    fun getClientKey(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(mapOf("clientKey" to clientKey))
    }
}

data class SubscriptionResponse(
    val tier: String,
    val status: String,
    val billingCycle: String?,
    val amount: Int?,
    val currentPeriodStart: String?,
    val currentPeriodEnd: String?,
    val trialEndDate: String?,
    val cancelledAt: String?,
    val tradesUsed: Int,
    val tradeLimit: Int?,
    val effectiveTier: String
)

data class BillingRequest(
    val authKey: String,
    val billingCycle: String
)

data class CancelRequest(
    val reason: String?
)

data class PaymentHistoryResponse(
    val orderId: String,
    val amount: Int,
    val status: String,
    val billingCycle: String,
    val paidAt: String?,
    val failReason: String?,
    val createdAt: String
)
