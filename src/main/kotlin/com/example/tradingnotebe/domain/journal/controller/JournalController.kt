package com.example.tradingnotebe.domain.journal.controller

import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.common.PagedResponse
import com.example.tradingnotebe.domain.journal.entity.TradeStatus
import com.example.tradingnotebe.domain.journal.model.AddJournalRequest
import com.example.tradingnotebe.domain.journal.model.ClosePositionRequest
import com.example.tradingnotebe.domain.journal.model.JournalResponse
import com.example.tradingnotebe.domain.journal.model.RuleAnalyticsResponse
import com.example.tradingnotebe.domain.journal.service.FileStorageService
import com.example.tradingnotebe.domain.journal.service.JournalService
import com.example.tradingnotebe.domain.journal.service.TradingRuleService
import com.example.tradingnotebe.domain.user.domain.User
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/journals")
class JournalController(
    private val journalService: JournalService,
    private val fileStorageService: FileStorageService,
    private val tradingRuleService: TradingRuleService
) {

    @PostMapping
    fun addJournal(
        @RequestBody request: AddJournalRequest,
        @CurrentUser user: User
    ): ResponseEntity<JournalResponse> {
        val saved = journalService.createJournal(request, user)
        return ResponseEntity.ok(saved)
    }

    @GetMapping
    fun getJournals(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") pageSize: Int,
        @RequestParam(required = false) status: TradeStatus?,
        @RequestParam(required = false) search: String?,
        @CurrentUser user: User
    ): ResponseEntity<PagedResponse<JournalResponse>> {
        val pageable = PageRequest.of(page - 1, pageSize)
        val journalsPage = journalService.findByUser(user, pageable, status, search)

        val response = PagedResponse(
            total = journalsPage.totalElements,
            page = page,
            pageSize = pageSize,
            items = journalsPage.content
        )
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}")
    fun getJournal(
        @PathVariable id: Long,
        @CurrentUser user: User
    ): ResponseEntity<JournalResponse> {
        val journal = journalService.findByIdAndUser(id, user)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(journal)
    }

    @PutMapping("/{id}")
    fun updateJournal(
        @PathVariable id: Long,
        @RequestBody request: AddJournalRequest,
        @CurrentUser user: User
    ): ResponseEntity<JournalResponse> {
        val updated = journalService.updateJournal(id, request, user)
        return ResponseEntity.ok(updated)
    }

    @PutMapping("/{id}/close")
    fun closePosition(
        @PathVariable id: Long,
        @RequestBody request: ClosePositionRequest,
        @CurrentUser user: User
    ): ResponseEntity<JournalResponse> {
        val closed = journalService.closePosition(id, request, user)
        return ResponseEntity.ok(closed)
    }

    @GetMapping("/open-positions")
    fun getOpenPositions(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "50") pageSize: Int,
        @CurrentUser user: User
    ): ResponseEntity<PagedResponse<JournalResponse>> {
        val pageable = PageRequest.of(page - 1, pageSize)
        val positionsPage = journalService.getOpenPositions(user, pageable)

        val response = PagedResponse(
            total = positionsPage.totalElements,
            page = page,
            pageSize = pageSize,
            items = positionsPage.content
        )
        return ResponseEntity.ok(response)
    }

    @PostMapping("/upload/chart")
    fun uploadChart(
        @RequestParam("file") file: MultipartFile,
        @CurrentUser user: User
    ): ResponseEntity<Map<String, String>> {
        val url = fileStorageService.store(file, user.id!!)
        return ResponseEntity.ok(mapOf("url" to url))
    }

    @GetMapping("/analytics/by-rules")
    fun getAnalyticsByRules(
        @CurrentUser user: User
    ): ResponseEntity<RuleAnalyticsResponse> {
        val analytics = tradingRuleService.getRuleAnalytics(user)
        return ResponseEntity.ok(analytics)
    }

    @DeleteMapping("/{id}")
    fun deleteJournal(
        @PathVariable id: Long,
        @CurrentUser user: User
    ): ResponseEntity<Void> {
        journalService.deleteByIdAndUser(id, user)
        return ResponseEntity.noContent().build()
    }
}
