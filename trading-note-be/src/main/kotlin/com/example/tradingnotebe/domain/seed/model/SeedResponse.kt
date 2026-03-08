package com.example.tradingnotebe.domain.seed.model

import com.example.tradingnotebe.domain.seed.domain.Seed
import java.math.BigDecimal

data class SeedResponse(
    val id: Long,
    val price: BigDecimal,
    val currency: String
) {
    companion object {
        fun from(seed: Seed): SeedResponse {
            return SeedResponse(
                id = seed.id!!,
                price = seed.price,
                currency = seed.currency
            )
        }
    }
}
