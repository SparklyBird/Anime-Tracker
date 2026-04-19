package com.animetracker.service;

import com.animetracker.dto.AnimeRequest;
import com.animetracker.dto.AnimeResponse;
import com.animetracker.mapper.AnimeMapper;
import com.animetracker.model.Anime;
import com.animetracker.model.AnimeStatus;
import com.animetracker.repository.AnimeRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnimeService {

    private static final Logger log = LoggerFactory.getLogger(AnimeService.class);

    private final AnimeRepository animeRepository;
    private final AnimeMapper animeMapper;

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public List<AnimeResponse> getByStatus(AnimeStatus status) {
        log.debug("Fetching all anime by status: {}", status);
        return animeRepository.findByStatusOrderByIdDesc(status)
                .stream().map(animeMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getByStatusPaged(AnimeStatus status, int page, int size) {
        log.debug("Fetching anime by status={} page={} size={}", status, page, size);
        org.springframework.data.domain.Pageable pageable =
            org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<AnimeResponse> result =
            animeRepository.findByStatusOrderByIdDesc(status, pageable)
                .map(animeMapper::toResponse);
        java.util.Map<String, Object> response = new java.util.LinkedHashMap<>();
        response.put("content", result.getContent());
        response.put("page", result.getNumber());
        response.put("totalPages", result.getTotalPages());
        response.put("totalElements", result.getTotalElements());
        response.put("last", result.isLast());
        return response;
    }

    @Transactional(readOnly = true)
    public List<AnimeResponse> searchAnime(String query, AnimeStatus status) {
        log.debug("Searching anime query='{}' status={}", query, status);
        List<Anime> results = (status != null)
                ? animeRepository.searchByNameAndStatus(query, status)
                : animeRepository.searchByName(query);
        return results.stream().map(animeMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getCounts() {
        return Map.of(
                "WATCHING",  animeRepository.countByStatus(AnimeStatus.WATCHING),
                "WILL_WATCH",animeRepository.countByStatus(AnimeStatus.WILL_WATCH),
                "WATCHED",   animeRepository.countByStatus(AnimeStatus.WATCHED),
                "FAVORITE",  animeRepository.countByStatus(AnimeStatus.FAVORITE),
                "DROPPED",   animeRepository.countByStatus(AnimeStatus.DROPPED)
        );
    }

    @Transactional(readOnly = true)
    public AnimeResponse getById(Long id) {
        return animeMapper.toResponse(findById(id));
    }

    @Transactional
    public AnimeResponse create(AnimeRequest animeRequest) {
        log.info("Creating anime: {}", animeRequest.getRussianName());
        return animeMapper.toResponse(animeRepository.save(animeMapper.toEntity(animeRequest)));
    }

    @Transactional
    public List<AnimeResponse> bulkCreate(List<AnimeRequest> requests) {
        log.info("Bulk creating {} anime (skipping duplicates)", requests.size());
        // Track names added within this batch per-status to avoid intra-batch dupes
        java.util.Set<String> batchFavorites = new java.util.HashSet<>();
        java.util.Set<String> batchOthers    = new java.util.HashSet<>();

        List<Anime> entities = requests.stream()
            .filter(r -> r.getRussianName() != null && !r.getRussianName().isBlank())
            .filter(r -> {
                String key = r.getRussianName().trim().toLowerCase();
                if (r.getStatus() == AnimeStatus.FAVORITE) {
                    // Favorites: only skip if already exists IN favorites (other sections allowed)
                    if (batchFavorites.contains(key) ||
                        animeRepository.existsByRussianNameIgnoreCaseAndStatus(r.getRussianName().trim(), AnimeStatus.FAVORITE)) {
                        log.info("Skipping duplicate favorite: {}", r.getRussianName());
                        return false;
                    }
                    batchFavorites.add(key);
                    return true;
                } else {
                    if (batchOthers.contains(key) ||
                        animeRepository.existsByRussianNameIgnoreCase(r.getRussianName().trim())) {
                        log.info("Skipping duplicate: {}", r.getRussianName());
                        return false;
                    }
                    batchOthers.add(key);
                    return true;
                }
            })
            .map(animeMapper::toEntity)
            .collect(Collectors.toList());
        log.info("Inserting {} new anime after dedup", entities.size());
        return animeRepository.saveAll(entities).stream().map(animeMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public AnimeResponse update(Long id, AnimeRequest animeRequest) {
        log.info("Updating anime id={}", id);
        Anime anime = findById(id);
        animeMapper.updateEntity(anime, animeRequest);
        return animeMapper.toResponse(animeRepository.save(anime));
    }

    @Transactional
    public int removeDuplicates() {
        List<Anime> all = animeRepository.findAll();
        // Keep first occurrence per (name + isFavorite) bucket:
        //   - one entry per name in non-FAVORITE sections
        //   - one entry per name in FAVORITE (allowed to coexist with non-FAVORITE)
        java.util.Set<String> seenNonFav  = new java.util.LinkedHashSet<>();
        java.util.Set<String> seenFav     = new java.util.LinkedHashSet<>();
        List<Long> toDelete = new java.util.ArrayList<>();
        all.sort(java.util.Comparator.comparing(Anime::getId));
        for (Anime a : all) {
            String name = a.getRussianName() == null ? "" : a.getRussianName().trim().toLowerCase();
            boolean isFav = AnimeStatus.FAVORITE.equals(a.getStatus());
            java.util.Set<String> bucket = isFav ? seenFav : seenNonFav;
            if (!bucket.add(name)) {
                toDelete.add(a.getId());
            }
        }
        toDelete.forEach(animeRepository::deleteById);
        return toDelete.size();
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting anime id={}", id);
        Anime anime = findById(id);
        if (anime.getImagePath() != null && anime.getImagePath().startsWith("/uploads/")) {
            deleteImageFile(anime.getImagePath());
        }
        animeRepository.delete(anime);
    }

    @Transactional
    public AnimeResponse uploadImage(Long id, MultipartFile file) throws IOException {
        Anime anime = findById(id);
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename));
        if (anime.getImagePath() != null && anime.getImagePath().startsWith("/uploads/")) {
            deleteImageFile(anime.getImagePath());
        }
        anime.setImagePath("/uploads/" + filename);
        log.info("Uploaded image for anime id={}: {}", id, filename);
        return animeMapper.toResponse(animeRepository.save(anime));
    }

    private Anime findById(Long id) {
        return animeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anime not found: " + id));
    }

    private void deleteImageFile(String imagePath) {
        try {
            Files.deleteIfExists(Paths.get("." + imagePath));
        } catch (Exception e) {
            log.warn("Could not delete image: {} — {}", imagePath, e.getMessage());
        }
    }
}
