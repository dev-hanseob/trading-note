package com.example.tradingnotebe.domain.journal.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.*

@Service
class FileStorageService(
    @Value("\${file.upload-dir}") private val uploadDir: String,
    @Value("\${file.base-url}") private val baseUrl: String
) {

    fun store(file: MultipartFile, userId: UUID): String {
        val extension = file.originalFilename
            ?.substringAfterLast('.', "")
            ?.ifEmpty { "png" }
            ?: "png"

        val fileName = "${UUID.randomUUID()}.$extension"
        val dirPath: Path = Paths.get(uploadDir).toAbsolutePath().normalize()
            .resolve("charts").resolve(userId.toString())
        Files.createDirectories(dirPath)

        val filePath = dirPath.resolve(fileName)
        file.transferTo(filePath.toFile())

        return "$baseUrl/charts/$userId/$fileName"
    }
}
