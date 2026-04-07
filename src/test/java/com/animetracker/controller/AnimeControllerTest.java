package com.animetracker.controller;

import com.animetracker.dto.AnimeResponse;
import com.animetracker.model.AnimeStatus;
import com.animetracker.service.AnimeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AnimeController.class)
class AnimeControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean  AnimeService animeService;
    @Autowired ObjectMapper objectMapper;

    @Test
    void getByStatus_returns200WithList() throws Exception {
        AnimeResponse r = new AnimeResponse();
        r.setId(1L); r.setRussianName("Тест"); r.setStatus(AnimeStatus.WATCHING);
        when(animeService.getByStatus(AnimeStatus.WATCHING)).thenReturn(List.of(r));

        mockMvc.perform(get("/api/anime").param("status", "WATCHING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].russianName").value("Тест"));
    }

    @Test
    void getById_returns200() throws Exception {
        AnimeResponse r = new AnimeResponse();
        r.setId(7L); r.setRussianName("Блич");
        when(animeService.getById(7L)).thenReturn(r);

        mockMvc.perform(get("/api/anime/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.russianName").value("Блич"));
    }

    @Test
    void getCounts_returns200() throws Exception {
        when(animeService.getCounts()).thenReturn(java.util.Map.of("WATCHING", 5L));
        mockMvc.perform(get("/api/anime/counts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.WATCHING").value(5));
    }
}
