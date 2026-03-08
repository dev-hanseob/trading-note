package com.example.tradingnotebe.domain.journal.model

// --- GET /api/trading-rules/stats ---

data class TradingRuleStatsResponse(
    val totalJournals: Int,
    val journalsWithRules: Int,
    val overallComplianceRate: Double,
    val monthlyComplianceRates: List<MonthlyComplianceRate>,
    val ruleStats: List<RuleStat>
)

data class MonthlyComplianceRate(
    val month: String,
    val rate: Double,
    val journalCount: Int
)

data class RuleStat(
    val ruleId: Long,
    val label: String,
    val checkCount: Int,
    val totalJournals: Int,
    val checkRate: Double,
    val isActive: Boolean
)

// --- GET /api/trading-rules/{id}/performance ---

data class RulePerformanceResponse(
    val ruleId: Long,
    val label: String,
    val checkedStats: TradeStats,
    val uncheckedStats: TradeStats
)

data class TradeStats(
    val tradeCount: Int,
    val winCount: Int,
    val winRate: Double,
    val totalProfit: Double,
    val avgProfit: Double,
    val avgRoi: Double
)

// --- GET /api/journals/analytics/by-rules ---

data class RuleAnalyticsResponse(
    val topPerformingRules: List<RulePerformance>,
    val mostIgnoredRules: List<IgnoredRule>,
    val complianceByEmotion: List<EmotionCompliance>
)

data class RulePerformance(
    val ruleId: Long,
    val label: String,
    val avgProfit: Double,
    val winRate: Double,
    val tradeCount: Int
)

data class IgnoredRule(
    val ruleId: Long,
    val label: String,
    val ignoreRate: Double,
    val missedProfit: Double
)

data class EmotionCompliance(
    val emotion: String,
    val avgComplianceRate: Double,
    val avgProfit: Double
)
