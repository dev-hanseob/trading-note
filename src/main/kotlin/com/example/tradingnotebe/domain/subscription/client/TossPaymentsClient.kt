package com.example.tradingnotebe.domain.subscription.client

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
import java.util.Base64

@Component
class TossPaymentsClient(
    @Value("\${toss.payments.secret-key}") private val secretKey: String,
    @Value("\${toss.payments.api-url}") private val apiUrl: String
) {
    private val webClient: WebClient = WebClient.builder()
        .baseUrl(apiUrl)
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .build()

    private fun authHeader(): String {
        val encoded = Base64.getEncoder().encodeToString("$secretKey:".toByteArray())
        return "Basic $encoded"
    }

    fun issueBillingKey(authKey: String, customerKey: String): BillingKeyResponse {
        return try {
            webClient.post()
                .uri("/billing/authorizations/issue")
                .header(HttpHeaders.AUTHORIZATION, authHeader())
                .bodyValue(mapOf(
                    "authKey" to authKey,
                    "customerKey" to customerKey
                ))
                .retrieve()
                .bodyToMono(BillingKeyResponse::class.java)
                .block() ?: throw RuntimeException("Failed to issue billing key: empty response")
        } catch (e: WebClientResponseException) {
            throw RuntimeException("Toss API error issuing billing key: ${e.responseBodyAsString}", e)
        }
    }

    fun executeBilling(
        billingKey: String,
        customerKey: String,
        amount: Int,
        orderId: String,
        orderName: String
    ): PaymentResponse {
        return try {
            webClient.post()
                .uri("/billing/{billingKey}", billingKey)
                .header(HttpHeaders.AUTHORIZATION, authHeader())
                .bodyValue(mapOf(
                    "customerKey" to customerKey,
                    "amount" to amount,
                    "orderId" to orderId,
                    "orderName" to orderName
                ))
                .retrieve()
                .bodyToMono(PaymentResponse::class.java)
                .block() ?: throw RuntimeException("Failed to execute billing: empty response")
        } catch (e: WebClientResponseException) {
            throw RuntimeException("Toss API error executing billing: ${e.responseBodyAsString}", e)
        }
    }

    fun cancelPayment(paymentKey: String, cancelReason: String): CancelResponse {
        return try {
            webClient.post()
                .uri("/payments/{paymentKey}/cancel", paymentKey)
                .header(HttpHeaders.AUTHORIZATION, authHeader())
                .bodyValue(mapOf(
                    "cancelReason" to cancelReason
                ))
                .retrieve()
                .bodyToMono(CancelResponse::class.java)
                .block() ?: throw RuntimeException("Failed to cancel payment: empty response")
        } catch (e: WebClientResponseException) {
            throw RuntimeException("Toss API error cancelling payment: ${e.responseBodyAsString}", e)
        }
    }
}

data class BillingKeyResponse(
    val billingKey: String,
    val customerKey: String,
    val authenticatedAt: String?,
    val method: String?,
    val card: CardInfo?
)

data class CardInfo(
    val issuerCode: String?,
    val acquirerCode: String?,
    val number: String?,
    val cardType: String?,
    val ownerType: String?
)

data class PaymentResponse(
    val paymentKey: String,
    val orderId: String,
    val status: String,
    val totalAmount: Int,
    val approvedAt: String?,
    val method: String?,
    val card: CardInfo?
)

data class CancelResponse(
    val paymentKey: String,
    val orderId: String,
    val status: String
)
