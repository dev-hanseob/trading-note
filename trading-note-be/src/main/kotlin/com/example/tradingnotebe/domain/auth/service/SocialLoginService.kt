package com.example.tradingnotebe.domain.auth.service

import com.example.tradingnotebe.domain.subscription.service.SubscriptionService
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.SocialProvider
import com.example.tradingnotebe.domain.user.repository.UserJpaRepository
import com.example.tradingnotebe.domain.user.service.UserService
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service

@Service
class SocialLoginService(
    private val userService: UserService,
    private val objectMapper: ObjectMapper,
    private val subscriptionService: SubscriptionService,
    private val userJpaRepository: UserJpaRepository
) {
    private val log = LoggerFactory.getLogger(SocialLoginService::class.java)
    
    fun processOAuth2User(oAuth2User: OAuth2User, registrationId: String, kakaoAccessToken: String? = null): String {
        val provider = SocialProvider.valueOf(registrationId.uppercase())
        
        val prettyJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(oAuth2User.attributes)
        log.info("OAuth2User attributes for {}:\n{}", provider, prettyJson)
        
        val originalEmail = extractEmail(oAuth2User, provider)
        val name = extractName(oAuth2User, provider)
        val profileImage = extractProfileImage(oAuth2User, provider)
        val providerId = extractProviderId(oAuth2User, provider)
        
        // 이메일이 없는 경우 임시 이메일 생성
        val email = originalEmail ?: "${provider.name.lowercase()}.${providerId}@temp.social"
        
        // providerId로 먼저 조회 (이메일이 없는 사용자도 처리 가능)
        val existingUser = userService.findByProviderIdAndProvider(providerId, provider)
        
        return if (existingUser.isPresent) {
            val user = existingUser.get()
            // 기존 사용자인 경우 카카오 액세스 토큰 업데이트 (카카오 로그인일 때만)
            if (provider == SocialProvider.KAKAO && kakaoAccessToken != null && user.email != null) {
                userService.updateKakaoAccessToken(user.email, kakaoAccessToken)
            }
            user.email!!
        } else {
            val newUser = User(email, name, profileImage, provider, providerId, kakaoAccessToken)
            val savedUser = userService.save(newUser)
            val userEntity = userJpaRepository.findById(savedUser.id!!).orElse(null)
            if (userEntity != null) {
                subscriptionService.createTrialSubscription(userEntity)
            }
            savedUser.email!!
        }
    }
    
    private fun extractEmail(oAuth2User: OAuth2User, provider: SocialProvider): String? {
        return when (provider) {
            SocialProvider.GOOGLE -> oAuth2User.getAttribute<String>("email")
            SocialProvider.KAKAO -> {
                val kakaoAccount = oAuth2User.getAttribute<Map<String, Any>>("kakao_account")
                log.info("Kakao account data: {}", kakaoAccount)
                kakaoAccount?.get("email") as? String
            }
            SocialProvider.NAVER -> {
                val response = oAuth2User.getAttribute<Map<String, Any>>("response")
                response?.get("email") as? String
            }
            SocialProvider.APPLE -> oAuth2User.getAttribute<String>("email")
            else -> throw RuntimeException("Unsupported social provider: $provider")
        }
    }
    
    private fun extractName(oAuth2User: OAuth2User, provider: SocialProvider): String? {
        return when (provider) {
            SocialProvider.GOOGLE -> oAuth2User.getAttribute("name")
            SocialProvider.KAKAO -> {
                val kakaoAccount = oAuth2User.getAttribute<Map<String, Any>>("kakao_account")
                val profile = kakaoAccount?.get("profile") as? Map<String, Any>
                profile?.get("nickname") as? String
            }
            SocialProvider.NAVER -> {
                val response = oAuth2User.getAttribute<Map<String, Any>>("response")
                response?.get("name") as? String
            }
            SocialProvider.APPLE -> oAuth2User.getAttribute("name")
            else -> throw RuntimeException("Unsupported social provider: $provider")
        }
    }
    
    private fun extractProfileImage(oAuth2User: OAuth2User, provider: SocialProvider): String? {
        return when (provider) {
            SocialProvider.GOOGLE -> oAuth2User.getAttribute("picture")
            SocialProvider.KAKAO -> {
                val kakaoAccount = oAuth2User.getAttribute<Map<String, Any>>("kakao_account")
                val profile = kakaoAccount?.get("profile") as? Map<String, Any>
                profile?.get("profile_image_url") as? String
            }
            SocialProvider.NAVER -> {
                val response = oAuth2User.getAttribute<Map<String, Any>>("response")
                response?.get("profile_image") as? String
            }
            SocialProvider.APPLE -> null // Apple doesn't provide profile image
            else -> throw RuntimeException("Unsupported social provider: $provider")
        }
    }
    
    private fun extractProviderId(oAuth2User: OAuth2User, provider: SocialProvider): String {
        return when (provider) {
            SocialProvider.GOOGLE -> oAuth2User.getAttribute<String>("sub")!!
            SocialProvider.KAKAO -> oAuth2User.getAttribute<Any>("id")!!.toString()
            SocialProvider.NAVER -> {
                val response = oAuth2User.getAttribute<Map<String, Any>>("response")
                response?.get("id")?.toString() ?: throw RuntimeException("No provider ID found")
            }
            SocialProvider.APPLE -> oAuth2User.getAttribute<String>("sub")!!
            else -> throw RuntimeException("Unsupported social provider: $provider")
        }
    }
}