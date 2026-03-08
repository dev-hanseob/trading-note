package com.example.tradingnotebe.domain.common

data class PagedResponse<T>(
    val total: Long,
    val page: Int,
    val pageSize: Int,
    val items: List<T>
)
