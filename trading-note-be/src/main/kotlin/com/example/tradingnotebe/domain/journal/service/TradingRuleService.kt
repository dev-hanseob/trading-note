package com.example.tradingnotebe.domain.journal.service

import com.example.tradingnotebe.domain.exception.TradingRuleNotFoundException
import com.example.tradingnotebe.domain.journal.entity.Journal
import com.example.tradingnotebe.domain.journal.entity.TradingRule
import com.example.tradingnotebe.domain.journal.model.*
import com.example.tradingnotebe.domain.journal.repository.JournalRepository
import com.example.tradingnotebe.domain.journal.repository.TradingRuleRepository
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.UserEntity
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.time.format.DateTimeFormatter

@Transactional
@Service
class TradingRuleService(
    private val tradingRuleRepository: TradingRuleRepository,
    private val journalRepository: JournalRepository
) {

    fun findAllByUser(user: User): List<TradingRule> {
        val userEntity = UserEntity.toEntity(user)
        return tradingRuleRepository.findByUserOrderByDisplayOrderAsc(userEntity)
    }

    fun create(label: String, displayOrder: Int, user: User): TradingRule {
        val userEntity = UserEntity.toEntity(user)
        val rule = TradingRule(
            label = label,
            displayOrder = displayOrder,
            user = userEntity
        )
        return tradingRuleRepository.save(rule)
    }

    fun update(id: Long, label: String, displayOrder: Int, isActive: Boolean, user: User): TradingRule {
        val userEntity = UserEntity.toEntity(user)
        val existing = tradingRuleRepository.findByIdAndUser(id, userEntity)
            ?: throw TradingRuleNotFoundException(id)
        val updated = TradingRule(
            id = existing.id,
            label = label,
            displayOrder = displayOrder,
            isActive = isActive,
            user = existing.user
        )
        return tradingRuleRepository.save(updated)
    }

    fun delete(id: Long, user: User) {
        val userEntity = UserEntity.toEntity(user)
        tradingRuleRepository.deleteByIdAndUser(id, userEntity)
    }

    fun seedDefaults(user: User): List<TradingRule> {
        val userEntity = UserEntity.toEntity(user)
        val defaults = listOf(
            "Confirmed trend direction on higher timeframe",
            "Risk/reward ratio is at least 2:1",
            "Stop loss is placed at logical level",
            "Position size follows risk management rules",
            "No revenge trading - waited for valid setup"
        )

        val rules = defaults.mapIndexed { index, label ->
            TradingRule(
                label = label,
                displayOrder = index + 1,
                user = userEntity
            )
        }
        return tradingRuleRepository.saveAll(rules)
    }

    // --- Analytics methods ---

    fun getStats(user: User): TradingRuleStatsResponse {
        val userEntity = UserEntity.toEntity(user)
        val allRules = tradingRuleRepository.findByUserOrderByDisplayOrderAsc(userEntity)
        val activeRuleCount = allRules.count { it.isActive }

        // Use DB aggregation for counts instead of loading all journals
        val totalJournalCount = journalRepository.countByUser(userEntity).toInt()
        val journalsWithRulesCount = journalRepository.countByUserWithCheckedRules(userEntity).toInt()

        // For overall compliance and monthly rates, we need per-journal checked counts.
        // Load journals only once and parse checkedRuleIds with cache.
        val allJournals = journalRepository.findByUser(userEntity)
        val parsedRuleIds = allJournals.map { it to parseCheckedRuleIds(it.checkedRuleIds) }

        val overallComplianceRate = if (allJournals.isEmpty() || activeRuleCount == 0) {
            0.0
        } else {
            parsedRuleIds.map { (_, ruleIds) ->
                ruleIds.size.toDouble() / activeRuleCount * 100
            }.average()
        }

        val monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM")
        val computedMonthlyRates = parsedRuleIds
            .groupBy { (journal, _) -> journal.tradedAt.format(monthFormatter) }
            .map { (month, entries) ->
                val rate = if (activeRuleCount == 0) {
                    0.0
                } else {
                    entries.map { (_, ruleIds) ->
                        ruleIds.size.toDouble() / activeRuleCount * 100
                    }.average()
                }
                MonthlyComplianceRate(
                    month = month,
                    rate = Math.round(rate * 100.0) / 100.0,
                    journalCount = entries.size
                )
            }
            .sortedBy { it.month }

        // Rule-specific stats using parsed cache (avoids re-parsing per rule)
        val ruleStats = allRules.map { rule ->
            val ruleId = rule.id!!
            val checkCount = parsedRuleIds.count { (_, ruleIds) -> ruleIds.contains(ruleId) }
            RuleStat(
                ruleId = ruleId,
                label = rule.label,
                checkCount = checkCount,
                totalJournals = totalJournalCount,
                checkRate = if (totalJournalCount == 0) 0.0
                else Math.round(checkCount.toDouble() / totalJournalCount * 100 * 100.0) / 100.0,
                isActive = rule.isActive
            )
        }

        return TradingRuleStatsResponse(
            totalJournals = totalJournalCount,
            journalsWithRules = journalsWithRulesCount,
            overallComplianceRate = Math.round(overallComplianceRate * 100.0) / 100.0,
            monthlyComplianceRates = computedMonthlyRates,
            ruleStats = ruleStats
        )
    }

    fun getRulePerformance(ruleId: Long, user: User): RulePerformanceResponse {
        val userEntity = UserEntity.toEntity(user)
        val rule = tradingRuleRepository.findByIdAndUser(ruleId, userEntity)
            ?: throw TradingRuleNotFoundException(ruleId)
        val allJournals = journalRepository.findByUser(userEntity)

        val (checked, unchecked) = allJournals.partition { journal ->
            parseCheckedRuleIds(journal.checkedRuleIds).contains(ruleId)
        }

        return RulePerformanceResponse(
            ruleId = rule.id!!,
            label = rule.label,
            checkedStats = computeTradeStats(checked),
            uncheckedStats = computeTradeStats(unchecked)
        )
    }

    fun getRuleAnalytics(user: User): RuleAnalyticsResponse {
        val userEntity = UserEntity.toEntity(user)
        val allJournals = journalRepository.findByUser(userEntity)
        val allRules = tradingRuleRepository.findByUserOrderByDisplayOrderAsc(userEntity)
        val activeRules = allRules.filter { it.isActive }
        val activeRuleCount = activeRules.size

        // Pre-compute parsed rule IDs for each journal to avoid redundant parsing
        val journalRuleIds = allJournals.map { it to parseCheckedRuleIds(it.checkedRuleIds) }

        val topPerformingRules = allRules.mapNotNull { rule ->
            val ruleId = rule.id ?: return@mapNotNull null
            val checkedJournals = journalRuleIds.filter { (_, ruleIds) -> ruleIds.contains(ruleId) }.map { it.first }
            if (checkedJournals.isEmpty()) return@mapNotNull null
            val winCount = checkedJournals.count { it.profit > 0 }
            RulePerformance(
                ruleId = ruleId,
                label = rule.label,
                avgProfit = Math.round(checkedJournals.map { it.profit }.average() * 100.0) / 100.0,
                winRate = Math.round(winCount.toDouble() / checkedJournals.size * 100 * 100.0) / 100.0,
                tradeCount = checkedJournals.size
            )
        }.sortedByDescending { it.avgProfit }

        val totalJournalCount = allJournals.size
        val mostIgnoredRules = allRules.mapNotNull { rule ->
            val ruleId = rule.id ?: return@mapNotNull null
            val (checked, unchecked) = journalRuleIds.partition { (_, ruleIds) -> ruleIds.contains(ruleId) }
            val checkedJournals = checked.map { it.first }
            val uncheckedJournals = unchecked.map { it.first }

            val ignoreRate = if (totalJournalCount == 0) 0.0
            else Math.round(uncheckedJournals.size.toDouble() / totalJournalCount * 100 * 100.0) / 100.0

            val uncheckedAvgProfit = if (uncheckedJournals.isEmpty()) 0.0 else uncheckedJournals.map { it.profit }.average()
            val missedProfit = Math.round(uncheckedAvgProfit * 100.0) / 100.0

            IgnoredRule(
                ruleId = ruleId,
                label = rule.label,
                ignoreRate = ignoreRate,
                missedProfit = missedProfit
            )
        }.sortedByDescending { it.ignoreRate }

        val complianceByEmotion = allJournals
            .filter { it.emotion != null }
            .groupBy { it.emotion!!.name }
            .map { (emotion, journals) ->
                val avgCompliance = if (activeRuleCount == 0) {
                    0.0
                } else {
                    journals.map { journal ->
                        val checkedCount = parseCheckedRuleIds(journal.checkedRuleIds).size
                        checkedCount.toDouble() / activeRuleCount * 100
                    }.average()
                }
                EmotionCompliance(
                    emotion = emotion,
                    avgComplianceRate = Math.round(avgCompliance * 100.0) / 100.0,
                    avgProfit = Math.round(journals.map { it.profit }.average() * 100.0) / 100.0
                )
            }

        return RuleAnalyticsResponse(
            topPerformingRules = topPerformingRules,
            mostIgnoredRules = mostIgnoredRules,
            complianceByEmotion = complianceByEmotion
        )
    }

    private fun parseCheckedRuleIds(checkedRuleIds: String?): Set<Long> {
        if (checkedRuleIds.isNullOrBlank()) return emptySet()
        return checkedRuleIds.split(",")
            .mapNotNull { it.trim().toLongOrNull() }
            .toSet()
    }

    private fun computeTradeStats(journals: List<Journal>): TradeStats {
        if (journals.isEmpty()) {
            return TradeStats(
                tradeCount = 0,
                winCount = 0,
                winRate = 0.0,
                totalProfit = 0.0,
                avgProfit = 0.0,
                avgRoi = 0.0
            )
        }
        val winCount = journals.count { it.profit > 0 }
        val totalProfit = journals.sumOf { it.profit }
        return TradeStats(
            tradeCount = journals.size,
            winCount = winCount,
            winRate = Math.round(winCount.toDouble() / journals.size * 100 * 100.0) / 100.0,
            totalProfit = Math.round(totalProfit * 100.0) / 100.0,
            avgProfit = Math.round(totalProfit / journals.size * 100.0) / 100.0,
            avgRoi = Math.round(journals.map { it.roi }.average() * 100.0) / 100.0
        )
    }
}
