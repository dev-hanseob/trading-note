package com.example.tradingnotebe.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class StaticResourceConfig(
    @Value("\${file.upload-dir}") private val uploadDir: String
) : WebMvcConfigurer {

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        val absolutePath = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize()
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations("file:$absolutePath/")
    }
}
