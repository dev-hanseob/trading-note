package com.example.tradingnotebe.domain.auth.model

data class LoginResponse(
    val token: String,
    val email: String,
    val message: String
)