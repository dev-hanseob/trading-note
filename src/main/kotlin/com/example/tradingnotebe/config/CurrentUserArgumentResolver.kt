package com.example.tradingnotebe.config

import com.example.tradingnotebe.domain.user.domain.User
import com.example.tradingnotebe.util.AuthUtil
import org.springframework.core.MethodParameter
import org.springframework.stereotype.Component
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer

/**
 * @CurrentUser 어노테이션이 붙은 메서드 파라미터에 현재 인증된 사용자 정보를 주입합니다.
 */
@Component
class CurrentUserArgumentResolver : HandlerMethodArgumentResolver {
    
    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return parameter.hasParameterAnnotation(CurrentUser::class.java) && 
               User::class.java.isAssignableFrom(parameter.parameterType)
    }
    
    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?
    ): Any? {
        val currentUser = AuthUtil.getCurrentUser()
        
        // @CurrentUser(required = false)인 경우 null을 허용
        val annotation = parameter.getParameterAnnotation(CurrentUser::class.java)
        val required = annotation?.required ?: true
        
        if (required && currentUser == null) {
            throw IllegalStateException("User authentication required")
        }
        
        return currentUser
    }
}