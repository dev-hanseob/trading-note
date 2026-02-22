package com.example.tradingnotebe.domain.subscription.controller

import com.example.tradingnotebe.domain.subscription.repository.PaymentHistoryJpaRepository
import com.example.tradingnotebe.domain.subscription.entity.PaymentStatus
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/public/webhook")
class TossWebhookController(
    private val paymentHistoryRepo: PaymentHistoryJpaRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @PostMapping("/toss")
    fun handleWebhook(@RequestBody payload: Map<String, Any>): ResponseEntity<String> {
        val eventType = payload["eventType"] as? String
        val data = payload["data"] as? Map<*, *>

        log.info("Toss webhook received: eventType=$eventType")

        if (data == null) {
            return ResponseEntity.ok("OK")
        }

        val orderId = data["orderId"] as? String
        val paymentKey = data["paymentKey"] as? String
        val status = data["status"] as? String

        if (orderId != null) {
            val payment = paymentHistoryRepo.findByOrderId(orderId)
            if (payment != null) {
                when (status) {
                    "DONE" -> {
                        payment.status = PaymentStatus.DONE
                        payment.paymentKey = paymentKey
                        payment.paidAt = LocalDateTime.now()
                        paymentHistoryRepo.save(payment)
                        log.info("Payment confirmed via webhook: orderId=$orderId")
                    }
                    "CANCELED", "PARTIAL_CANCELED" -> {
                        payment.status = PaymentStatus.CANCELLED
                        paymentHistoryRepo.save(payment)
                        log.info("Payment cancelled via webhook: orderId=$orderId")
                    }
                    "ABORTED", "EXPIRED" -> {
                        payment.status = PaymentStatus.FAILED
                        payment.failReason = "Payment $status"
                        paymentHistoryRepo.save(payment)
                        log.info("Payment failed via webhook: orderId=$orderId, status=$status")
                    }
                }
            }
        }

        return ResponseEntity.ok("OK")
    }
}
