package com.example.tradingnotebe.domain.journal.controller;

import com.example.tradingnotebe.domain.journal.entity.AssetType;
import com.example.tradingnotebe.domain.journal.entity.PositionType;
import com.example.tradingnotebe.domain.journal.entity.TradeType;
import com.example.tradingnotebe.domain.journal.model.AddJournalRequest;
import com.example.tradingnotebe.domain.journal.model.GetJournalPageableResponse;
import com.example.tradingnotebe.domain.journal.model.JournalResponse;
import com.example.tradingnotebe.domain.journal.service.JournalService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JournalController.class)
class JournalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JournalService journalService;

    @Autowired
    private ObjectMapper objectMapper;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public JournalService journalService() {
            return mock(JournalService.class);
        }
    }

    @Test
    @DisplayName("매매일지 조회 API 테스트")
    void getAllJournals() throws Exception {
        JournalResponse journal = new JournalResponse(
                1L,
                AssetType.CRYPTO,
                TradeType.SPOT,
                PositionType.LONG,
                "KRW",
                "BTC/USDT",
                32000000.0,
                1000000.0,
                50000.0,
                5.0,
                0.5,
                null,
                "수익!",
                LocalDateTime.now()
        );
        GetJournalPageableResponse response = new GetJournalPageableResponse(1, 0, 10, List.of(journal));

        when(journalService.getAll(any())).thenReturn(response);

        mockMvc.perform(get("/api/journal")
                        .param("page", "0")
                        .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.journals[0].assetType").value("CRYPTO"))
                .andExpect(jsonPath("$.journals[0].tradeType").value("SPOT"))
                .andExpect(jsonPath("$.journals[0].position").value("LONG"))
                .andExpect(jsonPath("$.journals[0].currency").value("KRW"))
                .andExpect(jsonPath("$.journals[0].symbol").value("BTC/USDT"))
                .andExpect(jsonPath("$.journals[0].buyPrice").value(32000000.0))
                .andExpect(jsonPath("$.journals[0].investment").value(1000000.0))
                .andExpect(jsonPath("$.journals[0].profit").value(50000.0))
                .andExpect(jsonPath("$.journals[0].roi").value(5.0))
                .andExpect(jsonPath("$.journals[0].quantity").value(0.5))
                .andExpect(jsonPath("$.journals[0].memo").value("수익!"));
    }

    @Test
    @DisplayName("매매일지 등록 API 테스트")
    void addJournal() throws Exception {
        AddJournalRequest request = new AddJournalRequest(
                AssetType.CRYPTO,
                TradeType.SPOT,
                PositionType.LONG,
                "KRW",
                "BTC/USDT",
                32000000.0,
                1000000,
                50000,
                5.0,
                0.5,
                null,
                "수익!",
                LocalDateTime.now()
        );

        JournalResponse mockResponse = JournalResponse.fromDomain(request.toDomain(request));
        when(journalService.create(request)).thenReturn(mockResponse);

        mockMvc.perform(post("/api/journal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assetType").value("CRYPTO"))
                .andExpect(jsonPath("$.tradeType").value("SPOT"))
                .andExpect(jsonPath("$.position").value("LONG"))
                .andExpect(jsonPath("$.currency").value("KRW"))
                .andExpect(jsonPath("$.symbol").value("BTC/USDT"))
                .andExpect(jsonPath("$.buyPrice").value(32000000.0))
                .andExpect(jsonPath("$.investment").value(1000000.0))
                .andExpect(jsonPath("$.profit").value(50000.0))
                .andExpect(jsonPath("$.roi").value(5.0))
                .andExpect(jsonPath("$.quantity").value(0.5))
                .andExpect(jsonPath("$.memo").value("수익!"));
    }
}