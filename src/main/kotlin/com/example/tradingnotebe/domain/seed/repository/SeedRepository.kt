package com.example.tradingnotebe.domain.seed.repository

import com.example.tradingnotebe.domain.seed.domain.Seed
import com.example.tradingnotebe.domain.seed.entity.SeedEntity
import com.example.tradingnotebe.domain.user.repository.UserJpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class SeedRepository(
    private val seedJpaRepository: SeedJpaRepository,
    private val userJpaRepository: UserJpaRepository
) {

    @Transactional
    fun save(seed: Seed): Seed {
        val userEntity = seed.userId?.let { userId ->
            userJpaRepository.findById(userId).orElseThrow {
                IllegalArgumentException("User not found with id: $userId")
            }
        } ?: throw IllegalArgumentException("User ID is required to create a seed")
        val seedEntity = seedJpaRepository.save(SeedEntity(seed.price, userEntity, seed.id))
        return SeedEntity.toDomain(seedEntity)
    }
    
    fun findAll(): List<Seed> {
        return seedJpaRepository.findAll()
            .map { SeedEntity.toDomain(it) }
    }
    
    fun findById(id: Long): Seed? {
        return seedJpaRepository.findById(id)
            .map { SeedEntity.toDomain(it) }
            .orElse(null)
    }
    
    fun findByUserId(userId: Long): List<Seed> {
        return seedJpaRepository.findByUserId(userId)
            .map { SeedEntity.toDomain(it) }
    }
    
    fun findByIdAndUserId(id: Long, userId: Long): Seed? {
        return seedJpaRepository.findByIdAndUserId(id, userId)
            ?.let { SeedEntity.toDomain(it) }
    }
    
    @Transactional
    fun deleteById(id: Long) {
        seedJpaRepository.deleteById(id)
    }
    
    @Transactional
    fun update(seed: Seed): Seed {
        val seedId = seed.id ?: throw IllegalArgumentException("Seed ID is required for update")
        val existingEntity = seedJpaRepository.findById(seedId).orElseThrow {
            IllegalArgumentException("Seed not found with id: $seedId")
        }
        val updatedEntity = seedJpaRepository.save(existingEntity.changeSeed(seed.price))
        return SeedEntity.toDomain(updatedEntity)
    }
}