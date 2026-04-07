package com.animetracker.dto;

import com.animetracker.model.AnimeStatus;
import lombok.Data;

import java.util.List;

@Data
public class AnimeRequest {
    private String russianName;
    private String japaneseName;
    private AnimeStatus status;
    private Double rating;
    private List<String> genres;
    private String description;
    private Integer year;
    private Integer episodeCount;
    private Integer episodesWatched;
    private String imagePath;
}
