package com.example.tradingnotebe.domain.seed.controller

import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.seed.domain.Seed
import com.example.tradingnotebe.domain.seed.model.CreateSeedRequest
import com.example.tradingnotebe.domain.seed.service.SeedService
import com.example.tradingnotebe.domain.user.domain.User
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/seed")
class SeedController(
    private val seedService: SeedService
) {

    @PostMapping
    fun createSeed(@RequestBody request: CreateSeedRequest, @CurrentUser user: User): ResponseEntity<Seed> {
        val seed = seedService.createSeed(request, user)
        return ResponseEntity.ok(seed)
    }

    @GetMapping
    fun getSeeds(@CurrentUser user: User): ResponseEntity<List<Seed>> {
        val seeds = seedService.findByUser(user)
        return ResponseEntity.ok(seeds)
    }

    @GetMapping("/{id}")
    fun getSeed(@PathVariable id: Long, @CurrentUser user: User): ResponseEntity<Seed> {
        val seed = seedService.findById(id)
        return ResponseEntity.ok(seed)
    }

    @PutMapping("/{id}")
    fun updateSeed(
        @PathVariable id: Long,
        @RequestBody request: CreateSeedRequest,
        @CurrentUser user: User
    ): ResponseEntity<Seed> {
        val seed = seedService.updateSeed(id, request, user)
        return ResponseEntity.ok(seed)
    }

    @DeleteMapping("/{id}")
    fun deleteSeed(@PathVariable id: Long, @CurrentUser user: User): ResponseEntity<Void> {
        val deleted = seedService.deleteByIdAndUser(id, user)
        return if (deleted) ResponseEntity.noContent().build() else ResponseEntity.notFound().build()
    }
}
