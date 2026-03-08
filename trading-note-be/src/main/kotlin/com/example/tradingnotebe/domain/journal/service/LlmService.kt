package com.example.tradingnotebe.domain.journal.service

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class LlmService(
    @Value("\${openai.api-key:}") private val apiKey: String,
    @Value("\${openai.model:gpt-4o-mini}") private val model: String,
    @Value("\${openai.base-url:https://api.openai.com/v1}") private val baseUrl: String,
    private val objectMapper: ObjectMapper
) {
    private val log = LoggerFactory.getLogger(LlmService::class.java)

    private val webClient: WebClient by lazy {
        WebClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader("Authorization", "Bearer $apiKey")
            .defaultHeader("Content-Type", "application/json")
            .build()
    }

    fun analyzeCSVMapping(headers: List<String>, sampleRows: List<List<String>>): JsonNode {
        if (apiKey.isBlank()) {
            throw IllegalStateException("OpenAI API key is not configured")
        }

        val prompt = buildMappingPrompt(headers, sampleRows)

        val requestBody = objectMapper.createObjectNode().apply {
            put("model", model)
            putArray("messages").apply {
                addObject().apply {
                    put("role", "system")
                    put("content", "You are a trading journal CSV parser. Return only valid JSON, no markdown.")
                }
                addObject().apply {
                    put("role", "user")
                    put("content", prompt)
                }
            }
            put("temperature", 0.0)
            put("max_tokens", 1000)
        }

        val response = webClient.post()
            .uri("/chat/completions")
            .bodyValue(objectMapper.writeValueAsString(requestBody))
            .retrieve()
            .bodyToMono(JsonNode::class.java)
            .block() ?: throw RuntimeException("LLM API returned null response")

        val content = response
            .path("choices").get(0)
            .path("message").path("content")
            .asText()

        log.debug("LLM mapping response: {}", content)

        // Parse the JSON response, stripping markdown code fences if present
        val cleaned = content
            .replace(Regex("^```json\\s*", RegexOption.MULTILINE), "")
            .replace(Regex("^```\\s*$", RegexOption.MULTILINE), "")
            .trim()

        return objectMapper.readTree(cleaned)
    }

    private fun buildMappingPrompt(headers: List<String>, sampleRows: List<List<String>>): String {
        val headerLine = headers.joinToString(",")
        val sampleLines = sampleRows.joinToString("\n") { row ->
            row.joinToString(",") { v ->
                if (v.contains(",") || v.contains("\"") || v.contains("\n"))
                    "\"${v.replace("\"", "\"\"")}\""
                else v
            }
        }

        return """
Given the CSV headers and sample rows below, map each column to trading journal fields.

Target fields (use these exact names):
- tradedAt (REQUIRED): Trade date. Include "dateFormat" with Java DateTimeFormatter pattern.
- symbol: Trading pair or stock name (e.g. BTC/KRW, AAPL)
- assetType: "CRYPTO" or "STOCK" (infer from data)
- tradeType: "SPOT" or "FUTURE" (infer from data, default SPOT)
- position: "LONG" or "SHORT" (if determinable)
- entryPrice: Entry/buy price
- exitPrice: Exit/sell price
- quantity: Trade quantity/amount
- investment: Total investment amount
- profit: Realized profit/loss
- roi: Return on investment percentage
- leverage: Leverage multiplier (if applicable)
- memo: Any notes or descriptions
- currency: Currency code (default "KRW")

Mapping types:
- "column": maps directly to a CSV column name
- "compute": formula using CSV column names (e.g. "entryPrice * quantity")
- "value": fixed value for all rows (e.g. "CRYPTO")

CSV Headers: $headerLine
Sample Rows:
$sampleLines

Return ONLY a JSON object with this structure:
{
  "mappings": {
    "fieldName": { "column": "CSV Column Name" },
    "fieldName": { "column": "CSV Column Name", "dateFormat": "yyyy-MM-dd" },
    "fieldName": { "compute": "columnA * columnB" },
    "fieldName": { "value": "FIXED_VALUE" }
  },
  "unmappedColumns": ["col1", "col2"]
}
        """.trimIndent()
    }
}
