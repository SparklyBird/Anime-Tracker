package com.animetracker.controller;

import com.animetracker.dto.AnimeResponse;
import com.animetracker.model.AnimeStatus;
import com.animetracker.service.AnimeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AnimeController.class)
class AnimeControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean  AnimeService animeService;
    @Autowired ObjectMapper objectMapper;

    /**
     * GET /api/anime is paginated: it delegates to getByStatusPaged and returns a
     * wrapper object, not a bare array. Stubbing getByStatus here would leave the
     * real call unstubbed and the response body empty.
     */
    @Test
    void getByStatus_returns200WithPagedBody() throws Exception {
        AnimeResponse r = new AnimeResponse();
        r.setId(1L); r.setRussianName("Тест"); r.setStatus(AnimeStatus.WATCHING);

        Map<String, Object> paged = new LinkedHashMap<>();
        paged.put("content", List.of(r));
        paged.put("page", 0);
        paged.put("totalPages", 1);
        paged.put("totalElements", 1L);
        paged.put("last", true);

        // 0 and 50 are the controller's declared defaults
        when(animeService.getByStatusPaged(AnimeStatus.WATCHING, 0, 50)).thenReturn(paged);

        mockMvc.perform(get("/api/anime").param("status", "WATCHING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].russianName").value("Тест"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.last").value(true));
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

    @Test
    void exportCsv_sendsAttachmentWithBom() throws Exception {
        when(animeService.exportAll("csv")).thenReturn("russianName\r\n\"Тест\"\r\n");

        MvcResult result = mockMvc.perform(get("/api/anime/export/csv"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"anime-tracker.csv\""))
                .andReturn();

        String body = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(body).startsWith("\uFEFF");   // without this Excel mangles Cyrillic
        assertThat(body).contains("Тест");
    }

    @Test
    void exportJson_sendsAttachmentWithoutBom() throws Exception {
        when(animeService.exportAll("json")).thenReturn("[]");

        MvcResult result = mockMvc.perform(get("/api/anime/export/json"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"anime-tracker.json\""))
                .andReturn();

        assertThat(result.getResponse().getContentAsString(StandardCharsets.UTF_8)).isEqualTo("[]");
    }

    @Test
    void exportUnknownFormat_returns400() throws Exception {
        when(animeService.exportAll("xml"))
                .thenThrow(new IllegalArgumentException("Unsupported export format: xml"));

        mockMvc.perform(get("/api/anime/export/xml"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void importFile_returns200WithCounts() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "backup.txt", "text/plain",
                "Наруто\nБлич\n".getBytes(StandardCharsets.UTF_8));

        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("parsed", 2);
        counts.put("imported", 1);
        counts.put("skipped", 1);
        when(animeService.importFile(any())).thenReturn(counts);

        mockMvc.perform(multipart("/api/anime/import").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.parsed").value(2))
                .andExpect(jsonPath("$.imported").value(1))
                .andExpect(jsonPath("$.skipped").value(1));
    }

    @Test
    void importEmptyFile_returns400() throws Exception {
        MockMultipartFile empty = new MockMultipartFile("file", "empty.txt", "text/plain", new byte[0]);

        mockMvc.perform(multipart("/api/anime/import").file(empty))
                .andExpect(status().isBadRequest());
    }
}
