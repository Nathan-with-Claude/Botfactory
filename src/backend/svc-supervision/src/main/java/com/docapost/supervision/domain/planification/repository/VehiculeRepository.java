package com.docapost.supervision.domain.planification.repository;

import com.docapost.supervision.domain.planification.model.Vehicule;
import com.docapost.supervision.domain.planification.model.VehiculeId;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * VehiculeRepository — Port (interface) BC-07 Planification
 *
 * L'Application Service dépend de cette interface.
 * L'implémentation concrète est dans infrastructure/planification/.
 *
 * Source : US-030
 */
public interface VehiculeRepository {

    /**
     * Récupère un véhicule par son identifiant.
     */
    Optional<Vehicule> findById(VehiculeId vehiculeId);

    /**
     * Retourne tous les véhicules disponibles pour une date donnée.
     * Un véhicule est disponible si non affecté à une autre tournée ce jour-là.
     */
    List<Vehicule> findDisponibles(LocalDate date);

    /**
     * Persiste ou met à jour un véhicule.
     */
    void save(Vehicule vehicule);
}
