package com.example.tradingnotebe.domain.subscription.entity

import com.example.tradingnotebe.DateEntity
import com.example.tradingnotebe.domain.user.entity.UserEntity
import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "subscription")
class SubscriptionEntity(

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    val user: UserEntity,

    @Enumerated(EnumType.STRING)
    @Column(name = "tier", nullable = false)
    var tier: PlanTier = PlanTier.FREE,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: SubscriptionStatus = SubscriptionStatus.TRIALING,

    @Column(name = "billing_key")
    var billingKey: String? = null,

    @Column(name = "customer_key", nullable = false, unique = true)
    val customerKey: String = UUID.randomUUID().toString(),

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle")
    var billingCycle: BillingCycle? = null,

    @Column(name = "amount")
    var amount: Int? = null,

    @Column(name = "trial_start_date")
    var trialStartDate: LocalDateTime? = null,

    @Column(name = "trial_end_date")
    var trialEndDate: LocalDateTime? = null,

    @Column(name = "current_period_start")
    var currentPeriodStart: LocalDateTime? = null,

    @Column(name = "current_period_end")
    var currentPeriodEnd: LocalDateTime? = null,

    @Column(name = "cancelled_at")
    var cancelledAt: LocalDateTime? = null,

    @Column(name = "cancel_reason")
    var cancelReason: String? = null,

    @Column(name = "fail_count", nullable = false)
    var failCount: Int = 0,

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
) : DateEntity()
