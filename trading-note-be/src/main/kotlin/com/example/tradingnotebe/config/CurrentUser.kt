package com.example.tradingnotebe.config

/**
 * 컨트롤러 메서드 파라미터에 현재 인증된 사용자 정보를 주입하기 위한 어노테이션입니다.
 * 
 * 사용 예:
 * ```kotlin
 * @PostMapping("/example")
 * fun example(@CurrentUser user: User): ResponseEntity<String> {
 *     // user는 현재 인증된 사용자 정보
 *     return ResponseEntity.ok("Hello ${user.email}")
 * }
 * ```
 * 
 * @param required 필수 여부. true인 경우 사용자가 인증되지 않으면 예외 발생 (기본값: true)
 */
@Target(AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
annotation class CurrentUser(
    val required: Boolean = true
)