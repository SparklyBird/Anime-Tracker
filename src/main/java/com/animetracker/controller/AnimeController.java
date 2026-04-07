package com.animetracker.controller;

import com.animetracker.dto.AnimeRequest;
import com.animetracker.dto.AnimeResponse;
import com.animetracker.model.AnimeStatus;
import com.animetracker.service.AnimeService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import org.springframework.data.domain.Page;
import java.util.Map;

@RestController
@RequestMapping("/api/anime")
@RequiredArgsConstructor
public class AnimeController {

    private static final Logger log = LoggerFactory.getLogger(AnimeController.class);

    private final AnimeService animeService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getByStatus(
            @RequestParam AnimeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        log.info("GET /api/anime?status={}&page={}&size={}", status, page, size);
        var result = animeService.getByStatusPaged(status, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search")
    public ResponseEntity<List<AnimeResponse>> search(
            @RequestParam String q,
            @RequestParam(required = false) AnimeStatus status) {
        log.info("GET /api/anime/search q={} status={}", q, status);
        return ResponseEntity.ok(animeService.searchAnime(q, status));
    }

    @GetMapping("/counts")
    public ResponseEntity<Map<String, Long>> getCounts() {
        return ResponseEntity.ok(animeService.getCounts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(animeService.getById(id));
    }

    @PostMapping
    public ResponseEntity<AnimeResponse> create(@RequestBody AnimeRequest animeRequest) {
        log.info("POST /api/anime - {}", animeRequest.getRussianName());
        return ResponseEntity.ok(animeService.create(animeRequest));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<AnimeResponse>> bulkCreate(@RequestBody List<AnimeRequest> requests) {
        log.info("POST /api/anime/bulk - {} entries", requests.size());
        return ResponseEntity.ok(animeService.bulkCreate(requests));
    }

    @DeleteMapping("/dedupe")
    public ResponseEntity<Map<String, Integer>> dedupe() {
        log.info("DELETE /api/anime/dedupe - removing duplicates");
        int removed = animeService.removeDuplicates();
        log.info("Removed {} duplicate entries", removed);
        return ResponseEntity.ok(Map.of("removed", removed));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnimeResponse> update(@PathVariable Long id, @RequestBody AnimeRequest animeRequest) {
        log.info("PUT /api/anime/{}", id);
        return ResponseEntity.ok(animeService.update(id, animeRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/anime/{}", id);
        animeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<AnimeResponse> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        log.info("POST /api/anime/{}/image - {}", id, file.getOriginalFilename());
        return ResponseEntity.ok(animeService.uploadImage(id, file));
    }
}
