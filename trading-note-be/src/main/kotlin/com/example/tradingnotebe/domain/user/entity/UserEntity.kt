package com.example.tradingnotebe.domain.user.entity

import com.example.tradingnotebe.DateEntity
import com.example.tradingnotebe.domain.user.domain.User
import jakarta.persistence.*
import java.util.*

@Entity(name = "app_user")
class UserEntity(
    @Column(name = "email", nullable = true, unique = true)
    val email: String?,
    
    @Column(name = "password")
    val password: String? = null,
    
    @Column(name = "name")
    val name: String? = null,
    
    @Column(name = "profile_image")
    val profileImage: String? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    val provider: SocialProvider = SocialProvider.LOCAL,
    
    @Column(name = "provider_id")
    val providerId: String? = null,
    
    @Column(name = "kakao_access_token")
    val kakaoAccessToken: String? = null,
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
) : DateEntity() {
    
    companion object {
        fun toEntity(user: User): UserEntity {
            return UserEntity(
                email = user.email,
                password = user.password,
                name = user.name,
                profileImage = user.profileImage,
                provider = user.provider,
                providerId = user.providerId,
                kakaoAccessToken = user.kakaoAccessToken,
                id = user.id
            )
        }
        
        fun toDomain(userEntity: UserEntity): User {
            return User(
                id = userEntity.id,
                email = userEntity.email,
                password = userEntity.password,
                name = userEntity.name,
                profileImage = userEntity.profileImage,
                provider = userEntity.provider,
                providerId = userEntity.providerId,
                kakaoAccessToken = userEntity.kakaoAccessToken,
                createdAt = userEntity.createdAt,
                updatedAt = userEntity.updatedAt
            )
        }
    }
}