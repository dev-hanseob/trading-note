package com.example.tradingnotebe.domain.journal.entity

import com.example.tradingnotebe.DateEntity
import com.example.tradingnotebe.domain.user.entity.UserEntity
import jakarta.persistence.*

@Entity(name = "trading_rule")
class TradingRule(

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: Long? = null,

    @Column(name = "label", nullable = false)
    val label: String,

    @Column(name = "display_order", nullable = false)
    val displayOrder: Int,

    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: UserEntity
) : DateEntity() {

    constructor() : this(
        label = "",
        displayOrder = 0,
        user = UserEntity(email = "default@example.com")
    )
}
