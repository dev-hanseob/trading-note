package com.example.tradingnotebe.domain.journal.controller

import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.journal.entity.TradingRule
import com.example.tradingnotebe.domain.journal.model.RulePerformanceResponse
import com.example.tradingnotebe.domain.journal.model.TradingRuleStatsResponse
import com.example.tradingnotebe.domain.journal.service.TradingRuleService
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.UserEntity
import com.example.tradingnotebe.domain.user.repository.UserJpaRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class TradingRuleRequest(
    val label: String,
    val displayOrder: Int,
    val isActive: Boolean = true
)

@RestController
@RequestMapping("/api/trading-rules")
class TradingRuleController(
    private val tradingRuleService: TradingRuleService,
    private val userJpaRepository: UserJpaRepository
) {

    // TODO: dev workaround - resolve user or fallback to first user in DB
    private fun resolveUser(user: User?): User {
        if (user != null) return user
        val firstUser = userJpaRepository.findAll().firstOrNull()
            ?: throw IllegalStateException("No users in database. Please create a user first via /api/auth/signup")
        return User(
            id = firstUser.id,
            email = firstUser.email ?: "",
            name = firstUser.name ?: "",
            provider = firstUser.provider
        )
    }

    // TODO: dev workaround - user filtering disabled
    @GetMapping
    fun getRules(
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<List<TradingRule>> {
        val rules = tradingRuleService.findAllByUser(user)
        return ResponseEntity.ok(rules)
    }

    @PostMapping
    fun createRule(
        @RequestBody request: TradingRuleRequest,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<TradingRule> {
        val resolved = resolveUser(user)
        val rule = tradingRuleService.create(request.label, request.displayOrder, resolved)
        return ResponseEntity.ok(rule)
    }

    @PutMapping("/{id}")
    fun updateRule(
        @PathVariable id: Long,
        @RequestBody request: TradingRuleRequest,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<TradingRule> {
        val resolved = resolveUser(user)
        val rule = tradingRuleService.update(id, request.label, request.displayOrder, request.isActive, resolved)
        return ResponseEntity.ok(rule)
    }

    @DeleteMapping("/{id}")
    fun deleteRule(
        @PathVariable id: Long,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<Void> {
        val resolved = resolveUser(user)
        tradingRuleService.delete(id, resolved)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/seed-defaults")
    fun seedDefaults(
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<List<TradingRule>> {
        val resolved = resolveUser(user)
        val rules = tradingRuleService.seedDefaults(resolved)
        return ResponseEntity.ok(rules)
    }

    // TODO: dev workaround - user filtering disabled for analytics
    @GetMapping("/stats")
    fun getStats(
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<TradingRuleStatsResponse> {
        val stats = tradingRuleService.getStats()
        return ResponseEntity.ok(stats)
    }

    // TODO: dev workaround - user filtering disabled for analytics
    @GetMapping("/{id}/performance")
    fun getRulePerformance(
        @PathVariable id: Long,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<RulePerformanceResponse> {
        val performance = tradingRuleService.getRulePerformance(id)
        return ResponseEntity.ok(performance)
    }
}
