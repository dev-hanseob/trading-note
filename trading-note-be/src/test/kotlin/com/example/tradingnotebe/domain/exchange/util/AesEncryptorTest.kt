package com.example.tradingnotebe.domain.exchange.util

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class AesEncryptorTest {

    private val encryptor = AesEncryptor("12345678901234567890123456789012") // 32-byte key

    @Test
    fun `encrypt and decrypt returns original text`() {
        val original = "my-secret-api-key-12345"
        val encrypted = encryptor.encrypt(original)

        assertNotEquals(original, encrypted)
        assertEquals(original, encryptor.decrypt(encrypted))
    }

    @Test
    fun `encrypt produces different ciphertext each time due to random IV`() {
        val original = "same-plaintext"
        val encrypted1 = encryptor.encrypt(original)
        val encrypted2 = encryptor.encrypt(original)

        assertNotEquals(encrypted1, encrypted2)
        assertEquals(original, encryptor.decrypt(encrypted1))
        assertEquals(original, encryptor.decrypt(encrypted2))
    }

    @Test
    fun `encrypt empty string works`() {
        val encrypted = encryptor.encrypt("")
        assertEquals("", encryptor.decrypt(encrypted))
    }
}
