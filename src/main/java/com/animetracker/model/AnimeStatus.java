package com.animetracker.model;

public enum AnimeStatus {
    WATCHING("Watching"),
    WILL_WATCH("Plan to Watch"),
    WATCHED("Watched"),
    FAVORITE("Favorites"),
    DROPPED("Dropped");

    private final String displayName;

    AnimeStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
