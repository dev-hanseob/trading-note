package com.example.tradingnotebe.domain.exception

import org.springframework.http.HttpStatus

sealed class DomainException(
    val status: HttpStatus,
    override val message: String
) : RuntimeException(message)

// 404
class ResourceNotFoundException(resource: String, id: Any) :
    DomainException(HttpStatus.NOT_FOUND, "$resource not found with id: $id")

class JournalNotFoundException(id: Long) :
    DomainException(HttpStatus.NOT_FOUND, "Journal not found with id: $id")

class SeedNotFoundException(id: Long) :
    DomainException(HttpStatus.NOT_FOUND, "Seed not found with id: $id")

class TradingRuleNotFoundException(id: Long) :
    DomainException(HttpStatus.NOT_FOUND, "Trading rule not found with id: $id")

class SubscriptionNotFoundException(userId: Any) :
    DomainException(HttpStatus.NOT_FOUND, "Subscription not found for user: $userId")

// 400
class InvalidTradeOperationException(reason: String) :
    DomainException(HttpStatus.BAD_REQUEST, reason)

class PositionAlreadyClosedException(id: Long) :
    DomainException(HttpStatus.BAD_REQUEST, "Position $id is already closed")

class InvalidPasswordException :
    DomainException(HttpStatus.BAD_REQUEST, "Current password is incorrect")

// 401
class AuthenticationFailedException(reason: String = "Invalid email or password") :
    DomainException(HttpStatus.UNAUTHORIZED, reason)

class UnauthorizedAccessException(reason: String = "Authentication required") :
    DomainException(HttpStatus.UNAUTHORIZED, reason)

// 409
class DuplicateEmailException(email: String) :
    DomainException(HttpStatus.CONFLICT, "Email already exists: $email")
