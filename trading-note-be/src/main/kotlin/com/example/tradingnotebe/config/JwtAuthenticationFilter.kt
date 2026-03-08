package com.example.tradingnotebe.config

import com.example.tradingnotebe.domain.user.service.UserService
import com.example.tradingnotebe.util.JwtUtil
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtUtil: JwtUtil,
    private val userService: UserService
) : OncePerRequestFilter() {
    
    private val logger = LoggerFactory.getLogger(JwtAuthenticationFilter::class.java)
    
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val authHeader = request.getHeader("Authorization")
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                val token = authHeader.substring(7)
                
                try {
                    // JWT 토큰에서 이메일 추출
                    val email = jwtUtil.extractEmail(token)
                    
                    // 사용자 정보 조회
                    val userOptional = userService.findByEmail(email)
                    
                    if (userOptional.isPresent && jwtUtil.validateToken(token, email)) {
                        val user = userOptional.get()
                        
                        // 권한 설정 (기본적으로 ROLE_USER)
                        val authorities = listOf(SimpleGrantedAuthority("ROLE_USER"))
                        
                        // Authentication 객체 생성
                        val authToken = UsernamePasswordAuthenticationToken(
                            user, // principal에 User 객체 저장
                            null,
                            authorities
                        )
                        
                        authToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                        
                        // SecurityContext에 인증 정보 설정
                        SecurityContextHolder.getContext().authentication = authToken
                        
                        logger.debug("JWT authentication successful for user: $email")
                    } else {
                        logger.warn("Invalid JWT token or user not found: $email")
                    }
                } catch (e: Exception) {
                    logger.warn("JWT token validation failed: ${e.message}", e)
                }
            }
        } catch (e: Exception) {
            logger.error("JWT authentication filter error: ${e.message}", e)
        }
        
        filterChain.doFilter(request, response)
    }
}