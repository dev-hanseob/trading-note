package com.example.tradingnotebe.domain.exchange.service

import com.example.tradingnotebe.domain.exchange.model.ExchangeTrade
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.time.Instant

class ExchangeSyncServiceTest {

    private fun createFill(
        tradeId: String,
        orderId: String,
        price: Double,
        quantity: Double,
        fee: Double = 0.1,
        tradedAt: Instant = Instant.now()
    ) = ExchangeTrade(
        exchangeTradeId = tradeId,
        orderId = orderId,
        symbol = "BTCUSDT",
        side = "BUY",
        price = price,
        quantity = quantity,
        amount = price * quantity,
        fee = fee,
        feeCurrency = "USDT",
        tradedAt = tradedAt,
        leverage = null,
        tradeType = "SPOT",
        profit = null,
        tradeSide = null
    )

    @Test
    fun `single fill becomes single order`() {
        val service = createServiceForGroupingTest()
        val fills = listOf(createFill("t1", "order1", 65000.0, 1.0))

        val result = service.groupFillsByOrderId(fills)

        assertEquals(1, result.size)
        assertEquals("order1", result[0].orderId)
        assertEquals(65000.0, result[0].avgPrice)
        assertEquals(1.0, result[0].totalQuantity)
        assertEquals(1, result[0].fillCount)
    }

    @Test
    fun `multiple fills with same orderId are grouped with weighted average price`() {
        val service = createServiceForGroupingTest()
        val fills = listOf(
            createFill("t1", "order1", 65000.0, 0.3, fee = 0.1),
            createFill("t2", "order1", 65100.0, 0.4, fee = 0.15),
            createFill("t3", "order1", 65200.0, 0.3, fee = 0.1)
        )

        val result = service.groupFillsByOrderId(fills)

        assertEquals(1, result.size)
        val order = result[0]
        assertEquals("order1", order.orderId)
        assertEquals(1.0, order.totalQuantity, 0.0001)
        assertEquals(3, order.fillCount)
        assertEquals(3, order.tradeIds.size)
        assertEquals(0.35, order.totalFee, 0.0001)

        // Weighted average: (65000*0.3 + 65100*0.4 + 65200*0.3) / 1.0 = 65100
        assertEquals(65100.0, order.avgPrice, 0.01)
    }

    @Test
    fun `different orderIds stay as separate orders`() {
        val service = createServiceForGroupingTest()
        val fills = listOf(
            createFill("t1", "order1", 65000.0, 1.0),
            createFill("t2", "order2", 66000.0, 0.5),
            createFill("t3", "order3", 64000.0, 0.3)
        )

        val result = service.groupFillsByOrderId(fills)

        assertEquals(3, result.size)
        val orderIds = result.map { it.orderId }.toSet()
        assertEquals(setOf("order1", "order2", "order3"), orderIds)
    }

    @Test
    fun `partial fills mixed with separate orders`() {
        val service = createServiceForGroupingTest()
        val fills = listOf(
            // Order A: buy 1 BTC in 2 fills
            createFill("t1", "orderA", 65000.0, 0.6),
            createFill("t2", "orderA", 65200.0, 0.4),
            // Order B: separate sell (intentional partial sell)
            createFill("t3", "orderB", 66000.0, 0.5),
            // Order C: another separate sell
            createFill("t4", "orderC", 67000.0, 0.5)
        )

        val result = service.groupFillsByOrderId(fills)

        assertEquals(3, result.size)

        val orderA = result.find { it.orderId == "orderA" }!!
        assertEquals(1.0, orderA.totalQuantity, 0.0001)
        assertEquals(2, orderA.fillCount)
        // Weighted avg: (65000*0.6 + 65200*0.4) / 1.0 = 65080
        assertEquals(65080.0, orderA.avgPrice, 0.01)

        val orderB = result.find { it.orderId == "orderB" }!!
        assertEquals(0.5, orderB.totalQuantity, 0.0001)
        assertEquals(1, orderB.fillCount)

        val orderC = result.find { it.orderId == "orderC" }!!
        assertEquals(0.5, orderC.totalQuantity, 0.0001)
        assertEquals(1, orderC.fillCount)
    }

    @Test
    fun `earliest fill time is used as traded time`() {
        val service = createServiceForGroupingTest()
        val t1 = Instant.parse("2026-03-07T10:00:00Z")
        val t2 = Instant.parse("2026-03-07T10:00:05Z")
        val t3 = Instant.parse("2026-03-07T10:00:10Z")

        val fills = listOf(
            createFill("t1", "order1", 65000.0, 0.3, tradedAt = t2),
            createFill("t2", "order1", 65100.0, 0.4, tradedAt = t1),
            createFill("t3", "order1", 65200.0, 0.3, tradedAt = t3)
        )

        val result = service.groupFillsByOrderId(fills)
        assertEquals(t1, result[0].tradedAt)
    }

    @Test
    fun `futures fills with profit are summed`() {
        val service = createServiceForGroupingTest()
        val fills = listOf(
            ExchangeTrade("t1", "order1", "BTCUSDT", "SELL", 65000.0, 0.3,
                65000.0 * 0.3, 0.1, "USDT", Instant.now(), 10, "FUTURES", 150.0, "close"),
            ExchangeTrade("t2", "order1", "BTCUSDT", "SELL", 65100.0, 0.2,
                65100.0 * 0.2, 0.08, "USDT", Instant.now(), 10, "FUTURES", 120.0, "close")
        )

        val result = service.groupFillsByOrderId(fills)
        assertEquals(1, result.size)
        assertEquals(270.0, result[0].profit!!, 0.01)
        assertEquals("close", result[0].tradeSide)
    }

    private fun createServiceForGroupingTest(): ExchangeSyncService {
        // We only need the groupFillsByOrderId method which doesn't use any dependencies
        return ExchangeSyncService(
            credentialRepository = org.mockito.Mockito.mock(),
            journalRepository = org.mockito.Mockito.mock(),
            encryptor = org.mockito.Mockito.mock(),
            exchangeClients = emptyList()
        )
    }
}
