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
            .orElseThrow { RuntimeException("Invalid email or password") }

        if (user.password?.let { passwordEncoder.matches(request.password, it) } != true) {
            throw RuntimeException("Invalid email or password")
        }

        val userEmail = user.email ?: throw RuntimeException("User email is required")
        val token = jwtUtil.generateToken(userEmail)
        return LoginResponse(token, userEmail, "Login successful")
    }

    fun updateProfile(user: User, name: String): User {
        val updatedUser = User(
            id = user.id,
            email = user.email,
            password = user.password,
            name = name,
            profileImage = user.profileImage,
            provider = user.provider,
            providerId = user.providerId,
            kakaoAccessToken = user.kakaoAccessToken,
            createdAt = user.createdAt,
            updatedAt = user.updatedAt
        )
        return userService.update(updatedUser)
    }

    fun changePassword(user: User, currentPassword: String, newPassword: String) {
        if (user.password?.let { passwordEncoder.matches(currentPassword, it) } != true) {
            throw RuntimeException("Current password is incorrect")
        }
        val encodedNewPassword = passwordEncoder.encode(newPassword)
        val updatedUser = User(
            id = user.id,
            email = user.email,
            password = encodedNewPassword,
            name = user.name,
            profileImage = user.profileImage,
            provider = user.provider,
            providerId = user.providerId,
            kakaoAccessToken = user.kakaoAccessToken,
            createdAt = user.createdAt,
            updatedAt = user.updatedAt
        )
        userService.update(updatedUser)
    }
}