package com.example.tradingnotebe.domain.seed.repository

import com.example.tradingnotebe.domain.seed.entity.SeedEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface SeedJpaRepository : JpaRepository<SeedEntity, Long> {

    @Query("SELECT s FROM seed s WHERE s.user.id = :userId ORDER BY s.createdAt DESC")
    fun findByUserId(userId: UUID): List<SeedEntity>

    @Query("SELECT s FROM seed s WHERE s.id = :id AND s.user.id = :userId")
    fun findByIdAndUserId(id: Long, userId: UUID): SeedEntity?
}