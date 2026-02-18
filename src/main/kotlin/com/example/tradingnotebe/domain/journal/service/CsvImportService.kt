package com.example.tradingnotebe.domain.journal.service

import com.example.tradingnotebe.domain.journal.entity.AssetType
import com.example.tradingnotebe.domain.journal.entity.PositionType
import com.example.tradingnotebe.domain.journal.entity.TradeType
import com.example.tradingnotebe.domain.journal.model.AddJournalRequest
import com.example.tradingnotebe.domain.journal.model.CsvAnalyzeResponse
import com.example.tradingnotebe.domain.journal.model.CsvConfirmRequest
import com.example.tradingnotebe.domain.journal.model.CsvErrorRow
import com.example.tradingnotebe.domain.journal.model.CsvPreviewRow
import com.example.tradingnotebe.domain.user.domain.User
import com.fasterxml.jackson.databind.JsonNode
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVParser
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.InputStreamReader
import java.nio.charset.Charset
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class CsvImportService(
    private val llmService: LlmService,
    private val journalService: JournalService
) {
    private val log = LoggerFactory.getLogger(CsvImportService::class.java)

    fun analyze(file: MultipartFile): CsvAnalyzeResponse {
        val charset = detectCharset(file)
        val reader = InputStreamReader(file.inputStream, charset)
        val csvFormat = CSVFormat.DEFAULT.builder()
            .setHeader()
            .setSkipHeaderRecord(true)
            .setIgnoreEmptyLines(true)
            .setTrim(true)
            .build()

        CSVParser(reader, csvFormat).use { parser ->
            val headers = parser.headerNames
            val allRecords = parser.records

            if (headers.isEmpty() || allRecords.isEmpty()) {
                throw IllegalArgumentException("CSV file is empty or has no data rows")
            }

            val sampleRows = allRecords.take(5).map { record ->
                headers.map { h -> record.get(h) ?: "" }
            }

            val llmResult = llmService.analyzeCSVMapping(headers, sampleRows)
            val mappings = llmResult.path("mappings")
            val unmapped = llmResult.path("unmappedColumns")
                .map { it.asText() }

            val preview = mutableListOf<CsvPreviewRow>()
            val errors = mutableListOf<CsvErrorRow>()

            allRecords.forEachIndexed { index, record ->
                try {
                    val rowData = headers.associateWith { h -> record.get(h) ?: "" }
                    val row = applyMapping(index + 1, rowData, mappings)
                    preview.add(row)
                } catch (e: Exception) {
                    errors.add(CsvErrorRow(row = index + 1, reason = e.message ?: "Unknown error"))
                }
            }

            return CsvAnalyzeResponse(
                mappings = mappingsToMap(mappings),
                preview = preview,
                totalRows = allRecords.size,
                successRows = preview.size,
                errorRows = errors,
                unmappedColumns = unmapped
            )
        }
    }

    fun confirm(request: CsvConfirmRequest, user: User): Int {
        var savedCount = 0
        for (row in request.rows) {
            try {
                val addRequest = AddJournalRequest(
                    assetType = parseAssetType(row.assetType),
                    tradeType = parseTradeType(row.tradeType),
                    position = parsePosition(row.position),
                    currency = row.currency ?: "KRW",
                    symbol = row.symbol,
                    buyPrice = null,
                    investment = row.investment ?: 0.0,
                    profit = row.profit ?: 0.0,
                    roi = row.roi ?: 0.0,
                    quantity = row.quantity,
                    leverage = row.leverage,
                    memo = row.memo,
                    tradedAt = if (row.tradedAt != null) LocalDate.parse(row.tradedAt.take(10)) else LocalDate.now(),
                    entryPrice = row.entryPrice,
                    exitPrice = row.exitPrice
                )
                journalService.createJournal(addRequest, user)
                savedCount++
            } catch (e: Exception) {
                log.warn("Failed to save row {}: {}", row.rowNumber, e.message)
            }
        }
        return savedCount
    }

    private fun applyMapping(rowNum: Int, rowData: Map<String, String>, mappings: JsonNode): CsvPreviewRow {
        return CsvPreviewRow(
            rowNumber = rowNum,
            tradedAt = resolveStringField(rowData, mappings, "tradedAt"),
            symbol = resolveStringField(rowData, mappings, "symbol"),
            assetType = resolveStringField(rowData, mappings, "assetType") ?: "CRYPTO",
            tradeType = resolveStringField(rowData, mappings, "tradeType") ?: "SPOT",
            position = resolveStringField(rowData, mappings, "position"),
            entryPrice = resolveDoubleField(rowData, mappings, "entryPrice")
                ?: resolveDoubleField(rowData, mappings, "buyPrice"),
            exitPrice = resolveDoubleField(rowData, mappings, "exitPrice"),
            quantity = resolveDoubleField(rowData, mappings, "quantity"),
            investment = resolveDoubleField(rowData, mappings, "investment"),
            profit = resolveDoubleField(rowData, mappings, "profit"),
            roi = resolveDoubleField(rowData, mappings, "roi"),
            leverage = resolveDoubleField(rowData, mappings, "leverage")?.toInt(),
            memo = resolveStringField(rowData, mappings, "memo"),
            currency = resolveStringField(rowData, mappings, "currency") ?: "KRW"
        )
    }

    private fun resolveStringField(rowData: Map<String, String>, mappings: JsonNode, field: String): String? {
        val mapping = mappings.path(field)
        if (mapping.isMissingNode) return null

        return when {
            mapping.has("column") -> {
                val col = mapping.path("column").asText()
                val raw = rowData[col] ?: return null
                if (mapping.has("dateFormat")) {
                    try {
                        val fmt = DateTimeFormatter.ofPattern(mapping.path("dateFormat").asText())
                        LocalDate.parse(raw.trim(), fmt).toString()
                    } catch (e: Exception) {
                        raw.trim().take(10)
                    }
                } else {
                    raw.trim()
                }
            }
            mapping.has("value") -> mapping.path("value").asText()
            mapping.has("compute") -> computeFormula(rowData, mapping.path("compute").asText())
            else -> null
        }
    }

    private fun resolveDoubleField(rowData: Map<String, String>, mappings: JsonNode, field: String): Double? {
        val mapping = mappings.path(field)
        if (mapping.isMissingNode) return null

        return when {
            mapping.has("column") -> {
                val col = mapping.path("column").asText()
                val raw = rowData[col]?.replace(",", "")?.trim() ?: return null
                raw.toDoubleOrNull()
            }
            mapping.has("value") -> mapping.path("value").asText().toDoubleOrNull()
            mapping.has("compute") -> {
                val result = computeFormula(rowData, mapping.path("compute").asText())
                result?.toDoubleOrNull()
            }
            else -> null
        }
    }

    private fun computeFormula(rowData: Map<String, String>, formula: String): String? {
        return try {
            var expr = formula
            // Replace column names with their numeric values (longest names first to avoid partial replacement)
            for ((col, value) in rowData.entries.sortedByDescending { it.key.length }) {
                val numericVal = value.replace(",", "").trim()
                if (numericVal.toDoubleOrNull() != null) {
                    expr = expr.replace(col, numericVal)
                }
            }
            evaluateSimpleArithmetic(expr)?.toString()
        } catch (e: Exception) {
            log.debug("Failed to compute formula '{}': {}", formula, e.message)
            null
        }
    }

    /**
     * Evaluates simple arithmetic expressions containing +, -, *, / operators.
     * Handles operator precedence (* and / before + and -).
     */
    private fun evaluateSimpleArithmetic(expr: String): Double? {
        return try {
            val tokens = tokenize(expr.replace("\\s".toRegex(), "")) ?: return null
            parseExpression(tokens, intArrayOf(0))
        } catch (e: Exception) {
            null
        }
    }

    private fun tokenize(expr: String): List<String>? {
        val tokens = mutableListOf<String>()
        var i = 0
        while (i < expr.length) {
            when {
                expr[i].isDigit() || expr[i] == '.' -> {
                    val start = i
                    while (i < expr.length && (expr[i].isDigit() || expr[i] == '.')) i++
                    tokens.add(expr.substring(start, i))
                }
                expr[i] in listOf('+', '-', '*', '/', '(', ')') -> {
                    tokens.add(expr[i].toString())
                    i++
                }
                else -> return null // Unknown character
            }
        }
        return tokens
    }

    private fun parseExpression(tokens: List<String>, pos: IntArray): Double {
        var left = parseTerm(tokens, pos)
        while (pos[0] < tokens.size && (tokens[pos[0]] == "+" || tokens[pos[0]] == "-")) {
            val op = tokens[pos[0]++]
            val right = parseTerm(tokens, pos)
            left = if (op == "+") left + right else left - right
        }
        return left
    }

    private fun parseTerm(tokens: List<String>, pos: IntArray): Double {
        var left = parseFactor(tokens, pos)
        while (pos[0] < tokens.size && (tokens[pos[0]] == "*" || tokens[pos[0]] == "/")) {
            val op = tokens[pos[0]++]
            val right = parseFactor(tokens, pos)
            left = if (op == "*") left * right else left / right
        }
        return left
    }

    private fun parseFactor(tokens: List<String>, pos: IntArray): Double {
        return when {
            tokens[pos[0]] == "(" -> {
                pos[0]++ // consume '('
                val result = parseExpression(tokens, pos)
                pos[0]++ // consume ')'
                result
            }
            tokens[pos[0]] == "-" -> {
                pos[0]++
                -parseFactor(tokens, pos)
            }
            else -> tokens[pos[0]++].toDouble()
        }
    }

    private fun detectCharset(file: MultipartFile): Charset {
        val bytes = file.bytes.take(1000).toByteArray()
        return when {
            bytes.size >= 3 && bytes[0] == 0xEF.toByte() && bytes[1] == 0xBB.toByte() && bytes[2] == 0xBF.toByte() ->
                Charsets.UTF_8
            bytes.any { it < 0 } && String(bytes, Charsets.UTF_8).contains("\uFFFD") ->
                Charset.forName("EUC-KR")
            else -> Charsets.UTF_8
        }
    }

    private fun mappingsToMap(mappings: JsonNode): Map<String, Any> {
        val result = mutableMapOf<String, Any>()
        mappings.fields().forEach { (key, value) ->
            val map = mutableMapOf<String, String>()
            value.fields().forEach { (k, v) -> map[k] = v.asText() }
            result[key] = map
        }
        return result
    }

    private fun parseAssetType(value: String?): AssetType =
        when (value?.uppercase()) {
            "STOCK" -> AssetType.STOCK
            "FOREX" -> AssetType.FOREX
            "COMMODITY" -> AssetType.COMMODITY
            "BOND" -> AssetType.BOND
            else -> AssetType.CRYPTO
        }

    private fun parseTradeType(value: String?): TradeType =
        when (value?.uppercase()) {
            "FUTURES", "FUTURE" -> TradeType.FUTURES
            "OPTIONS", "OPTION" -> TradeType.OPTIONS
            "MARGIN" -> TradeType.MARGIN
            else -> TradeType.SPOT
        }

    private fun parsePosition(value: String?): PositionType? =
        when (value?.uppercase()) {
            "LONG" -> PositionType.LONG
            "SHORT" -> PositionType.SHORT
            else -> null
        }
}
