package com.example.tradingnotebe.domain.journal.controller

import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.journal.model.CsvAnalyzeResponse
import com.example.tradingnotebe.domain.journal.model.CsvConfirmRequest
import com.example.tradingnotebe.domain.journal.service.CsvImportService
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.UserEntity
import com.example.tradingnotebe.domain.user.repository.UserJpaRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/journals/import/csv")
class CsvImportController(
    private val csvImportService: CsvImportService,
    private val userJpaRepository: UserJpaRepository
) {

    // TODO: dev workaround - resolve user or fallback to first user in DB
    private fun resolveUser(user: User?): User {
        if (user != null) return user
        val firstUser = userJpaRepository.findAll().firstOrNull()
            ?: throw IllegalStateException("No users in database")
        return UserEntity.toDomain(firstUser)
    }

    @PostMapping("/analyze")
    fun analyze(
        @RequestParam("file") file: MultipartFile,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<CsvAnalyzeResponse> {
        if (file.isEmpty) {
            return ResponseEntity.badRequest().build()
        }

        val maxSize = 5 * 1024 * 1024L // 5MB
        if (file.size > maxSize) {
            return ResponseEntity.badRequest().build()
        }

        val result = csvImportService.analyze(file)
        return ResponseEntity.ok(result)
    }

    @PostMapping("/confirm")
    fun confirm(
        @RequestBody request: CsvConfirmRequest,
        @CurrentUser(required = false) user: User?
    ): ResponseEntity<Map<String, Any>> {
        val resolved = resolveUser(user)
        val savedCount = csvImportService.confirm(request, resolved)
        return ResponseEntity.ok(mapOf(
            "savedCount" to savedCount,
            "message" to "Saved $savedCount record(s) successfully"
        ))
    }
}
