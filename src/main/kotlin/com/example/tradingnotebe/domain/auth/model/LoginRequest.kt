package com.example.tradingnotebe.domain.auth.model

data class LoginRequest(
    val email: String,
    val password: String
)