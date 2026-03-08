# LLM-based CSV Import Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 어떤 포맷의 CSV든 LLM이 컬럼을 자동 인식하여 매매일지(Journal)로 변환하는 범용 임포트 시스템 구현.

**Architecture:** 프론트엔드에서 CSV 파일을 업로드하면, 백엔드가 헤더+샘플 3행을 LLM에 보내 매핑 규칙을 받고, 전체 CSV를 변환하여 미리보기를 반환. 사용자 확인 후 일괄 저장. 2단계 API (analyze -> confirm).

**Tech Stack:** Spring Boot (Kotlin), OpenAI API (GPT-4o-mini), Apache Commons CSV, Next.js (React/TypeScript), Tailwind CSS

---

### Task 1: Backend - Add OpenAI dependency and config

**Files:**
- Modify: `trading-note-be/pom.xml`
- Modify: `trading-note-be/src/main/resources/application.yml`

**Step 1: Add Apache Commons CSV and OpenAI dependencies to pom.xml**

In `pom.xml`, add inside `<dependencies>`:

```xml
<!-- CSV parsing -->
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-csv</artifactId>
    <version>1.12.0</version>
</dependency>
```

Note: We'll use Spring's WebClient (already available via spring-boot-starter-webflux) to call the OpenAI API directly, so no separate OpenAI SDK dependency is needed.

**Step 2: Add OpenAI config to application.yml**

Append to `application.yml`:

```yaml
# OpenAI Configuration
openai:
  api-key: ${OPENAI_API_KEY:}
  model: gpt-4o-mini
  base-url: https://api.openai.com/v1
```

**Step 3: Build to verify**

Run: `cd trading-note-be && ./mvnw clean compile -q`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add trading-note-be/pom.xml trading-note-be/src/main/resources/application.yml
git commit -m "feat(csv-import): add Commons CSV dependency and OpenAI config"
```

---

### Task 2: Backend - LlmService (OpenAI API client)

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/service/LlmService.kt`

**Step 1: Create LlmService**

```kotlin
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
        val sampleLines = sampleRows.joinToString("\n") { it.joinToString(",") }

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
```

**Step 2: Build to verify**

Run: `cd trading-note-be && ./mvnw clean compile -q`
Expected: BUILD SUCCESS

**Step 3: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/service/LlmService.kt
git commit -m "feat(csv-import): add LlmService for OpenAI API integration"
```

---

### Task 3: Backend - CsvImportService (CSV parsing + mapping)

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/service/CsvImportService.kt`
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/model/CsvImportModels.kt`

**Step 1: Create DTOs**

```kotlin
package com.example.tradingnotebe.domain.journal.model

import com.example.tradingnotebe.domain.journal.entity.*

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
```

**Step 2: Create CsvImportService**

```kotlin
package com.example.tradingnotebe.domain.journal.service

import com.example.tradingnotebe.domain.journal.entity.*
import com.example.tradingnotebe.domain.journal.model.*
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.UserEntity
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
import javax.script.ScriptEngineManager

@Service
class CsvImportService(
    private val llmService: LlmService,
    private val journalService: JournalService
) {
    private val log = LoggerFactory.getLogger(CsvImportService::class.java)

    fun analyze(file: MultipartFile): CsvAnalyzeResponse {
        // 1. Parse CSV
        val charset = detectCharset(file)
        val reader = InputStreamReader(file.inputStream, charset)
        val csvFormat = CSVFormat.DEFAULT.builder()
            .setHeader()
            .setSkipHeaderRecord(true)
            .setIgnoreEmptyLines(true)
            .setTrim(true)
            .build()

        val parser = CSVParser(reader, csvFormat)
        val headers = parser.headerNames
        val allRecords = parser.records

        if (headers.isEmpty() || allRecords.isEmpty()) {
            throw IllegalArgumentException("CSV file is empty or has no data rows")
        }

        // 2. Extract sample rows (first 3)
        val sampleRows = allRecords.take(3).map { record ->
            headers.map { h -> record.get(h) ?: "" }
        }

        // 3. Call LLM for mapping
        val llmResult = llmService.analyzeCSVMapping(headers, sampleRows)
        val mappings = llmResult.path("mappings")
        val unmapped = llmResult.path("unmappedColumns")
            .map { it.asText() }

        // 4. Apply mapping to all rows
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

        parser.close()

        return CsvAnalyzeResponse(
            mappings = mappingsToMap(mappings),
            preview = preview,
            totalRows = allRecords.size,
            successRows = preview.size,
            errorRows = errors,
            unmappedColumns = unmapped
        )
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
                    buyPrice = row.entryPrice,
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
                        raw.trim().take(10) // fallback: try to extract date part
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
            for ((col, value) in rowData) {
                val numericVal = value.replace(",", "").trim()
                if (numericVal.toDoubleOrNull() != null) {
                    expr = expr.replace(col, numericVal)
                }
            }
            val engine = ScriptEngineManager().getEngineByName("js")
                ?: ScriptEngineManager().getEngineByName("nashorn")
            if (engine != null) {
                engine.eval(expr)?.toString()
            } else {
                // Simple fallback: try basic arithmetic
                null
            }
        } catch (e: Exception) {
            log.debug("Failed to compute formula '{}': {}", formula, e.message)
            null
        }
    }

    private fun detectCharset(file: MultipartFile): Charset {
        val bytes = file.bytes.take(1000).toByteArray()
        // Check for BOM or common Korean encoding patterns
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
            else -> AssetType.CRYPTO
        }

    private fun parseTradeType(value: String?): TradeType =
        when (value?.uppercase()) {
            "FUTURE", "FUTURES" -> TradeType.FUTURE
            else -> TradeType.SPOT
        }

    private fun parsePosition(value: String?): PositionType? =
        when (value?.uppercase()) {
            "LONG" -> PositionType.LONG
            "SHORT" -> PositionType.SHORT
            else -> null
        }
}
```

**Step 3: Build to verify**

Run: `cd trading-note-be && ./mvnw clean compile -q`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/model/CsvImportModels.kt \
       trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/service/CsvImportService.kt
git commit -m "feat(csv-import): add CsvImportService with LLM mapping logic"
```

---

### Task 4: Backend - CsvImportController (REST endpoints)

**Files:**
- Create: `trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/controller/CsvImportController.kt`

**Step 1: Create controller**

```kotlin
package com.example.tradingnotebe.domain.journal.controller

import com.example.tradingnotebe.config.CurrentUser
import com.example.tradingnotebe.domain.journal.model.CsvAnalyzeResponse
import com.example.tradingnotebe.domain.journal.model.CsvConfirmRequest
import com.example.tradingnotebe.domain.journal.service.CsvImportService
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.SocialProvider
import com.example.tradingnotebe.domain.user.repository.UserJpaRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
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
        return User(
            id = firstUser.id,
            email = firstUser.email ?: "",
            name = firstUser.name ?: "",
            provider = firstUser.provider
        )
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
            "message" to "${savedCount}건 저장 완료"
        ))
    }
}
```

**Step 2: Build and run backend to test**

Run: `cd trading-note-be && ./mvnw clean compile -q`
Expected: BUILD SUCCESS

**Step 3: Commit**

```bash
git add trading-note-be/src/main/kotlin/com/example/tradingnotebe/domain/journal/controller/CsvImportController.kt
git commit -m "feat(csv-import): add CsvImportController with analyze/confirm endpoints"
```

---

### Task 5: Backend - Integration test with sample CSV

**Step 1: Start backend and test with curl**

Create a test CSV file and test the analyze endpoint:

```bash
# Create test CSV
cat > /tmp/test-trades.csv << 'EOF'
거래일,종목,매수가,매도가,수량,손익
2026-01-15,BTC/KRW,50000000,51000000,0.1,100000
2026-01-16,ETH/KRW,3500000,3400000,1.0,-100000
2026-01-17,SOL/KRW,150000,160000,10,100000
EOF

# Test analyze endpoint
curl -X POST http://localhost:8080/api/journals/import/csv/analyze \
  -F "file=@/tmp/test-trades.csv" \
  -H "Accept: application/json" | jq .
```

Expected: JSON response with mappings, preview rows, and success count.

**Step 2: Test confirm endpoint**

```bash
# Use the preview data from analyze to confirm
curl -X POST http://localhost:8080/api/journals/import/csv/confirm \
  -H "Content-Type: application/json" \
  -d '{"rows": [preview rows from analyze response]}'
```

**Step 3: Commit**

```bash
git commit --allow-empty -m "test(csv-import): verify backend CSV import endpoints"
```

---

### Task 6: Frontend - CSV import API client

**Files:**
- Modify: `trading-note-fe/lib/api/journal.ts`
- Create: `trading-note-fe/type/dto/csvImport.ts`

**Step 1: Create CSV import types**

```typescript
// trading-note-fe/type/dto/csvImport.ts

export interface CsvPreviewRow {
  rowNumber: number;
  tradedAt: string | null;
  symbol: string | null;
  assetType: string | null;
  tradeType: string | null;
  position: string | null;
  entryPrice: number | null;
  exitPrice: number | null;
  quantity: number | null;
  investment: number | null;
  profit: number | null;
  roi: number | null;
  leverage: number | null;
  memo: string | null;
  currency: string | null;
}

export interface CsvErrorRow {
  row: number;
  reason: string;
}

export interface CsvAnalyzeResponse {
  mappings: Record<string, Record<string, string>>;
  preview: CsvPreviewRow[];
  totalRows: number;
  successRows: number;
  errorRows: CsvErrorRow[];
  unmappedColumns: string[];
}

export interface CsvConfirmResponse {
  savedCount: number;
  message: string;
}
```

**Step 2: Add API functions to journal.ts**

Append to `trading-note-fe/lib/api/journal.ts`:

```typescript
import { CsvAnalyzeResponse, CsvConfirmResponse, CsvPreviewRow } from '@/type/dto/csvImport';

export async function analyzeCsv(file: File): Promise<CsvAnalyzeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<CsvAnalyzeResponse>(
        '/journals/import/csv/analyze',
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000, // LLM call may take time
        }
    );
    return data;
}

export async function confirmCsvImport(rows: CsvPreviewRow[]): Promise<CsvConfirmResponse> {
    const { data } = await apiClient.post<CsvConfirmResponse>(
        '/journals/import/csv/confirm',
        { rows }
    );
    return data;
}
```

**Step 3: Build to verify**

Run: `cd trading-note-fe && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add trading-note-fe/type/dto/csvImport.ts trading-note-fe/lib/api/journal.ts
git commit -m "feat(csv-import): add frontend CSV import API client and types"
```

---

### Task 7: Frontend - CsvImportModal component

**Files:**
- Create: `trading-note-fe/components/CsvImportModal.tsx`

**Step 1: Create the modal with 3 steps (upload -> preview -> result)**

```typescript
'use client';

import { useState, useCallback, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { analyzeCsv, confirmCsvImport } from '@/lib/api/journal';
import { CsvAnalyzeResponse, CsvPreviewRow } from '@/type/dto/csvImport';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'upload' | 'preview' | 'result';

export default function CsvImportModal({ isOpen, onClose, onComplete }: CsvImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<CsvAnalyzeResponse | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setIsAnalyzing(false);
    setIsSaving(false);
    setAnalyzeResult(null);
    setSavedCount(0);
    setError('');
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('CSV 파일만 업로드 가능합니다.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setFile(selectedFile);
    setError('');
    setIsAnalyzing(true);

    try {
      const result = await analyzeCsv(selectedFile);
      setAnalyzeResult(result);
      setStep('preview');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || 'CSV 분석에 실패했습니다. 파일 형식을 확인해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleConfirm = async () => {
    if (!analyzeResult) return;
    setIsSaving(true);
    setError('');

    try {
      const result = await confirmCsvImport(analyzeResult.preview);
      setSavedCount(result.savedCount);
      setStep('result');
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDone = () => {
    handleClose();
    onComplete();
  };

  if (!isOpen) return null;

  const formatNumber = (n: number | null) => {
    if (n === null || n === undefined) return '-';
    return n.toLocaleString('ko-KR');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {step === 'upload' && 'CSV 가져오기'}
              {step === 'preview' && '미리보기'}
              {step === 'result' && '가져오기 완료'}
            </h2>
          </div>
          <button onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 'upload' && !isAnalyzing && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
            >
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                CSV 파일을 드래그하거나 클릭하여 선택
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                최대 5MB, 1000행 이하
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </div>
          )}

          {/* Analyzing spinner */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-700 dark:text-slate-300 font-medium">AI가 데이터를 분석하고 있습니다...</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{file?.name}</p>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && analyzeResult && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  전체 <span className="font-medium text-slate-900 dark:text-white">{analyzeResult.totalRows}</span>건 중{' '}
                  <span className="font-medium text-emerald-500">{analyzeResult.successRows}</span>건 변환 성공
                  {analyzeResult.errorRows.length > 0 && (
                    <span className="text-red-500 ml-2">{analyzeResult.errorRows.length}건 오류</span>
                  )}
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="px-3 py-2 text-left text-slate-600 dark:text-slate-400 font-medium">#</th>
                      <th className="px-3 py-2 text-left text-slate-600 dark:text-slate-400 font-medium">거래일</th>
                      <th className="px-3 py-2 text-left text-slate-600 dark:text-slate-400 font-medium">종목</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">매수가</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">매도가</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">수량</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">투자금</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">손익</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {analyzeResult.preview.map((row) => (
                      <tr key={row.rowNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2 text-slate-500">{row.rowNumber}</td>
                        <td className="px-3 py-2 text-slate-900 dark:text-white">{row.tradedAt || '-'}</td>
                        <td className="px-3 py-2 text-slate-900 dark:text-white font-medium">{row.symbol || '-'}</td>
                        <td className="px-3 py-2 text-right text-slate-900 dark:text-white tabular-nums">{formatNumber(row.entryPrice)}</td>
                        <td className="px-3 py-2 text-right text-slate-900 dark:text-white tabular-nums">{formatNumber(row.exitPrice)}</td>
                        <td className="px-3 py-2 text-right text-slate-900 dark:text-white tabular-nums">{formatNumber(row.quantity)}</td>
                        <td className="px-3 py-2 text-right text-slate-900 dark:text-white tabular-nums">{formatNumber(row.investment)}</td>
                        <td className={`px-3 py-2 text-right tabular-nums font-medium ${
                          (row.profit ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {row.profit !== null ? `${row.profit >= 0 ? '+' : ''}${formatNumber(row.profit)}` : '-'}
                        </td>
                        <td className={`px-3 py-2 text-right tabular-nums ${
                          (row.roi ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {row.roi !== null ? `${row.roi >= 0 ? '+' : ''}${row.roi.toFixed(2)}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {analyzeResult.unmappedColumns.length > 0 && (
                <p className="mt-3 text-xs text-slate-400">
                  매핑되지 않은 컬럼: {analyzeResult.unmappedColumns.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{savedCount}건 저장 완료</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">매매일지에서 확인할 수 있습니다.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          {step === 'preview' && (
            <>
              <button
                onClick={() => { reset(); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                다시 선택
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSaving || !analyzeResult?.preview.length}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-lg transition-colors"
              >
                {isSaving ? '저장 중...' : `${analyzeResult?.successRows ?? 0}건 저장`}
              </button>
            </>
          )}
          {step === 'result' && (
            <button
              onClick={handleDone}
              className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              매매일지 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Build to verify**

Run: `cd trading-note-fe && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add trading-note-fe/components/CsvImportModal.tsx
git commit -m "feat(csv-import): add CsvImportModal with upload, preview, confirm steps"
```

---

### Task 8: Frontend - Add "CSV 가져오기" button to journal page

**Files:**
- Modify: `trading-note-fe/app/journal/page.tsx`

**Step 1: Add import and state**

At the top of the file, add import:
```typescript
import CsvImportModal from '@/components/CsvImportModal';
```

Add state inside component:
```typescript
const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
```

**Step 2: Add button next to existing action buttons**

Find the area where action buttons are rendered (near "새 거래" or bulk action buttons) and add:

```tsx
<button
  onClick={() => setIsCsvImportOpen(true)}
  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
>
  <FileSpreadsheet className="w-4 h-4" />
  CSV 가져오기
</button>
```

**Step 3: Add modal at bottom of JSX**

Before the closing tag, add:
```tsx
<CsvImportModal
  isOpen={isCsvImportOpen}
  onClose={() => setIsCsvImportOpen(false)}
  onComplete={() => {
    setIsCsvImportOpen(false);
    // Refresh journal list
    window.location.reload();
  }}
/>
```

**Step 4: Build and verify**

Run: `cd trading-note-fe && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add trading-note-fe/app/journal/page.tsx
git commit -m "feat(csv-import): add CSV import button to journal page"
```

---

### Task 9: End-to-end test

**Step 1: Start both servers**

```bash
# Terminal 1: Backend
cd trading-note-be && ./mvnw spring-boot:run

# Terminal 2: Frontend
cd trading-note-fe && npm run dev
```

**Step 2: Set OpenAI API key**

```bash
export OPENAI_API_KEY=sk-xxx  # Set your actual key
```

**Step 3: Test full flow in browser**

1. Navigate to http://localhost:3000/journal
2. Click "CSV 가져오기" button
3. Upload test CSV file
4. Verify preview table shows correctly mapped data
5. Click "저장" button
6. Verify journals are saved and appear in the list

**Step 4: Test with different CSV formats**

Create CSVs with different column names (English, Korean, different date formats) and verify LLM handles them.

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat(csv-import): complete LLM-based universal CSV import system"
```
