package com.example.tradingnotebe.domain.exchange.controller

import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.exchange.model.ExchangeCredentialRequest
import com.example.tradingnotebe.domain.exchange.model.ExchangeCredentialResponse
import com.example.tradingnotebe.domain.exchange.model.SyncRequest
import com.example.tradingnotebe.domain.exchange.model.SyncResult
import com.example.tradingnotebe.domain.exchange.service.ExchangeCredentialService
import com.example.tradingnotebe.domain.exchange.service.ExchangeSyncService
import com.example.tradingnotebe.domain.user.domain.User
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/exchange")
class ExchangeController(
    private val credentialService: ExchangeCredentialService,
    private val syncService: ExchangeSyncService
) {

    @PostMapping("/credentials")
    fun registerCredential(
        @RequestBody request: ExchangeCredentialRequest,
        @CurrentUser user: User
    ): ResponseEntity<ExchangeCredentialResponse> {
        val response = credentialService.register(request, user)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/credentials")
    fun getCredentials(
        @CurrentUser user: User
    ): ResponseEntity<List<ExchangeCredentialResponse>> {
        val credentials = credentialService.getCredentials(user)
        return ResponseEntity.ok(credentials)
    }

    @DeleteMapping("/credentials/{id}")
    fun deleteCredential(
        @PathVariable id: Long,
        @CurrentUser user: User
    ): ResponseEntity<Void> {
        credentialService.deleteCredential(id, user)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/credentials/{id}/validate")
    fun validateCredential(
        @PathVariable id: Long,
        @CurrentUser user: User
    ): ResponseEntity<Map<String, Boolean>> {
        val valid = credentialService.validateCredential(id, user)
        return ResponseEntity.ok(mapOf("valid" to valid))
    }

    @PostMapping("/sync")
    fun syncTrades(
        @RequestBody request: SyncRequest,
        @CurrentUser user: User
    ): ResponseEntity<SyncResult> {
        val result = syncService.sync(request, user)
        return ResponseEntity.ok(result)
    }
}
