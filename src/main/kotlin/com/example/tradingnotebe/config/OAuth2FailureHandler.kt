package com.example.tradingnotebe.config

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

@Component
class OAuth2FailureHandler(
    @Value("\${frontend.url}") private val frontendUrl: String
) : SimpleUrlAuthenticationFailureHandler() {
    
    private val logger = LoggerFactory.getLogger(OAuth2FailureHandler::class.java)
    
    override fun onAuthenticationFailure(
        request: HttpServletRequest,
        response: HttpServletResponse,
        exception: AuthenticationException
    ) {
        logger.error("OAuth2 authentication failed: ${exception.message}", exception)
        
        val errorMessage = when (exception.message) {
            "authorization_request_not_found" -> "Authorization request not found. Please try again."
            else -> "Social login failed. Please try again."
        }

        val targetUrl = UriComponentsBuilder.fromUriString("$frontendUrl/login")
            .queryParam("error", "oauth_failed")
            .queryParam("message", errorMessage)
            .encode().build().toUriString()
        
        redirectStrategy.sendRedirect(request, response, targetUrl)
    }
}