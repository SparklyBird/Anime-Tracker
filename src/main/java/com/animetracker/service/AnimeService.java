package com.animetracker.service;

import com.animetracker.dto.AnimeRequest;
import com.animetracker.dto.AnimeResponse;
import com.animetracker.mapper.AnimeMapper;
import com.animetracker.model.Anime;
import com.animetracker.model.AnimeStatus;
import com.animetracker.repository.AnimeRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
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
    private final ObjectMapper objectMapper;

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

    // ─── EXPORT / IMPORT ──────────────────────────────────────

    /** Section order used by every export, so files are stable and diffable. */
    private static final List<AnimeStatus> EXPORT_ORDER = List.of(
            AnimeStatus.WATCHING, AnimeStatus.WILL_WATCH, AnimeStatus.WATCHED,
            AnimeStatus.FAVORITE, AnimeStatus.DROPPED);

    private static final List<String> CSV_HEADER = List.of(
            "russianName", "japaneseName", "status", "rating", "genres",
            "year", "episodeCount", "episodesWatched", "description", "imagePath");

    /** Bare title lists carry no section, so they land here. */
    private static final AnimeStatus DEFAULT_IMPORT_STATUS = AnimeStatus.WILL_WATCH;

    @Transactional(readOnly = true)
    public String exportAll(String format) {
        String normalised = format == null ? "" : format.toLowerCase();
        if (!List.of("json", "csv", "txt").contains(normalised)) {
            throw new IllegalArgumentException("Unsupported export format: " + format);
        }

        List<AnimeResponse> all = new ArrayList<>();
        for (AnimeStatus status : EXPORT_ORDER) {
            all.addAll(animeRepository.findByStatusOrderByIdDesc(status)
                    .stream().map(animeMapper::toResponse).collect(Collectors.toList()));
        }
        log.info("Exporting {} entries as {}", all.size(), normalised);

        switch (normalised) {
            case "json": return toJson(all);
            case "csv":  return toCsv(all);
            default:     return toTxt(all);
        }
    }

    @Transactional
    public Map<String, Object> importFile(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String content = new String(file.getBytes(), StandardCharsets.UTF_8);
        if (!content.isEmpty() && content.charAt(0) == '\uFEFF') {
            content = content.substring(1);   // Excel writes a BOM; strip it before parsing
        }

        List<AnimeRequest> parsed;
        if (filename.endsWith(".json"))      parsed = parseJson(content);
        else if (filename.endsWith(".csv"))  parsed = parseCsv(content);
        else                                 parsed = parseTxt(content);

        // status is NOT NULL on the entity, so nothing may reach the mapper without one
        parsed.forEach(r -> { if (r.getStatus() == null) r.setStatus(DEFAULT_IMPORT_STATUS); });

        int total = parsed.size();
        int imported = bulkCreate(parsed).size();
        log.info("Import '{}': parsed {}, imported {}, skipped {}", filename, total, imported, total - imported);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("parsed", total);
        result.put("imported", imported);
        result.put("skipped", total - imported);
        return result;
    }

    private String toJson(List<AnimeResponse> all) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(all);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialise export", e);
        }
    }

    private List<AnimeRequest> parseJson(String content) throws IOException {
        return objectMapper
                .readerFor(new TypeReference<List<AnimeRequest>>() {})
                .without(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .readValue(content);
    }

    private String toCsv(List<AnimeResponse> all) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.join(",", CSV_HEADER)).append("\r\n");
        for (AnimeResponse a : all) {
            sb.append(csv(a.getRussianName())).append(',')
              .append(csv(a.getJapaneseName())).append(',')
              .append(csv(a.getStatus() == null ? null : a.getStatus().name())).append(',')
              .append(csv(str(a.getRating()))).append(',')
              .append(csv(a.getGenres() == null ? null : String.join(";", a.getGenres()))).append(',')
              .append(csv(str(a.getYear()))).append(',')
              .append(csv(str(a.getEpisodeCount()))).append(',')
              .append(csv(str(a.getEpisodesWatched()))).append(',')
              .append(csv(a.getDescription())).append(',')
              .append(csv(a.getImagePath())).append("\r\n");
        }
        return sb.toString();
    }

    private List<AnimeRequest> parseCsv(String content) {
        List<List<String>> rows = parseCsvRows(content);
        List<AnimeRequest> out = new ArrayList<>();
        if (rows.isEmpty()) return out;

        List<String> firstRow = rows.get(0).stream()
                .map(c -> c == null ? "" : c.trim().toLowerCase()).collect(Collectors.toList());
        boolean hasHeader = firstRow.contains("russianname");
        List<String> header = hasHeader ? firstRow
                : CSV_HEADER.stream().map(String::toLowerCase).collect(Collectors.toList());

        for (int i = hasHeader ? 1 : 0; i < rows.size(); i++) {
            List<String> row = rows.get(i);
            String russianName = cell(row, header, "russianname");
            if (russianName == null || russianName.isBlank()) continue;   // skip blank/padding rows

            AnimeRequest r = new AnimeRequest();
            r.setRussianName(russianName.trim());
            r.setJapaneseName(blankToNull(cell(row, header, "japanesename")));
            r.setStatus(parseStatus(cell(row, header, "status")));
            r.setRating(parseDouble(cell(row, header, "rating")));
            r.setGenres(splitList(cell(row, header, "genres")));
            r.setYear(parseInt(cell(row, header, "year")));
            r.setEpisodeCount(parseInt(cell(row, header, "episodecount")));
            r.setEpisodesWatched(parseInt(cell(row, header, "episodeswatched")));
            r.setDescription(blankToNull(cell(row, header, "description")));
            r.setImagePath(blankToNull(cell(row, header, "imagepath")));
            out.add(r);
        }
        return out;
    }

    private String toTxt(List<AnimeResponse> all) {
        StringBuilder sb = new StringBuilder();
        for (AnimeStatus status : EXPORT_ORDER) {
            List<AnimeResponse> section = all.stream()
                    .filter(a -> status.equals(a.getStatus())).collect(Collectors.toList());
            if (section.isEmpty()) continue;
            sb.append("# ").append(status.getDisplayName()).append("\r\n");
            for (AnimeResponse a : section) {
                sb.append(a.getRussianName() == null ? "" : a.getRussianName()).append("\r\n");
            }
            sb.append("\r\n");
        }
        return sb.toString();
    }

    /**
     * One title per line. A "# Section" line switches which section the titles below it
     * land in, which is what makes an exported .txt round-trip. A plain list with no
     * headers is also valid and falls back to {@link #DEFAULT_IMPORT_STATUS}.
     */
    private List<AnimeRequest> parseTxt(String content) {
        List<AnimeRequest> out = new ArrayList<>();
        AnimeStatus current = DEFAULT_IMPORT_STATUS;
        for (String rawLine : content.split("\\R")) {
            String line = rawLine.trim();
            if (line.isEmpty()) continue;
            if (line.startsWith("#")) {
                AnimeStatus parsed = parseStatus(line.substring(1).trim());
                if (parsed != null) current = parsed;
                continue;
            }
            AnimeRequest r = new AnimeRequest();
            r.setRussianName(line);
            r.setStatus(current);
            out.add(r);
        }
        return out;
    }

    /** RFC-4180 reader: handles quoted fields containing commas, quotes and newlines. */
    private List<List<String>> parseCsvRows(String content) {
        List<List<String>> rows = new ArrayList<>();
        List<String> row = new ArrayList<>();
        StringBuilder field = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < content.length(); i++) {
            char c = content.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < content.length() && content.charAt(i + 1) == '"') {
                        field.append('"');
                        i++;                       // escaped quote
                    } else {
                        inQuotes = false;
                    }
                } else {
                    field.append(c);
                }
            } else if (c == '"') {
                inQuotes = true;
            } else if (c == ',') {
                row.add(field.toString());
                field.setLength(0);
            } else if (c == '\n') {
                row.add(field.toString());
                field.setLength(0);
                rows.add(row);
                row = new ArrayList<>();
            } else if (c != '\r') {
                field.append(c);
            }
        }
        if (field.length() > 0 || !row.isEmpty()) {
            row.add(field.toString());
            rows.add(row);
        }
        return rows;
    }

    private String cell(List<String> row, List<String> header, String column) {
        int i = header.indexOf(column);
        return (i < 0 || i >= row.size()) ? null : row.get(i);
    }

    private String csv(String value) {
        return value == null ? "" : "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private String str(Object value) {
        return value == null ? null : value.toString();
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private List<String> splitList(String value) {
        if (value == null || value.isBlank()) return null;
        return Arrays.stream(value.split("[;,]"))
                .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
    }

    private Integer parseInt(String value) {
        try { return value == null || value.isBlank() ? null : Integer.valueOf(value.trim()); }
        catch (NumberFormatException e) { return null; }
    }

    private Double parseDouble(String value) {
        try { return value == null || value.isBlank() ? null : Double.valueOf(value.trim().replace(',', '.')); }
        catch (NumberFormatException e) { return null; }
    }

    /** Accepts the enum name, the enum display name, and the labels shown in the UI. */
    private AnimeStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String value = raw.trim();
        for (AnimeStatus status : AnimeStatus.values()) {
            if (status.name().equalsIgnoreCase(value)
                    || status.getDisplayName().equalsIgnoreCase(value)) {
                return status;
            }
        }
        if ("will watch".equalsIgnoreCase(value)) return AnimeStatus.WILL_WATCH;
        if ("finished".equalsIgnoreCase(value))   return AnimeStatus.WATCHED;
        if ("favorite".equalsIgnoreCase(value))   return AnimeStatus.FAVORITE;
        return null;
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
