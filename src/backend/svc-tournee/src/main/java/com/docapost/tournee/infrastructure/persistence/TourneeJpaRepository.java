package com.docapost.tournee.infrastructure.persistence;

import com.docapost.tournee.domain.model.StatutTournee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Spring Data JPA Repository pour TourneeEntity.
 * Interface technique — utilise uniquement dans TourneeRepositoryImpl (couche infrastructure).
 * L'Application Service ne connait pas cette interface.
 */
public interface TourneeJpaRepository extends JpaRepository<TourneeEntity, String> {

    @Query("SELECT t FROM TourneeEntity t WHERE t.livreurId = :livreurId AND t.date = :date")
    Optional<TourneeEntity> findByLivreurIdAndDate(
            @Param("livreurId") String livreurId,
            @Param("date") LocalDate date
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM TourneeEntity t WHERE t.livreurId = :livreurId AND t.date = :date")
    void deleteByLivreurIdAndDate(
            @Param("livreurId") String livreurId,
            @Param("date") LocalDate date
    );
}
