package com.example.tradingnotebe.domain.auth.service

import com.example.tradingnotebe.domain.auth.model.LoginRequest
import com.example.tradingnotebe.domain.auth.model.LoginResponse
import com.example.tradingnotebe.domain.auth.model.SignupRequest
import com.example.tradingnotebe.domain.auth.model.SignupResponse
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.service.UserService
import com.example.tradingnotebe.util.JwtUtil
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userService: UserService,
    private val passwordEncoder: PasswordEncoder,
    private val jwtUtil: JwtUtil
) {
    
    fun signup(request: SignupRequest): SignupResponse {
        if (userService.existsByEmail(request.email)) {
            throw RuntimeException("Email already exists")
        }
        
        val encodedPassword = passwordEncoder.encode(request.password)
        val user = User(request.email, encodedPassword)
        userService.save(user)
        
        return SignupResponse(request.email, "Signup completed successfully")
    }
    
    fun login(request: LoginRequest): LoginResponse {
        val user = userService.findByEmail(request.email)
            .orElseThrow { RuntimeException("User not found") }
        
        if (user.password?.let { passwordEncoder.matches(request.password, it) } != true) {
            throw RuntimeException("Invalid password")
        }
        
        val userEmail = user.email ?: throw RuntimeException("User email is required")
        val token = jwtUtil.generateToken(userEmail)
        return LoginResponse(token, userEmail, "Login successful")
    }
}