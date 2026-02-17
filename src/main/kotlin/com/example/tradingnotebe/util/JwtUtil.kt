package com.example.tradingnotebe.util

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtUtil {
    
    @Value("\${jwt.secret:mySecretKeyForJwtTokenGenerationAndValidation123456789}")
    private lateinit var secretKey: String
    
    @Value("\${jwt.expiration:86400000}") // 24 hours in milliseconds
    private var expiration: Long = 86400000
    
    private fun getSigningKey(): SecretKey = Keys.hmacShaKeyFor(secretKey.toByteArray())
    
    fun generateToken(email: String): String {
        val claims = HashMap<String, Any>()
        return createToken(claims, email)
    }
    
    private fun createToken(claims: Map<String, Any>, subject: String): String {
        return Jwts.builder()
            .claims(claims)
            .subject(subject)
            .issuedAt(Date(System.currentTimeMillis()))
            .expiration(Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey())
            .compact()
    }
    
    fun extractEmail(token: String): String = extractClaim(token) { it.subject }
    
    fun extractExpiration(token: String): Date = extractClaim(token) { it.expiration }
    
    fun <T> extractClaim(token: String, claimsResolver: (Claims) -> T): T {
        val claims = extractAllClaims(token)
        return claimsResolver(claims)
    }
    
    private fun extractAllClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .payload
    }
    
    private fun isTokenExpired(token: String): Boolean {
        return extractExpiration(token).before(Date())
    }
    
    fun validateToken(token: String, email: String): Boolean {
        val tokenEmail = extractEmail(token)
        return tokenEmail == email && !isTokenExpired(token)
    }
}