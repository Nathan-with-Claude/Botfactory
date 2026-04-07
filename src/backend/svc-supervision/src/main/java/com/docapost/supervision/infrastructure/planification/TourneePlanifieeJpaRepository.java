package com.docapost.supervision.infrastructure.planification;

import com.docapost.supervision.domain.planification.model.StatutAffectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * TourneePlanifieeJpaRepository — Spring Data JPA BC-07
 *
 * Source : US-021, US-022, US-023, US-024
 */
public interface TourneePlanifieeJpaRepository extends JpaRepository<TourneePlanifieeEntity, String> {

    List<TourneePlanifieeEntity> findByDate(LocalDate date);

    List<TourneePlanifieeEntity> findByDateAndStatut(LocalDate date, StatutAffectation statut);

    boolean existsByLivreurIdAndDate(String livreurId, LocalDate date);

    boolean existsByVehiculeIdAndDate(String vehiculeId, LocalDate date);

    /**
     * Retourne la TourneePlanifiee d'un livreur pour une date donnée.
     * Filtre uniquement AFFECTEE ou LANCEE (exclut NON_AFFECTEE).
     * ORDER BY statut DESC place LANCEE avant AFFECTEE (alphabétique inverse).
     * US-066 : dérivation de EtatJournalierLivreur.
     */
    @Query("""
            SELECT tp FROM TourneePlanifieeEntity tp
            WHERE tp.livreurId = :livreurId
              AND tp.date = :date
              AND tp.statut IN ('AFFECTEE', 'LANCEE')
            ORDER BY tp.statut DESC
            LIMIT 1
            """)
    Optional<TourneePlanifieeEntity> findAffecteeOrLanceeByLivreurIdAndDate(
            @Param("livreurId") String livreurId,
            @Param("date") LocalDate date
    );
}
