package com.docapost.supervision.domain.planification.repository;

import com.docapost.supervision.domain.planification.model.StatutAffectation;
import com.docapost.supervision.domain.planification.model.TourneePlanifiee;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * TourneePlanifieeRepository — Port (interface) du BC-07 Planification
 *
 * L'Application Service dépend de cette interface (DDD : Repository dans domain/).
 * L'implémentation concrète est dans infrastructure/planification/.
 *
 * Source : US-021, US-022, US-023, US-024
 */
public interface TourneePlanifieeRepository {

    /**
     * Persiste ou met à jour une TourneePlanifiee.
     */
    void save(TourneePlanifiee tourneePlanifiee);

    /**
     * Récupère une TourneePlanifiee par son identifiant.
     */
    Optional<TourneePlanifiee> findById(String id);

    /**
     * Récupère toutes les tournées planifiées pour une date donnée.
     * US-021 : plan du jour.
     */
    List<TourneePlanifiee> findByDate(LocalDate date);

    /**
     * Récupère les tournées planifiées pour une date et un statut donnés.
     * US-021 : filtrage par statut dans W-04.
     */
    List<TourneePlanifiee> findByDateAndStatut(LocalDate date, StatutAffectation statut);

    /**
     * Vérifie si un livreur est déjà affecté à une tournée à une date donnée.
     * US-023 : invariant d'unicité livreur/jour.
     */
    boolean isLivreurDejaAffecte(String livreurId, LocalDate date);

    /**
     * Vérifie si un véhicule est déjà affecté à une tournée à une date donnée.
     * US-023 : invariant d'unicité véhicule/jour.
     */
    boolean isVehiculeDejaAffecte(String vehiculeId, LocalDate date);
}
