package com.example.tradingnotebe.domain.journal.entity

enum class TradeType {
    SPOT,       // 현물
    FUTURES,    // 선물
    OPTIONS,    // 옵션
    MARGIN      // 마진
}