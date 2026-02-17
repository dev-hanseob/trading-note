package com.example.tradingnotebe.domain.user.service

import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.SocialProvider
import com.example.tradingnotebe.domain.user.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.*

@Service
class UserService(
    private val userRepository: UserRepository
) {
    private val log = LoggerFactory.getLogger(UserService::class.java)
    
    fun save(user: User): User {
        return userRepository.save(user)
    }
    
    fun findByEmail(email: String): Optional<User> {
        return userRepository.findByEmail(email)
    }
    
    fun existsByEmail(email: String): Boolean {
        return userRepository.existsByEmail(email)
    }
    
    fun update(user: User): User {
        return userRepository.update(user)
    }
    
    fun findById(id: UUID): Optional<User> {
        return userRepository.findById(id)
    }
    
    fun updateKakaoAccessToken(email: String, accessToken: String): User {
        val existingUser = userRepository.findByEmail(email)
            .orElseThrow { RuntimeException("User not found: $email") }
        
        // 새로운 User 객체 생성 (카카오 액세스 토큰 업데이트)
        val updatedUser = User(
            id = existingUser.id,
            email = existingUser.email,
            password = existingUser.password,
            name = existingUser.name,
            profileImage = existingUser.profileImage,
            provider = existingUser.provider,
            providerId = existingUser.providerId,
            kakaoAccessToken = accessToken,
            createdAt = existingUser.createdAt,
            updatedAt = existingUser.updatedAt
        )
        
        return userRepository.update(updatedUser)
    }
    
    fun findByProviderIdAndProvider(providerId: String, provider: SocialProvider): Optional<User> {
        return userRepository.findByProviderIdAndProvider(providerId, provider)
    }
}