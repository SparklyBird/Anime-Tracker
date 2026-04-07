package com.animetracker.mapper;

import com.animetracker.dto.AnimeRequest;
import com.animetracker.dto.AnimeResponse;
import com.animetracker.model.Anime;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AnimeMapper {

    public Anime toEntity(AnimeRequest animeRequest) {
        return Anime.builder()
                .russianName(animeRequest.getRussianName())
                .japaneseName(animeRequest.getJapaneseName())
                .status(animeRequest.getStatus())
                .rating(animeRequest.getRating())
                .genres(joinGenres(animeRequest.getGenres()))
                .description(animeRequest.getDescription())
                .year(animeRequest.getYear())
                .episodeCount(animeRequest.getEpisodeCount())
                .episodesWatched(animeRequest.getEpisodesWatched())
                .imagePath(animeRequest.getImagePath())
                .build();
    }

    public AnimeResponse toResponse(Anime anime) {
        AnimeResponse response = new AnimeResponse();
        response.setId(anime.getId());
        response.setRussianName(anime.getRussianName());
        response.setJapaneseName(anime.getJapaneseName());
        response.setStatus(anime.getStatus());
        response.setStatusDisplayName(anime.getStatus() != null ? anime.getStatus().getDisplayName() : null);
        response.setRating(anime.getRating());
        response.setGenres(splitGenres(anime.getGenres()));
        response.setImagePath(anime.getImagePath());
        response.setDescription(anime.getDescription());
        response.setYear(anime.getYear());
        response.setEpisodeCount(anime.getEpisodeCount());
        response.setEpisodesWatched(anime.getEpisodesWatched());
        response.setCreatedAt(anime.getCreatedAt());
        response.setUpdatedAt(anime.getUpdatedAt());
        return response;
    }

    public void updateEntity(Anime anime, AnimeRequest animeRequest) {
        anime.setRussianName(animeRequest.getRussianName());
        anime.setJapaneseName(animeRequest.getJapaneseName());
        anime.setStatus(animeRequest.getStatus());
        anime.setRating(animeRequest.getRating());
        anime.setGenres(joinGenres(animeRequest.getGenres()));
        anime.setDescription(animeRequest.getDescription());
        anime.setYear(animeRequest.getYear());
        anime.setEpisodeCount(animeRequest.getEpisodeCount());
        anime.setEpisodesWatched(animeRequest.getEpisodesWatched());
        if (animeRequest.getImagePath() != null) {
            anime.setImagePath(animeRequest.getImagePath());
        }
    }

    private String joinGenres(List<String> genres) {
        if (genres == null || genres.isEmpty()) return null;
        return String.join(",", genres);
    }

    private List<String> splitGenres(String genres) {
        if (genres == null || genres.isBlank()) return Collections.emptyList();
        return Arrays.stream(genres.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
