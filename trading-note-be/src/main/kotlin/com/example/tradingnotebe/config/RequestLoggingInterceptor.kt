package com.example.tradingnotebe.config

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.HandlerInterceptor
import org.springframework.web.servlet.ModelAndView
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Component
class RequestLoggingInterceptor : HandlerInterceptor {

    private val logger = LoggerFactory.getLogger(RequestLoggingInterceptor::class.java)
    private val timeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")
    
    companion object {
        const val START_TIME_ATTRIBUTE = "startTime"
    }

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        val startTime = System.currentTimeMillis()
        request.setAttribute(START_TIME_ATTRIBUTE, startTime)
        
        val requestId = MDC.get("requestId") ?: "unknown"
        
        // 컨트롤러 및 메서드 정보 추출
        val handlerInfo = if (handler is HandlerMethod) {
            val controllerName = handler.beanType.simpleName
            val methodName = handler.method.name
            "$controllerName::$methodName"
        } else {
            handler.javaClass.simpleName
        }
        
        logger.info("[$requestId] API Processing: $handlerInfo")
        
        return true
    }

    override fun postHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        modelAndView: ModelAndView?
    ) {
        val startTime = request.getAttribute(START_TIME_ATTRIBUTE) as? Long ?: return
        val processingTime = System.currentTimeMillis() - startTime
        val requestId = MDC.get("requestId") ?: "unknown"
        
        val performanceLevel = when {
            processingTime < 50 -> "FAST"
            processingTime < 200 -> "NORMAL"
            processingTime < 500 -> "SLOW"
            processingTime < 1000 -> "VERY_SLOW"
            else -> "TIMEOUT"
        }
        
        logger.info("[$requestId] API Completed: ${processingTime}ms $performanceLevel${modelAndView?.let { " | View: ${it.viewName ?: "N/A"}" } ?: ""}")
    }

    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?
    ) {
        if (ex != null) {
            val requestId = MDC.get("requestId") ?: "unknown"
            logger.error("[$requestId] API Failed: ${ex.javaClass.simpleName} - ${ex.message}", ex)
        }
    }

}