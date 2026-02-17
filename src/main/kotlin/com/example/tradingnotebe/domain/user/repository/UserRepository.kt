package com.example.tradingnotebe.domain.user.repository

import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.SocialProvider
import com.example.tradingnotebe.domain.user.entity.UserEntity
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Repository
class UserRepository(
    private val userJpaRepository: UserJpaRepository
) {
    
    @Transactional
    fun save(user: User): User {
        val userEntity = userJpaRepository.save(UserEntity.toEntity(user))
        return UserEntity.toDomain(userEntity)
    }
    
    fun findByEmail(email: String): Optional<User> {
        return userJpaRepository.findByEmail(email)
            .map { UserEntity.toDomain(it) }
    }
    
    fun existsByEmail(email: String): Boolean {
        return userJpaRepository.existsByEmail(email)
    }
    
    @Transactional
    fun update(user: User): User {
        // ID가 없으면 예외 발생
        val userId = user.id ?: throw IllegalArgumentException("User ID is required for update")
        
        // 기존 엔티티가 존재하는지 확인
        if (!userJpaRepository.existsById(userId)) {
            throw IllegalArgumentException("User not found with id: $userId")
        }
        
        // JPA가 ID를 기준으로 업데이트 수행
        val userEntity = userJpaRepository.save(UserEntity.toEntity(user))
        return UserEntity.toDomain(userEntity)
    }
    
    fun findById(id: UUID): Optional<User> {
        return userJpaRepository.findById(id)
            .map { UserEntity.toDomain(it) }
    }
    
    fun findByProviderIdAndProvider(providerId: String, provider: SocialProvider): Optional<User> {
        return userJpaRepository.findByProviderIdAndProvider(providerId, provider)
            .map { UserEntity.toDomain(it) }
    }
}