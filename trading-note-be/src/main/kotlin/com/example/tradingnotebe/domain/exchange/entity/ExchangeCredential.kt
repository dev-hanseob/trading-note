package com.example.tradingnotebe.domain.exchange.entity

import com.example.tradingnotebe.domain.user.entity.UserEntity
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity(name = "exchange_credential")
@Table(
    indexes = [
        Index(name = "idx_exchange_credential_user_id", columnList = "user_id")
    ]
)
class ExchangeCredential(

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: Long? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "exchange_name", nullable = false)
    val exchangeName: ExchangeName,

    @Column(name = "api_key", nullable = false)
    val apiKey: String,

    @Column(name = "secret_key", nullable = false)
    val secretKey: String,

    @Column(name = "passphrase")
    val passphrase: String? = null,

    @Column(name = "label")
    val label: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: UserEntity,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime? = null
) {
    constructor() : this(
        exchangeName = ExchangeName.BITGET,
        apiKey = "",
        secretKey = "",
        user = UserEntity(email = "default@example.com")
    )
}
