package com.animetracker.service;

import com.animetracker.dto.AnimeRequest;
import com.animetracker.dto.AnimeResponse;
import com.animetracker.mapper.AnimeMapper;
import com.animetracker.model.Anime;
import com.animetracker.model.AnimeStatus;
import com.animetracker.repository.AnimeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnimeServiceTest {

    @Mock AnimeRepository animeRepository;
    @Mock AnimeMapper animeMapper;
    @InjectMocks AnimeService animeService;

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
}
