package com.example.tradingnotebe.domain.subscription.entity

object PricingConstants {
    const val BASIC_MONTHLY = 14_900
    const val BASIC_YEARLY_MONTHLY = 10_400
    const val BASIC_YEARLY_TOTAL = 124_800
    const val TRIAL_DAYS = 14L
    const val MAX_FAIL_COUNT = 3
    const val FREE_MONTHLY_TRADE_LIMIT = 30
    const val FREE_DATA_RETENTION_DAYS = 30

    fun getAmount(cycle: BillingCycle): Int {
        return when (cycle) {
            BillingCycle.MONTHLY -> BASIC_MONTHLY
            BillingCycle.YEARLY -> BASIC_YEARLY_TOTAL
        }
    }
}
