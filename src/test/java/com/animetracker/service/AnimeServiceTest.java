package com.animetracker.service;

import com.animetracker.dto.AnimeRequest;
import com.animetracker.dto.AnimeResponse;
import com.animetracker.mapper.AnimeMapper;
import com.animetracker.model.Anime;
import com.animetracker.model.AnimeStatus;
import com.animetracker.repository.AnimeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnimeServiceTest {

    @Mock AnimeRepository animeRepository;
    @Mock AnimeMapper animeMapper;

    AnimeService animeService;

    /**
     * Built by hand rather than with @InjectMocks: the service takes a real ObjectMapper
     * for export/import, and a mocked one would return null from every call.
     * findAndRegisterModules() picks up JSR-310 the same way Spring Boot does at runtime,
     * which is what lets AnimeResponse.createdAt serialise.
     */
    @BeforeEach
    void setUp() {
        animeService = new AnimeService(animeRepository, animeMapper,
                new ObjectMapper().findAndRegisterModules());
    }

    // ─── existing behaviour ───────────────────────────────

    @Test
    void create_savesAndReturnsResponse() {
        AnimeRequest req = new AnimeRequest();
        req.setRussianName("Тест");
        req.setStatus(AnimeStatus.WATCHING);

        Anime entity = Anime.builder().russianName("Тест").status(AnimeStatus.WATCHING).build();
        Anime saved  = Anime.builder().id(1L).russianName("Тест").status(AnimeStatus.WATCHING).build();
        AnimeResponse response = new AnimeResponse();
        response.setId(1L);

        when(animeMapper.toEntity(req)).thenReturn(entity);
        when(animeRepository.save(entity)).thenReturn(saved);
        when(animeMapper.toResponse(saved)).thenReturn(response);

        AnimeResponse result = animeService.create(req);

        assertThat(result.getId()).isEqualTo(1L);
        verify(animeRepository).save(entity);
    }

    @Test
    void getById_notFound_throwsException() {
        when(animeRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> animeService.getById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getByStatus_returnsMappedList() {
        Anime a = Anime.builder().id(1L).russianName("Тест").status(AnimeStatus.FAVORITE).build();
        AnimeResponse r = new AnimeResponse(); r.setId(1L);
        when(animeRepository.findByStatusOrderByIdDesc(AnimeStatus.FAVORITE)).thenReturn(List.of(a));
        when(animeMapper.toResponse(a)).thenReturn(r);

        List<AnimeResponse> result = animeService.getByStatus(AnimeStatus.FAVORITE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    void delete_callsRepositoryDelete() {
        Anime a = Anime.builder().id(5L).russianName("X").status(AnimeStatus.DROPPED).build();
        when(animeRepository.findById(5L)).thenReturn(Optional.of(a));
        animeService.delete(5L);
        verify(animeRepository).delete(a);
    }

    // ─── export ───────────────────────────────────────────

    @Test
    void exportCsv_escapesQuotesAndCommasAndJoinsGenres() {
        Anime entity = Anime.builder().id(1L).build();
        AnimeResponse r = new AnimeResponse();
        r.setRussianName("Блич, часть 1");        // comma inside a field
        r.setJapaneseName("Bleach \"TV\"");        // quotes inside a field
        r.setStatus(AnimeStatus.WATCHING);
        r.setGenres(List.of("Экшен", "Сёнэн"));    // must not collide with the CSV delimiter

        stubAllSectionsEmptyExcept(AnimeStatus.WATCHING, entity);
        when(animeMapper.toResponse(entity)).thenReturn(r);

        String csv = animeService.exportAll("csv");

        assertThat(csv).startsWith("russianName,japaneseName,status,rating,genres,");
        assertThat(csv).contains("\"Блич, часть 1\"");
        assertThat(csv).contains("\"Bleach \"\"TV\"\"\"");
        assertThat(csv).contains("\"Экшен;Сёнэн\"");
    }

    @Test
    void exportTxt_groupsTitlesUnderSectionHeaders() {
        Anime entity = Anime.builder().id(1L).build();
        AnimeResponse r = new AnimeResponse();
        r.setRussianName("Наруто");
        r.setStatus(AnimeStatus.DROPPED);

        stubAllSectionsEmptyExcept(AnimeStatus.DROPPED, entity);
        when(animeMapper.toResponse(entity)).thenReturn(r);

        String txt = animeService.exportAll("txt");

        assertThat(txt).contains("# Dropped");
        assertThat(txt).contains("Наруто");
        assertThat(txt).doesNotContain("# Watching");   // empty sections are omitted
    }

    @Test
    void exportAll_rejectsUnknownFormat() {
        assertThatThrownBy(() -> animeService.exportAll("xml"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("xml");
    }

    // ─── import ───────────────────────────────────────────

    /**
     * The important one: a JSON export carries id, createdAt, updatedAt and
     * statusDisplayName, none of which exist on AnimeRequest. Reading it back has to
     * tolerate those unknown fields and still recover every field that does map.
     */
    @Test
    void exportJson_thenImport_roundTripsEveryMappedField() throws Exception {
        Anime entity = Anime.builder().id(1L).build();
        AnimeResponse r = new AnimeResponse();
        r.setId(1L);
        r.setRussianName("Стальной алхимик");
        r.setJapaneseName("Fullmetal Alchemist");
        r.setStatus(AnimeStatus.WATCHED);
        r.setStatusDisplayName("Watched");
        r.setGenres(List.of("Фэнтези", "Драма"));
        r.setYear(2009);
        r.setRating(5.0);
        r.setEpisodeCount(64);
        r.setEpisodesWatched(64);
        r.setCreatedAt(LocalDateTime.of(2026, 1, 1, 12, 0));

        stubAllSectionsEmptyExcept(AnimeStatus.WATCHED, entity);
        when(animeMapper.toResponse(entity)).thenReturn(r);

        String json = animeService.exportAll("json");
        assertThat(json).contains("Стальной алхимик");

        AnimeRequest back = importAndCaptureSingle(json, "backup.json");

        assertThat(back.getRussianName()).isEqualTo("Стальной алхимик");
        assertThat(back.getJapaneseName()).isEqualTo("Fullmetal Alchemist");
        assertThat(back.getStatus()).isEqualTo(AnimeStatus.WATCHED);
        assertThat(back.getGenres()).containsExactly("Фэнтези", "Драма");
        assertThat(back.getYear()).isEqualTo(2009);
        assertThat(back.getRating()).isEqualTo(5.0);
        assertThat(back.getEpisodeCount()).isEqualTo(64);
    }

    @Test
    void importCsv_readsQuotedFieldsAndSplitsGenres() throws Exception {
        String csv = "russianName,japaneseName,status,rating,genres,year,"
                   + "episodeCount,episodesWatched,description,imagePath\r\n"
                   + "\"Блич, часть 1\",\"Bleach\",\"FAVORITE\",\"4.5\",\"Экшен;Сёнэн\","
                   + "\"2004\",\"366\",\"12\",\"He said \"\"hi\"\"\",\"\"\r\n";

        when(animeRepository.existsByRussianNameIgnoreCaseAndStatus(anyString(), eq(AnimeStatus.FAVORITE)))
                .thenReturn(false);

        AnimeRequest back = importAndCaptureSingle(csv, "backup.csv");

        assertThat(back.getRussianName()).isEqualTo("Блич, часть 1");
        assertThat(back.getStatus()).isEqualTo(AnimeStatus.FAVORITE);
        assertThat(back.getRating()).isEqualTo(4.5);
        assertThat(back.getGenres()).containsExactly("Экшен", "Сёнэн");
        assertThat(back.getEpisodeCount()).isEqualTo(366);
        assertThat(back.getDescription()).isEqualTo("He said \"hi\"");
        assertThat(back.getImagePath()).isNull();
    }

    @Test
    void importTxt_assignsSectionsFromHeaders() throws Exception {
        String txt = "# Watching\nНаруто\n\n# Favorites\nБлич\n";
        MockMultipartFile file = new MockMultipartFile("file", "backup.txt", "text/plain",
                txt.getBytes(StandardCharsets.UTF_8));

        when(animeRepository.existsByRussianNameIgnoreCase(anyString())).thenReturn(false);
        when(animeRepository.existsByRussianNameIgnoreCaseAndStatus(anyString(), eq(AnimeStatus.FAVORITE)))
                .thenReturn(false);
        when(animeMapper.toEntity(any(AnimeRequest.class))).thenReturn(Anime.builder().build());
        when(animeRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = animeService.importFile(file);

        ArgumentCaptor<AnimeRequest> captor = ArgumentCaptor.forClass(AnimeRequest.class);
        verify(animeMapper, times(2)).toEntity(captor.capture());
        List<AnimeRequest> sent = captor.getAllValues();

        assertThat(sent).extracting(AnimeRequest::getRussianName)
                .containsExactly("Наруто", "Блич");
        assertThat(sent).extracting(AnimeRequest::getStatus)
                .containsExactly(AnimeStatus.WATCHING, AnimeStatus.FAVORITE);
        assertThat(sent).noneMatch(req -> req.getRussianName().startsWith("#"));
        assertThat(result).containsEntry("parsed", 2).containsEntry("imported", 2);
    }

    @Test
    void importTxt_bareTitleListDefaultsToWillWatch() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "list.txt", "text/plain",
                "Наруто\n\n   Блич   \n".getBytes(StandardCharsets.UTF_8));

        when(animeRepository.existsByRussianNameIgnoreCase(anyString())).thenReturn(false);
        when(animeMapper.toEntity(any(AnimeRequest.class))).thenReturn(Anime.builder().build());
        when(animeRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        animeService.importFile(file);

        ArgumentCaptor<AnimeRequest> captor = ArgumentCaptor.forClass(AnimeRequest.class);
        verify(animeMapper, times(2)).toEntity(captor.capture());

        assertThat(captor.getAllValues()).extracting(AnimeRequest::getRussianName)
                .containsExactly("Наруто", "Блич");            // whitespace trimmed
        assertThat(captor.getAllValues()).allSatisfy(req ->
                assertThat(req.getStatus()).isEqualTo(AnimeStatus.WILL_WATCH));
    }

    @Test
    void importFile_reportsSkippedDuplicates() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "list.txt", "text/plain",
                "Наруто\nБлич\n".getBytes(StandardCharsets.UTF_8));

        // "Наруто" already exists, "Блич" does not
        when(animeRepository.existsByRussianNameIgnoreCase("Наруто")).thenReturn(true);
        when(animeRepository.existsByRussianNameIgnoreCase("Блич")).thenReturn(false);
        when(animeMapper.toEntity(any(AnimeRequest.class))).thenReturn(Anime.builder().build());
        when(animeRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = animeService.importFile(file);

        assertThat(result).containsEntry("parsed", 2)
                          .containsEntry("imported", 1)
                          .containsEntry("skipped", 1);
    }

    // ─── helpers ──────────────────────────────────────────

    /** exportAll walks all five sections; only one of them should return anything. */
    private void stubAllSectionsEmptyExcept(AnimeStatus status, Anime entity) {
        when(animeRepository.findByStatusOrderByIdDesc(any(AnimeStatus.class))).thenReturn(List.of());
        when(animeRepository.findByStatusOrderByIdDesc(status)).thenReturn(List.of(entity));
    }

    /** Feeds content through importFile and returns the single AnimeRequest that reached the mapper. */
    private AnimeRequest importAndCaptureSingle(String content, String filename) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", filename, "text/plain",
                content.getBytes(StandardCharsets.UTF_8));

        when(animeMapper.toEntity(any(AnimeRequest.class))).thenReturn(Anime.builder().build());
        when(animeRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        animeService.importFile(file);

        ArgumentCaptor<AnimeRequest> captor = ArgumentCaptor.forClass(AnimeRequest.class);
        verify(animeMapper).toEntity(captor.capture());
        return captor.getValue();
    }
}
