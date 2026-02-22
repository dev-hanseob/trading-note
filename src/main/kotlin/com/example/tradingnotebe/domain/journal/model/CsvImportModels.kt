package com.example.tradingnotebe.domain.journal.model

data class CsvAnalyzeResponse(
    val mappings: Map<String, Any>,
    val preview: List<CsvPreviewRow>,
    val totalRows: Int,
    val successRows: Int,
    val errorRows: List<CsvErrorRow>,
    val unmappedColumns: List<String>
)

data class CsvPreviewRow(
    val rowNumber: Int,
    val tradedAt: String?,
    val symbol: String?,
    val assetType: String?,
    val tradeType: String?,
    val position: String?,
    val entryPrice: Double?,
    val exitPrice: Double?,
    val quantity: Double?,
    val investment: Double?,
    val profit: Double?,
    val roi: Double?,
    val leverage: Int?,
    val memo: String?,
    val currency: String?
)

data class CsvErrorRow(
    val row: Int,
    val reason: String
)

data class CsvConfirmRequest(
    val rows: List<CsvPreviewRow>
)

data class CsvConfirmResponse(
    val savedCount: Int,
    val message: String
)
