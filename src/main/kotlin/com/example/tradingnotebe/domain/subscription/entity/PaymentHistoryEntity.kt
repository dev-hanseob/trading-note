package com.example.tradingnotebe.domain.subscription.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "payment_history")
class PaymentHistoryEntity(

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    val subscription: SubscriptionEntity,

    @Column(name = "order_id", nullable = false, unique = true)
    val orderId: String,

    @Column(name = "payment_key")
    var paymentKey: String? = null,

    @Column(name = "amount", nullable = false)
    val amount: Int,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: PaymentStatus = PaymentStatus.PENDING,

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false)
    val billingCycle: BillingCycle,

    @Column(name = "paid_at")
    var paidAt: LocalDateTime? = null,

    @Column(name = "fail_reason")
    var failReason: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
)
