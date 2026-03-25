package com.docapost.supervision.infrastructure.planification;

import com.docapost.supervision.domain.planification.model.StatutAffectation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

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
}
