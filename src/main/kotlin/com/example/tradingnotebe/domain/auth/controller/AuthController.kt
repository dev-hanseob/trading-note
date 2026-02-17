package com.example.tradingnotebe.domain.auth.controller

import com.example.tradingnotebe.domain.auth.model.LoginRequest
import com.example.tradingnotebe.domain.auth.model.LoginResponse
import com.example.tradingnotebe.domain.auth.model.SignupRequest
import com.example.tradingnotebe.domain.auth.model.SignupResponse
import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.auth.service.AuthService
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.service.UserService
import com.example.tradingnotebe.util.JwtUtil
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.*
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap
import org.springframework.web.bind.annotation.*
import org.springframework.web.client.RestTemplate

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = ["http://localhost:3000", "http://localhost:3001", "http://222.114.87.121:3000"])
class AuthController(
    private val authService: AuthService,
    private val jwtUtil: JwtUtil,
    private val userService: UserService,
    @Value("\${spring.security.oauth2.client.registration.kakao.client-id}") 
    private val kakaoClientId: String
) {
    
    private val logger = LoggerFactory.getLogger(AuthController::class.java)
    private val restTemplate = RestTemplate()
    
    @PostMapping("/signup")
    fun signup(@RequestBody request: SignupRequest): ResponseEntity<SignupResponse> {
        val response = authService.signup(request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        val response = authService.login(request)
        return ResponseEntity.ok(response)
    }
    
    @GetMapping("/oauth2/{provider}")
    fun socialLogin(@PathVariable provider: String): ResponseEntity<String> {
        val authUrl = "/oauth2/authorization/$provider"
        return ResponseEntity.ok()
            .header("Location", authUrl)
            .body("Redirect to $provider OAuth2")
    }
    
    @PostMapping("/me")
    fun getCurrentUser(@CurrentUser user: User): ResponseEntity<Map<String, Any?>> {
        return ResponseEntity.ok(mapOf(
            "id" to user.id?.toString(),
            "email" to user.email,
            "name" to user.name,
            "provider" to user.provider.name
        ))
    }
    
    @PostMapping("/logout")
    fun logout(request: HttpServletRequest): ResponseEntity<Map<String, Any>> {
        return try {
            val authHeader = request.getHeader("Authorization")
            val token = authHeader?.let { 
                if (it.startsWith("Bearer ")) it.substring(7) else it
            }

            val response = mutableMapOf<String, Any>()
            
            if (token != null) {
                try {
                    // JWT에서 사용자 이메일 추출
                    val userEmail = jwtUtil.extractEmail(token)
                    logger.info("로그아웃 요청 - 사용자: $userEmail")
                    
                    // 카카오 로그아웃 호출 (저장된 액세스 토큰 사용)
                    val user = userService.findByEmail(userEmail)
                    if (user.isPresent && user.get().kakaoAccessToken != null) {
                        logoutFromKakao(user.get().kakaoAccessToken!!)
                    }
                    
                    response["message"] = "로그아웃이 완료되었습니다"
                    response["success"] = true
                } catch (e: Exception) {
                    logger.error("JWT 토큰 처리 중 오류: ${e.message}")
                    // JWT 오류가 있어도 로그아웃은 성공으로 처리
                    response["message"] = "로그아웃이 완료되었습니다"
                    response["success"] = true
                }
            } else {
                response["message"] = "로그아웃이 완료되었습니다"
                response["success"] = true
            }

            ResponseEntity.ok(response)
        } catch (e: Exception) {
            logger.error("로그아웃 처리 중 오류: ${e.message}")
            ResponseEntity.ok(mapOf(
                "message" to "로그아웃이 완료되었습니다",
                "success" to true
            ))
        }
    }

    private fun logoutFromKakao(accessToken: String) {
        try {
            // 1. 카카오 로그아웃 (세션 해제)
            logoutKakaoSession(accessToken)
            
            // 2. 카카오 연결끊기 (앱 연결 해제) - 선택사항
            // unlinkKakaoApp(accessToken)
            
        } catch (e: Exception) {
            logger.warn("카카오 로그아웃 호출 실패 (무시됨): ${e.message}")
        }
    }
    
    private fun logoutKakaoSession(accessToken: String) {
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_FORM_URLENCODED
        headers.set("Authorization", "Bearer $accessToken")

        val params: MultiValueMap<String, String> = LinkedMultiValueMap()
        val entity = HttpEntity(params, headers)
        
        val response = restTemplate.exchange(
            "https://kapi.kakao.com/v1/user/logout",
            HttpMethod.POST,
            entity,
            String::class.java
        )
        
        logger.info("카카오 세션 로그아웃 성공: ${response.statusCode}")
    }
    
    // 강력한 로그아웃: 앱 연결 완전 해제 (사용자가 다시 앱 동의 필요)
    private fun unlinkKakaoApp(accessToken: String) {
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_FORM_URLENCODED
        headers.set("Authorization", "Bearer $accessToken")

        val params: MultiValueMap<String, String> = LinkedMultiValueMap()
        val entity = HttpEntity(params, headers)
        
        val response = restTemplate.exchange(
            "https://kapi.kakao.com/v1/user/unlink",
            HttpMethod.POST,
            entity,
            String::class.java
        )
        
        logger.info("카카오 앱 연결끊기 성공: ${response.statusCode}")
    }
}