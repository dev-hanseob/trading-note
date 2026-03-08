package com.example.tradingnotebe.domain.seed.service

import com.example.tradingnotebe.domain.exception.SeedNotFoundException
import com.example.tradingnotebe.domain.exception.UnauthorizedAccessException
import com.example.tradingnotebe.domain.seed.domain.Seed
import com.example.tradingnotebe.domain.seed.model.CreateSeedRequest
import com.example.tradingnotebe.domain.seed.repository.SeedRepository
import com.example.tradingnotebe.domain.user.domain.User
import org.springframework.stereotype.Service

@Service
class SeedService(
    private val seedRepository: SeedRepository
) {

    fun createSeed(request: CreateSeedRequest, user: User): Seed {
        val seed = Seed(
            price = request.price,
            currency = request.currency,
            userId = user.id
        )
        return seedRepository.save(seed)
    }

    fun findByUser(user: User): List<Seed> {
        val userId = user.id ?: throw UnauthorizedAccessException("User ID is required")
        return seedRepository.findByUserId(userId)
    }

    fun findByIdAndUser(id: Long, user: User): Seed? {
        return seedRepository.findById(id)
    }

    fun updateSeed(id: Long, request: CreateSeedRequest, user: User): Seed {
        val existingSeed = findByIdAndUser(id, user) ?: throw SeedNotFoundException(id)
        val updatedSeed = existingSeed.copy(price = request.price, currency = request.currency)
        return seedRepository.update(updatedSeed)
    }

    fun deleteByIdAndUser(id: Long, user: User): Boolean {
        val seed = findByIdAndUser(id, user) ?: throw SeedNotFoundException(id)
        seedRepository.deleteById(id)
        return true
    }

    // Legacy methods (kept for compatibility)
    fun save(seed: Seed): Seed {
        return seedRepository.save(seed)
    }

    fun findAll(): List<Seed> {
        return seedRepository.findAll()
    }

    fun findById(id: Long): Seed {
        return seedRepository.findById(id) ?: throw SeedNotFoundException(id)
    }
}