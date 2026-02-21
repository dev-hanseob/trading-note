package com.example.tradingnotebe.domain.seed.domain

import java.math.BigDecimal
import java.util.*

data class Seed(
    val id: Long? = null,
    val price: BigDecimal,
    val currency: String = "KRW",
    val userId: UUID? = null
)