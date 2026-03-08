package com.example.tradingnotebe.domain.user.domain

import com.example.tradingnotebe.domain.user.entity.SocialProvider
import java.time.LocalDateTime
import java.util.*

data class User(
    val id: UUID? = null,
    val email: String?,
    val password: String? = null,
    val name: String? = null,
    val profileImage: String? = null,
    val provider: SocialProvider = SocialProvider.LOCAL,
    val providerId: String? = null,
    val kakaoAccessToken: String? = null,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
) {
    constructor(email: String, password: String) : this(
        email = email,
        password = password,
        provider = SocialProvider.LOCAL
    )
    
    constructor(
        email: String?,
        name: String?,
        profileImage: String?,
        provider: SocialProvider,
        providerId: String?,
        kakaoAccessToken: String? = null
    ) : this(
        email = email,
        password = null,
        name = name,
        profileImage = profileImage,
        provider = provider,
        providerId = providerId,
        kakaoAccessToken = kakaoAccessToken
    )
}