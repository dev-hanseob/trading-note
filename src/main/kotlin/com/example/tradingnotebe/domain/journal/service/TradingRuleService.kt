package com.example.tradingnotebe.domain.journal.service

import com.example.tradingnotebe.domain.journal.entity.TradingRule
import com.example.tradingnotebe.domain.journal.repository.TradingRuleRepository
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.UserEntity
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service

@Transactional
@Service
class TradingRuleService(
    private val tradingRuleRepository: TradingRuleRepository
) {

    // TODO: dev workaround - returns all rules regardless of user
    fun findAllByUser(user: User?): List<TradingRule> {
        return tradingRuleRepository.findAllByOrderByDisplayOrderAsc()
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
        val existing = tradingRuleRepository.findById(id).orElseThrow {
            IllegalArgumentException("Trading rule not found with id: $id")
        }
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
        tradingRuleRepository.deleteById(id)
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
}
