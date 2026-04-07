package com.animetracker.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jikan")
public class JikanController {

    private static final Logger log = LoggerFactory.getLogger(JikanController.class);

    private static final String JIKAN_SEARCH  = "https://api.jikan.moe/v4/anime?q={q}&limit=8&sfw=true";
    private static final String JIKAN_DETAIL  = "https://api.jikan.moe/v4/anime/{id}";
    private static final String SHIKIMORI_SEARCH = "https://shikimori.one/api/animes?search={q}&limit=10&order=popularity";
    private static final String GTRANSLATE    =
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl={sl}&tl={tl}&dt=t&q={q}";

    private final RestTemplate restTemplate = new RestTemplate();

    // ── Shikimori search (Russian queries, IDs = MAL IDs) ────────────────────
    @GetMapping("/shikimori")
    public ResponseEntity<String> shikimoriSearch(@RequestParam String q) {
        log.info("Shikimori search: {}", q);
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "AnimeTracker/1.0");
            org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
            var response = restTemplate.exchange(SHIKIMORI_SEARCH,
                org.springframework.http.HttpMethod.GET, entity, String.class, q);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Shikimori search error: {}", e.getMessage());
            return ResponseEntity.ok("[]");
        }
    }

    // ── Jikan search ─────────────────────────────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<String> search(@RequestParam String q) {
        log.info("Jikan search: {}", q);
        try {
            return ResponseEntity.ok(restTemplate.getForObject(JIKAN_SEARCH, String.class, q));
        } catch (Exception e) {
            log.error("Jikan search error: {}", e.getMessage());
            return ResponseEntity.ok("{\"data\":[]}");
        }
    }

    // ── Jikan full details (includes all language titles) ─────────────────────
    @GetMapping("/details/{id}")
    public ResponseEntity<String> details(@PathVariable int id) {
        log.info("Jikan details: {}", id);
        try {
            return ResponseEntity.ok(restTemplate.getForObject(JIKAN_DETAIL, String.class, id));
        } catch (Exception e) {
            log.error("Jikan details error: {}", e.getMessage());
            return ResponseEntity.ok("{\"data\":null}");
        }
    }

    // ── Google Translate (free, no key) ───────────────────────────────────────
    @GetMapping("/translate")
    public ResponseEntity<String> translate(
            @RequestParam String q,
            @RequestParam(defaultValue = "en") String sl,
            @RequestParam(defaultValue = "ru") String tl) {
        String translated = translateText(q, sl, tl);
        return ResponseEntity.ok(
            "{\"responseData\":{\"translatedText\":\"" +
            translated.replace("\\", "\\\\").replace("\"", "\\\"") + "\"}}");
    }

    // ── Title + synopsis via Google Translate (free) ──────────────────────────
    @PostMapping("/ai-process")
    public ResponseEntity<Map<String, String>> process(@RequestBody Map<String, String> body) {
        String title    = body.getOrDefault("title",   "").trim();
        String synopsis = body.getOrDefault("synopsis","").trim();

        String ruTitle = translateText(title, "en", "ru");

        // Translate first 2 sentences of synopsis → short Russian description
        String ruSynopsis = "";
        if (!synopsis.isBlank()) {
            String short2 = firstTwoSentences(synopsis);
            ruSynopsis = translateText(short2, "en", "ru");
        }

        log.info("Processed '{}' → '{}' | synopsis {} chars", title, ruTitle, ruSynopsis.length());
        return ResponseEntity.ok(Map.of("ruTitle", ruTitle, "ruSynopsis", ruSynopsis));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private String translateText(String text, String sl, String tl) {
        if (text == null || text.isBlank()) return "";
        try {
            Object[] raw = restTemplate.getForObject(GTRANSLATE, Object[].class, sl, tl, text);
            if (raw != null && raw[0] instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> parts = (List<Object>) raw[0];
                StringBuilder sb = new StringBuilder();
                for (Object part : parts) {
                    if (part instanceof List) {
                        Object t = ((List<?>) part).get(0);
                        if (t != null) sb.append(t);
                    }
                }
                return sb.toString().trim();
            }
        } catch (Exception e) {
            log.warn("translateText failed: {}", e.getMessage());
        }
        return text; // return original as fallback
    }

    private String firstTwoSentences(String text) {
        String[] parts = text.split("(?<=[.!?])\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(2, parts.length); i++) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(parts[i]);
        }
        return sb.toString();
    }
}
