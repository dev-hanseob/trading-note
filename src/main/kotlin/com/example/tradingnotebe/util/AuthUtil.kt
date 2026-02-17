package com.example.tradingnotebe.util

import com.example.tradingnotebe.domain.user.domain.User
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import java.util.*

@Component
class AuthUtil {
    
    companion object {
        /**
         * 현재 인증된 사용자 정보를 가져옵니다.
         * JWT 인증 필터에서 SecurityContext에 저장한 User 객체를 반환합니다.
         * 
         * @return 현재 인증된 사용자 또는 null
         */
        fun getCurrentUser(): User? {
            val authentication = SecurityContextHolder.getContext().authentication
            return if (authentication?.principal is User) {
                authentication.principal as User
            } else {
                null
            }
        }
        
        /**
         * 현재 인증된 사용자의 ID를 가져옵니다.
         * 
         * @return 사용자 ID 또는 null
         */
        fun getCurrentUserId(): UUID? {
            return getCurrentUser()?.id
        }
        
        /**
         * 현재 인증된 사용자의 이메일을 가져옵니다.
         * 
         * @return 사용자 이메일 또는 null
         */
        fun getCurrentUserEmail(): String? {
            return getCurrentUser()?.email
        }
        
        /**
         * 현재 사용자가 인증되었는지 확인합니다.
         * 
         * @return 인증 여부
         */
        fun isAuthenticated(): Boolean {
            return getCurrentUser() != null
        }
        
        /**
         * 현재 인증된 사용자 정보를 필수로 가져옵니다.
         * 인증되지 않은 경우 예외를 발생시킵니다.
         * 
         * @return 현재 인증된 사용자
         * @throws IllegalStateException 인증되지 않은 경우
         */
        fun requireCurrentUser(): User {
            return getCurrentUser() ?: throw IllegalStateException("User not authenticated")
        }
        
        /**
         * 현재 인증된 사용자 ID를 필수로 가져옵니다.
         * 인증되지 않은 경우 예외를 발생시킵니다.
         * 
         * @return 사용자 ID
         * @throws IllegalStateException 인증되지 않은 경우
         */
        fun requireCurrentUserId(): UUID {
            return requireCurrentUser().id ?: throw IllegalStateException("User ID not found")
        }
    }
}