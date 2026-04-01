package com.docapost.supervision.interfaces.planification.dto;

import com.docapost.supervision.domain.planification.model.Vehicule;

/**
 * VehiculeCompatibleDTO — DTO de sortie REST BC-07 (US-034)
 *
 * Représente un véhicule compatible retourné dans la liste pré-filtrée
 * du panneau de réaffectation (W-05).
 *
 * Chaque ligne affiche : identifiant, capacité, disponibilité.
 *
 * Source : US-034
 */
public record VehiculeCompatibleDTO(
        String vehiculeId,
        String immatriculation,
        int capaciteKg,
        String typeVehicule,
        boolean disponible,
        int margeKg
) {

    public static VehiculeCompatibleDTO from(Vehicule v) {
        return new VehiculeCompatibleDTO(
                v.getVehiculeId().getValeur(),
                v.getImmatriculation(),
                v.getCapaciteKg(),
                v.getTypeVehicule().name(),
                true,
                0
        );
    }

    public static VehiculeCompatibleDTO from(Vehicule v, int poidsMinKg) {
        return new VehiculeCompatibleDTO(
                v.getVehiculeId().getValeur(),
                v.getImmatriculation(),
                v.getCapaciteKg(),
                v.getTypeVehicule().name(),
                true,
                v.getCapaciteKg() - poidsMinKg
        );
    }
}
