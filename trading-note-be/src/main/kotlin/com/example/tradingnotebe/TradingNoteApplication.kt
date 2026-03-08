package com.example.tradingnotebe

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.data.web.config.EnableSpringDataWebSupport
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EntityScan(basePackages = ["com.example.tradingnotebe"])
@EnableJpaAuditing
@EnableScheduling
@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
class TradingNoteApplication

fun main(args: Array<String>) {
    runApplication<TradingNoteApplication>(*args)
}