package com.example.tradingnotebe.domain.journal.controller

import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.journal.entity.TradeStatus
import com.example.tradingnotebe.domain.journal.model.AddJournalRequest
import com.example.tradingnotebe.domain.journal.model.ClosePositionRequest
import com.example.tradingnotebe.domain.journal.model.JournalResponse
import com.example.tradingnotebe.domain.journal.service.FileStorageService
import com.example.tradingnotebe.domain.journal.service.JournalService
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.SocialProvider
import com.example.tradingnotebe.domain.user.repository.UserJpaRepository
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/journals")
class JournalController(
    private val journalService: JournalService,
    private val fileStorageService: FileStorageService,
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
    fun addJournal(
        @RequestBody request: AddJournalRequest,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<JournalResponse> {
        val resolved = resolveUser(user)
        val saved = journalService.createJournal(request, resolved)
        return ResponseEntity.ok(saved)
    }

    // TODO: dev workaround - user filtering disabled
    @GetMapping
    fun getJournals(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") pageSize: Int,
        @RequestParam(required = false) status: TradeStatus?,
        @RequestParam(required = false) search: String?,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<Map<String, Any>> {
        val pageable = PageRequest.of(page - 1, pageSize)
        val journalsPage = journalService.findByUser(user, pageable, status, search)

        val response = mapOf(
            "total" to journalsPage.totalElements,
            "page" to page,
            "pageSize" to pageSize,
            "journals" to journalsPage.content
        )
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}")
    fun getJournal(
        @PathVariable id: Long,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<JournalResponse> {
        val resolved = resolveUser(user)
        val journal = journalService.findByIdAndUser(id, resolved)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(journal)
    }

    @PutMapping("/{id}")
    fun updateJournal(
        @PathVariable id: Long,
        @RequestBody request: AddJournalRequest,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<JournalResponse> {
        val resolved = resolveUser(user)
        val updated = journalService.updateJournal(id, request, resolved)
        return ResponseEntity.ok(updated)
    }

    @PutMapping("/{id}/close")
    fun closePosition(
        @PathVariable id: Long,
        @RequestBody request: ClosePositionRequest,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<JournalResponse> {
        val resolved = resolveUser(user)
        val closed = journalService.closePosition(id, request, resolved)
        return ResponseEntity.ok(closed)
    }

    // TODO: dev workaround - user filtering disabled
    @GetMapping("/open-positions")
    fun getOpenPositions(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "50") pageSize: Int,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<Map<String, Any>> {
        val pageable = PageRequest.of(page - 1, pageSize)
        val positionsPage = journalService.getOpenPositions(user, pageable)

        val response = mapOf(
            "total" to positionsPage.totalElements,
            "page" to page,
            "pageSize" to pageSize,
            "journals" to positionsPage.content
        )
        return ResponseEntity.ok(response)
    }

    @PostMapping("/upload/chart")
    fun uploadChart(
        @RequestParam("file") file: MultipartFile,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<Map<String, String>> {
        // TODO: dev workaround - use hardcoded userId when user is not available
        val userId = 1L
        val url = fileStorageService.store(file, userId)
        return ResponseEntity.ok(mapOf("url" to url))
    }

    @DeleteMapping("/{id}")
    fun deleteJournal(
        @PathVariable id: Long,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<Void> {
        // TODO: dev workaround - delete by id only when no user
        if (user != null) {
            journalService.deleteByIdAndUser(id, user)
        } else {
            journalService.deleteById(id)
        }
        return ResponseEntity.noContent().build()
    }
}
