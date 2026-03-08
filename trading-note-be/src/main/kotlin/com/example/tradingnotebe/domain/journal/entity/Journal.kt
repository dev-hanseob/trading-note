package com.example.tradingnotebe.domain.journal.entity

import com.example.tradingnotebe.domain.exception.PositionAlreadyClosedException
import com.example.tradingnotebe.domain.journal.model.AddJournalRequest
import com.example.tradingnotebe.domain.journal.model.ClosePositionRequest
import com.example.tradingnotebe.domain.user.entity.UserEntity
import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity(name = "journal")
@Table(
    indexes = [
        Index(name = "idx_journal_user_id", columnList = "user_id"),
        Index(name = "idx_journal_traded_at", columnList = "traded_at"),
        Index(name = "idx_journal_trade_status", columnList = "trade_status"),
        Index(name = "idx_journal_symbol", columnList = "symbol"),
        Index(name = "idx_journal_user_traded_at", columnList = "user_id, traded_at"),
        Index(name = "idx_journal_exchange_trade_id", columnList = "exchange_trade_id")
    ]
)
class Journal(

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: Long? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false)
    val assetType: AssetType,

    @Enumerated(EnumType.STRING)
    @Column(name = "trade_type", nullable = false)
    val tradeType: TradeType,

    @Enumerated(EnumType.STRING)
    @Column(name = "position")
    val position: PositionType? = null,

    @Column(name = "currency", nullable = false)
    val currency: String,

    @Column(name = "symbol")
    val symbol: String? = null,

    @Column(name = "buy_price")
    val buyPrice: Double? = null,

    @Column(name = "investment", nullable = false)
    val investment: Double,

    @Column(name = "profit", nullable = false)
    val profit: Double,

    @Column(name = "roi", nullable = false)
    val roi: Double,

    @Column(name = "quantity")
    val quantity: Double? = null,

    @Column(name = "leverage")
    val leverage: Int? = null,

    @Column(name = "memo")
    val memo: String? = null,

    @Column(name = "traded_at", nullable = false)
    val tradedAt: LocalDate,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: UserEntity,

    // --- New fields (all nullable for ddl-auto: update compatibility) ---

    @Enumerated(EnumType.STRING)
    @Column(name = "trade_status")
    val tradeStatus: TradeStatus? = null,

    @Column(name = "entry_price")
    val entryPrice: Double? = null,

    @Column(name = "stop_loss")
    val stopLoss: Double? = null,

    @Column(name = "take_profit_price")
    val takeProfitPrice: Double? = null,

    @Column(name = "position_size")
    val positionSize: Double? = null,

    @Column(name = "account_risk_percent")
    val accountRiskPercent: Double? = null,

    @Column(name = "chart_screenshot_url")
    val chartScreenshotUrl: String? = null,

    @Column(name = "timeframes")
    val timeframes: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "setup_type")
    val setupType: SetupType? = null,

    @Column(name = "key_levels")
    val keyLevels: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "emotion")
    val emotion: EmotionType? = null,

    @Column(name = "physical_condition")
    val physicalCondition: Int? = null,

    @Column(name = "influenced_by_last_trade")
    val influencedByLastTrade: Boolean? = null,

    @Column(name = "checked_rule_ids")
    val checkedRuleIds: String? = null,

    @Column(name = "narrative", columnDefinition = "TEXT")
    val narrative: String? = null,

    @Column(name = "exit_price")
    val exitPrice: Double? = null,

    @Column(name = "exit_date")
    val exitDate: LocalDate? = null,

    @Column(name = "realized_pnl")
    val realizedPnl: Double? = null,

    @Column(name = "post_trade_analysis", columnDefinition = "TEXT")
    val postTradeAnalysis: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "execution_result")
    val executionResult: ExecutionResult? = null,

    @Column(name = "would_take_again")
    val wouldTakeAgain: Boolean? = null,

    @Column(name = "parent_journal_id")
    val parentJournalId: Long? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "exchange_name")
    val exchangeName: com.example.tradingnotebe.domain.exchange.entity.ExchangeName? = null,

    @Column(name = "exchange_trade_id")
    val exchangeTradeId: String? = null,

    @Column(name = "exchange_credential_id")
    val exchangeCredentialId: Long? = null,

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime? = null
) {

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()

    constructor() : this(
        assetType = AssetType.CRYPTO,
        tradeType = TradeType.SPOT,
        currency = "",
        investment = 0.0,
        profit = 0.0,
        roi = 0.0,
        tradedAt = LocalDate.now(),
        user = UserEntity(email = "default@example.com")
    )

    fun updateFrom(request: AddJournalRequest): Journal {
        return Journal(
            id = this.id,
            assetType = request.assetType,
            tradeType = request.tradeType,
            position = request.position,
            currency = request.currency,
            symbol = request.symbol,
            buyPrice = request.buyPrice,
            investment = request.investment,
            profit = request.profit,
            roi = request.roi,
            quantity = request.quantity,
            leverage = request.leverage,
            memo = request.memo,
            tradedAt = request.tradedAt,
            user = this.user,
            tradeStatus = request.tradeStatus,
            entryPrice = request.entryPrice,
            stopLoss = request.stopLoss,
            takeProfitPrice = request.takeProfitPrice,
            positionSize = request.positionSize,
            accountRiskPercent = request.accountRiskPercent,
            chartScreenshotUrl = request.chartScreenshotUrl,
            timeframes = request.timeframes,
            setupType = request.setupType,
            keyLevels = request.keyLevels,
            emotion = request.emotion,
            physicalCondition = request.physicalCondition,
            influencedByLastTrade = request.influencedByLastTrade,
            checkedRuleIds = request.checkedRuleIds,
            narrative = request.narrative,
            exitPrice = request.exitPrice,
            exitDate = request.exitDate,
            realizedPnl = request.realizedPnl,
            postTradeAnalysis = request.postTradeAnalysis,
            executionResult = request.executionResult,
            wouldTakeAgain = request.wouldTakeAgain,
            parentJournalId = request.parentJournalId,
            exchangeName = this.exchangeName,
            exchangeTradeId = this.exchangeTradeId,
            exchangeCredentialId = this.exchangeCredentialId,
            updatedAt = LocalDateTime.now()
        )
    }

    fun close(request: ClosePositionRequest): Journal {
        if (this.tradeStatus != TradeStatus.OPEN) {
            throw PositionAlreadyClosedException(this.id!!)
        }
        return Journal(
            id = this.id,
            assetType = this.assetType,
            tradeType = this.tradeType,
            position = this.position,
            currency = this.currency,
            symbol = this.symbol,
            buyPrice = this.buyPrice,
            investment = this.investment,
            profit = this.profit,
            roi = this.roi,
            quantity = this.quantity,
            leverage = this.leverage,
            memo = this.memo,
            tradedAt = this.tradedAt,
            user = this.user,
            tradeStatus = TradeStatus.CLOSED,
            entryPrice = this.entryPrice,
            stopLoss = this.stopLoss,
            takeProfitPrice = this.takeProfitPrice,
            positionSize = this.positionSize,
            accountRiskPercent = this.accountRiskPercent,
            chartScreenshotUrl = this.chartScreenshotUrl,
            timeframes = this.timeframes,
            setupType = this.setupType,
            keyLevels = this.keyLevels,
            emotion = this.emotion,
            physicalCondition = this.physicalCondition,
            influencedByLastTrade = this.influencedByLastTrade,
            checkedRuleIds = this.checkedRuleIds,
            narrative = this.narrative,
            exitPrice = request.exitPrice,
            exitDate = request.exitDate ?: LocalDate.now(),
            realizedPnl = request.realizedPnl,
            postTradeAnalysis = request.postTradeAnalysis,
            executionResult = request.executionResult,
            wouldTakeAgain = request.wouldTakeAgain,
            parentJournalId = this.parentJournalId,
            exchangeName = this.exchangeName,
            exchangeTradeId = this.exchangeTradeId,
            exchangeCredentialId = this.exchangeCredentialId,
            updatedAt = LocalDateTime.now()
        )
    }
}
