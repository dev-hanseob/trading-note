package com.example.tradingnotebe.config

import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.Ordered

@Configuration
class RequestLoggingConfig {

    @Bean
    fun customRequestLoggingFilterRegistration(
        customRequestLoggingFilter: CustomRequestLoggingFilter
    ): FilterRegistrationBean<CustomRequestLoggingFilter> {
        val registrationBean = FilterRegistrationBean<CustomRequestLoggingFilter>()
        registrationBean.filter = customRequestLoggingFilter
        registrationBean.addUrlPatterns("/*")
        registrationBean.order = Ordered.HIGHEST_PRECEDENCE
        registrationBean.setName("customRequestLoggingFilter")
        return registrationBean
    }

    // 기존 CommonsRequestLoggingFilter는 비활성화
    // @Bean
    // fun requestLoggingFilter(): CommonsRequestLoggingFilter {
    //     val loggingFilter = CommonsRequestLoggingFilter()
    //     loggingFilter.setIncludeClientInfo(true)
    //     loggingFilter.setIncludeQueryString(true)
    //     loggingFilter.setIncludePayload(true)
    //     loggingFilter.setIncludeHeaders(false)
    //     loggingFilter.setMaxPayloadLength(10000)
    //     loggingFilter.setAfterMessagePrefix("REQUEST DATA: ")
    //     return loggingFilter
    // }
}