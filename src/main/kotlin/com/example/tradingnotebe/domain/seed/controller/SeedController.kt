package com.example.tradingnotebe.domain.seed.controller

import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.seed.domain.Seed
import com.example.tradingnotebe.domain.seed.model.CreateSeedRequest
import com.example.tradingnotebe.domain.seed.service.SeedService
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.repository.UserJpaRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/seed")
class SeedController(
    private val seedService: SeedService,
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

    @PostMapping
    fun createSeed(@RequestBody request: CreateSeedRequest, @CurrentUser(required = false) user: User?): ResponseEntity<Seed> {
        val resolved = resolveUser(user)
        val seed = seedService.createSeed(request, resolved)
        return ResponseEntity.ok(seed)
    }

    @GetMapping
    fun getSeeds(@CurrentUser(required = false) user: User?): ResponseEntity<List<Seed>> {
        // TODO: dev workaround - return all seeds when no user
        val seeds = if (user != null) {
            seedService.findByUser(user)
        } else {
            seedService.findAll()
        }
        return ResponseEntity.ok(seeds)
    }

    @GetMapping("/{id}")
    fun getSeed(@PathVariable id: Long, @CurrentUser(required = false) user: User?): ResponseEntity<Seed> {
        val seed = seedService.findById(id)
        return ResponseEntity.ok(seed)
    }

    @PutMapping("/{id}")
    fun updateSeed(
        @PathVariable id: Long,
        @RequestBody request: CreateSeedRequest,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<Seed> {
        val resolved = resolveUser(user)
        val seed = seedService.updateSeed(id, request, resolved)
        return ResponseEntity.ok(seed)
    }

    @DeleteMapping("/{id}")
    fun deleteSeed(@PathVariable id: Long, @CurrentUser(required = false) user: User?): ResponseEntity<Void> {
        val resolved = resolveUser(user)
        val deleted = seedService.deleteByIdAndUser(id, resolved)
        return if (deleted) ResponseEntity.noContent().build() else ResponseEntity.notFound().build()
    }
}
