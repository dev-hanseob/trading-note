package com.example.tradingnotebe.domain.journal.controller

import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.journal.entity.TradingRule
import com.example.tradingnotebe.domain.journal.model.RulePerformanceResponse
import com.example.tradingnotebe.domain.journal.model.TradingRuleStatsResponse
import com.example.tradingnotebe.domain.journal.service.TradingRuleService
import com.example.tradingnotebe.domain.user.domain.User
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
    private val tradingRuleService: TradingRuleService
) {

    @GetMapping
    fun getRules(
        @CurrentUser user: User
    ): ResponseEntity<List<TradingRule>> {
        val rules = tradingRuleService.findAllByUser(user)
        return ResponseEntity.ok(rules)
    }

    @PostMapping
    fun createRule(
        @RequestBody request: TradingRuleRequest,
        @CurrentUser user: User
    ): ResponseEntity<TradingRule> {
        val rule = tradingRuleService.create(request.label, request.displayOrder, user)
        return ResponseEntity.ok(rule)
    }

    @PutMapping("/{id}")
    fun updateRule(
        @PathVariable id: Long,
        @RequestBody request: TradingRuleRequest,
        @CurrentUser user: User
    ): ResponseEntity<TradingRule> {
        val rule = tradingRuleService.update(id, request.label, request.displayOrder, request.isActive, user)
        return ResponseEntity.ok(rule)
    }

    @DeleteMapping("/{id}")
    fun deleteRule(
        @PathVariable id: Long,
        @CurrentUser user: User
    ): ResponseEntity<Void> {
        tradingRuleService.delete(id, user)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/seed-defaults")
    fun seedDefaults(
        @CurrentUser user: User
    ): ResponseEntity<List<TradingRule>> {
        val rules = tradingRuleService.seedDefaults(user)
        return ResponseEntity.ok(rules)
    }

    @GetMapping("/stats")
    fun getStats(
        @CurrentUser user: User
    ): ResponseEntity<TradingRuleStatsResponse> {
        val stats = tradingRuleService.getStats(user)
        return ResponseEntity.ok(stats)
    }

    @GetMapping("/{id}/performance")
    fun getRulePerformance(
        @PathVariable id: Long,
        @CurrentUser user: User
    ): ResponseEntity<RulePerformanceResponse> {
        val performance = tradingRuleService.getRulePerformance(id, user)
        return ResponseEntity.ok(performance)
    }
}
