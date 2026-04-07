package com.animetracker.repository;

import com.animetracker.model.Anime;
import com.animetracker.model.AnimeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimeRepository extends JpaRepository<Anime, Long> {

    // Full list (used for export, dedup, bulk)
    List<Anime> findByStatusOrderByIdDesc(AnimeStatus status);

    // Paginated (used for display)
    Page<Anime> findByStatusOrderByIdDesc(AnimeStatus status, Pageable pageable);

    boolean existsByRussianNameIgnoreCase(String russianName);

    boolean existsByRussianNameIgnoreCaseAndStatus(String russianName, AnimeStatus status);

    @Query("SELECT a FROM Anime a WHERE LOWER(a.russianName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.japaneseName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Anime> searchByName(@Param("query") String query);

    @Query("SELECT a FROM Anime a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(LOWER(a.russianName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.japaneseName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Anime> searchByNameAndStatus(@Param("query") String query, @Param("status") AnimeStatus status);

    long countByStatus(AnimeStatus status);
}
