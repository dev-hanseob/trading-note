package com.example.tradingnotebe.domain.exchange.util

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

@Component
class AesEncryptor(
    @Value("\${exchange.encryption-key:default-key-must-be-32-bytes!!}") private val encryptionKey: String
) {
    companion object {
        private const val ALGORITHM = "AES/GCM/NoPadding"
        private const val GCM_TAG_LENGTH = 128
        private const val IV_LENGTH = 12
    }

    private val keySpec: SecretKeySpec by lazy {
        SecretKeySpec(encryptionKey.toByteArray().copyOf(32), "AES")
    }

    fun encrypt(plainText: String): String {
        if (plainText.isEmpty()) return plainText

        val iv = ByteArray(IV_LENGTH)
        SecureRandom().nextBytes(iv)

        val cipher = Cipher.getInstance(ALGORITHM)
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, GCMParameterSpec(GCM_TAG_LENGTH, iv))
        val encrypted = cipher.doFinal(plainText.toByteArray())

        val combined = iv + encrypted
        return Base64.getEncoder().encodeToString(combined)
    }

    fun decrypt(cipherText: String): String {
        if (cipherText.isEmpty()) return cipherText

        val combined = Base64.getDecoder().decode(cipherText)
        val iv = combined.copyOfRange(0, IV_LENGTH)
        val encrypted = combined.copyOfRange(IV_LENGTH, combined.size)

        val cipher = Cipher.getInstance(ALGORITHM)
        cipher.init(Cipher.DECRYPT_MODE, keySpec, GCMParameterSpec(GCM_TAG_LENGTH, iv))
        return String(cipher.doFinal(encrypted))
    }
}
