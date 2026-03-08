package com.example.tradingnotebe.domain.user.repository

import com.example.tradingnotebe.domain.user.entity.SocialProvider
import com.example.tradingnotebe.domain.user.entity.UserEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface UserJpaRepository : JpaRepository<UserEntity, UUID> {
    fun findByEmail(email: String): Optional<UserEntity>
    fun existsByEmail(email: String): Boolean
    fun findByProviderIdAndProvider(providerId: String, provider: SocialProvider): Optional<UserEntity>
}