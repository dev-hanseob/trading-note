package com.example.tradingnotebe.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.util.ContentCachingRequestWrapper
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class CustomRequestLoggingFilter : OncePerRequestFilter() {

    private val logger = LoggerFactory.getLogger(CustomRequestLoggingFilter::class.java)
    private val timeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val startTime = System.currentTimeMillis()
        val requestId = UUID.randomUUID().toString().substring(0, 8)
        
        // MDC에 요청 ID 설정
        MDC.put("requestId", requestId)
        
        // Request Body를 읽기 위해 ContentCachingRequestWrapper 사용
        val wrappedRequest = if (request !is ContentCachingRequestWrapper) {
            ContentCachingRequestWrapper(request)
        } else {
            request
        }
        
        try {
            // 요청 시작 로깅
            logRequestStart(wrappedRequest, requestId)
            
            // 다음 필터 실행
            filterChain.doFilter(wrappedRequest, response)
            
            // 요청 완료 후 body 로깅
            logRequestBody(wrappedRequest, requestId)
            
            // 응답 완료 로깅
            val duration = System.currentTimeMillis() - startTime
            logResponse(response, requestId, duration)
            
        } finally {
            MDC.clear()
        }
    }

    private fun logRequestStart(request: HttpServletRequest, requestId: String) {
        val method = request.method
        val uri = request.requestURI
        val queryString = request.queryString?.let { "?$it" } ?: ""
        val clientIp = getClientIpAddress(request)
        
        // API 타입 결정
        val apiType = determineApiType(uri)
        
        // 기본 요청 정보 로깅
        logger.info("[$requestId] $apiType $method $uri$queryString | IP: $clientIp")
        
        // OAuth2 요청인 경우 추가 정보
        if (isOAuth2Request(uri)) {
            val provider = extractOAuth2Provider(uri)
            logger.info("[$requestId] OAuth2: $provider - ${getOAuth2FlowType(uri)}")
        }
        
        // Authorization 헤더가 있는 경우 표시
        val authHeader = request.getHeader("Authorization")
        if (authHeader != null) {
            logger.info("[$requestId] Authorization: ${if (authHeader.startsWith("Bearer")) "Bearer ***" else "***"}")
        }
    }

    private fun logRequestBody(request: HttpServletRequest, requestId: String) {
        val method = request.method
        // POST/PUT 요청인 경우 body 로깅
        if (method in listOf("POST", "PUT", "PATCH") && request is ContentCachingRequestWrapper) {
            val body = getRequestBody(request)
            if (body.isNotEmpty()) {
                logger.info("[$requestId] Request Body: $body")
            }
        }
    }

    private fun logResponse(response: HttpServletResponse, requestId: String, duration: Long) {
        val status = response.status
        val statusLevel = when (status) {
            in 200..299 -> "SUCCESS"
            in 300..399 -> "REDIRECT"
            in 400..499 -> "CLIENT_ERROR"
            in 500..599 -> "SERVER_ERROR"
            else -> "UNKNOWN"
        }
        
        val performanceLevel = when {
            duration < 50 -> "FAST"
            duration < 200 -> "NORMAL"
            duration < 500 -> "SLOW"
            duration < 1000 -> "VERY_SLOW"
            else -> "TIMEOUT"
        }
        
        logger.info("[$requestId] RESPONSE $statusLevel $status | TIME ${duration}ms $performanceLevel")
    }

    private fun getRequestBody(request: ContentCachingRequestWrapper): String {
        return try {
            val content = request.contentAsByteArray
            if (content.isNotEmpty()) {
                val body = String(content, Charsets.UTF_8)
                // 긴 body는 잘라서 표시
                if (body.length > 500) {
                    body.substring(0, 500) + "... (truncated)"
                } else {
                    body
                }
            } else {
                ""
            }
        } catch (e: Exception) {
            "Error reading request body: ${e.message}"
        }
    }

    private fun determineApiType(uri: String): String {
        return when {
            uri.startsWith("/api/auth") -> "AUTH"
            uri.startsWith("/api/journals") -> "JOURNAL"
            uri.startsWith("/api/seed") -> "SEED"
            uri.startsWith("/api/users") -> "USER"
            uri.startsWith("/api/") -> "API"
            uri.startsWith("/oauth2") -> "OAUTH"
            uri.startsWith("/login") -> "LOGIN"
            else -> "WEB"
        }
    }

    private fun isOAuth2Request(uri: String): Boolean {
        return uri.contains("/oauth2/") || uri.contains("/login/oauth2/")
    }

    private fun extractOAuth2Provider(uri: String): String {
        return when {
            uri.contains("kakao") -> "Kakao"
            uri.contains("google") -> "Google"
            uri.contains("naver") -> "Naver"
            uri.contains("apple") -> "Apple"
            else -> "Unknown"
        }
    }

    private fun getOAuth2FlowType(uri: String): String {
        return when {
            uri.contains("/authorization/") -> "Authorization Request"
            uri.contains("/code/") -> "Authorization Code Callback"
            uri.contains("/token") -> "Token Exchange"
            else -> "Unknown"
        }
    }

    private fun getClientIpAddress(request: HttpServletRequest): String {
        val headers = listOf(
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED"
        )
        
        for (header in headers) {
            val ip = request.getHeader(header)
            if (!ip.isNullOrEmpty() && !"unknown".equals(ip, ignoreCase = true)) {
                return ip.split(",")[0].trim()
            }
        }
        
        return request.remoteAddr
    }
}