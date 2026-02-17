package com.example.tradingnotebe.config

import com.example.tradingnotebe.domain.auth.service.SocialLoginService
import com.example.tradingnotebe.util.JwtUtil
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

@Component
class OAuth2SuccessHandler(
    private val socialLoginService: SocialLoginService,
    private val jwtUtil: JwtUtil,
    private val authorizedClientService: OAuth2AuthorizedClientService,
    @Value("\${frontend.url}") private val frontendUrl: String,
    @Value("\${frontend.callback-path}") private val callbackPath: String
) : SimpleUrlAuthenticationSuccessHandler() {
    
    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        val oAuth2User = authentication.principal as OAuth2User
        val oAuth2AuthenticationToken = authentication as OAuth2AuthenticationToken
        val registrationId = oAuth2AuthenticationToken.authorizedClientRegistrationId
        
        // 액세스 토큰 추출 (카카오인 경우)
        var kakaoAccessToken: String? = null
        if (registrationId.equals("kakao", ignoreCase = true)) {
            val authorizedClient: OAuth2AuthorizedClient? = authorizedClientService.loadAuthorizedClient(
                registrationId,
                oAuth2User.name
            )
            kakaoAccessToken = authorizedClient?.accessToken?.tokenValue
        }
        
        val email = socialLoginService.processOAuth2User(oAuth2User, registrationId, kakaoAccessToken)
        val token = jwtUtil.generateToken(email)
        
        val targetUrl = UriComponentsBuilder.fromUriString("$frontendUrl$callbackPath")
            .queryParam("token", token)
            .queryParam("email", email)
            .build().toUriString()
        
        redirectStrategy.sendRedirect(request, response, targetUrl)
    }
}