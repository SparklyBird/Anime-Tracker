package com.animetracker.dto;

import com.animetracker.model.AnimeStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AnimeResponse {
    private Long id;
    private String russianName;
    private String japaneseName;
    private AnimeStatus status;
    private String statusDisplayName;
    private Double rating;
    private List<String> genres;
    private String imagePath;
    private String description;
    private Integer year;
    private Integer episodeCount;
    private Integer episodesWatched;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
