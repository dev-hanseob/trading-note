package com.example.tradingnotebe.domain.seed.service

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
        // 임시로 빈 리스트 반환 - 실제로는 사용자별 조회 로직 필요
        return seedRepository.findAll()
    }
    
    fun findByIdAndUser(id: Long, user: User): Seed? {
        // 임시로 ID로만 조회 - 실제로는 사용자 검증 필요
        return seedRepository.findById(id)
    }
    
    fun updateSeed(id: Long, request: CreateSeedRequest, user: User): Seed? {
        val existingSeed = findByIdAndUser(id, user) ?: return null
        val updatedSeed = existingSeed.copy(price = request.price, currency = request.currency)
        return seedRepository.update(updatedSeed)
    }
    
    fun deleteByIdAndUser(id: Long, user: User): Boolean {
        val seed = findByIdAndUser(id, user) ?: return false
        seedRepository.deleteById(id)
        return true
    }
    
    // 기존 메서드들 (호환성을 위해 유지)
    fun save(seed: Seed): Seed {
        return seedRepository.save(seed)
    }
    
    fun findAll(): List<Seed> {
        return seedRepository.findAll()
    }
    
    fun findById(id: Long): Seed? {
        return seedRepository.findById(id)
    }
}