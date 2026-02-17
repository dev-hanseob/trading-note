package com.example.tradingnotebe.domain.seed.entity

import com.example.tradingnotebe.DateEntity
import com.example.tradingnotebe.domain.seed.domain.Seed
import com.example.tradingnotebe.domain.user.entity.UserEntity
import jakarta.persistence.*
import java.math.BigDecimal

@Entity(name = "seed")
class SeedEntity(
    @Column(name = "price")
    val price: BigDecimal,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: UserEntity,
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: Long? = null
) : DateEntity() {
    
    constructor() : this(BigDecimal.ZERO, UserEntity(email = "default@example.com"), null)
    
    fun changeSeed(price: BigDecimal): SeedEntity = SeedEntity(price, this.user, this.id)
    
    companion object {
        fun toEntity(seed: Seed): SeedEntity {
            val userEntity = seed.userId?.let { userId ->
                UserEntity(email = "user@example.com").apply {}
            } ?: UserEntity(email = "default@example.com")
            return SeedEntity(seed.price, userEntity, seed.id)
        }
        
        fun toDomain(seedEntity: SeedEntity): Seed = Seed(
            id = seedEntity.id, 
            price = seedEntity.price,
            userId = seedEntity.user.id
        )
    }
}