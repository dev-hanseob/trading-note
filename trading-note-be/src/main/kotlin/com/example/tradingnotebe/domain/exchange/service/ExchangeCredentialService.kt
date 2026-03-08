package com.example.tradingnotebe.domain.exchange.service

import com.example.tradingnotebe.domain.exchange.client.ExchangeClient
import com.example.tradingnotebe.domain.exchange.entity.ExchangeCredential
import com.example.tradingnotebe.domain.exchange.entity.ExchangeName
import com.example.tradingnotebe.domain.exchange.model.ExchangeCredentialRequest
import com.example.tradingnotebe.domain.exchange.model.ExchangeCredentialResponse
import com.example.tradingnotebe.domain.exchange.repository.ExchangeCredentialRepository
import com.example.tradingnotebe.domain.exchange.util.AesEncryptor
import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.domain.user.entity.UserEntity
import org.springframework.stereotype.Service
import jakarta.transaction.Transactional

@Service
@Transactional
class ExchangeCredentialService(
    private val credentialRepository: ExchangeCredentialRepository,
    private val encryptor: AesEncryptor,
    private val exchangeClients: List<ExchangeClient>
) {

    fun register(request: ExchangeCredentialRequest, user: User): ExchangeCredentialResponse {
        val client = findClient(request.exchangeName)
        val isValid = client.validateCredential(request.apiKey, request.secretKey, request.passphrase)
        if (!isValid) {
            throw IllegalArgumentException("Invalid exchange credentials for ${request.exchangeName}")
        }

        val credential = ExchangeCredential(
            exchangeName = request.exchangeName,
            apiKey = encryptor.encrypt(request.apiKey),
            secretKey = encryptor.encrypt(request.secretKey),
            passphrase = request.passphrase?.let { encryptor.encrypt(it) },
            label = request.label,
            user = UserEntity.toEntity(user)
        )
        val saved = credentialRepository.save(credential)
        return ExchangeCredentialResponse.from(saved, request.apiKey)
    }

    fun getCredentials(user: User): List<ExchangeCredentialResponse> {
        val userEntity = UserEntity.toEntity(user)
        return credentialRepository.findByUserOrderByCreatedAtDesc(userEntity).map { credential ->
            val decryptedApiKey = encryptor.decrypt(credential.apiKey)
            ExchangeCredentialResponse.from(credential, decryptedApiKey)
        }
    }

    fun deleteCredential(id: Long, user: User) {
        val userEntity = UserEntity.toEntity(user)
        val credential = credentialRepository.findByIdAndUser(id, userEntity)
            ?: throw IllegalArgumentException("Credential not found")
        credentialRepository.delete(credential)
    }

    fun validateCredential(id: Long, user: User): Boolean {
        val userEntity = UserEntity.toEntity(user)
        val credential = credentialRepository.findByIdAndUser(id, userEntity)
            ?: throw IllegalArgumentException("Credential not found")

        val client = findClient(credential.exchangeName)
        return client.validateCredential(
            encryptor.decrypt(credential.apiKey),
            encryptor.decrypt(credential.secretKey),
            credential.passphrase?.let { encryptor.decrypt(it) }
        )
    }

    private fun findClient(exchangeName: ExchangeName): ExchangeClient {
        return exchangeClients.find { it.getExchangeName() == exchangeName }
            ?: throw IllegalArgumentException("Unsupported exchange: $exchangeName")
    }
}
