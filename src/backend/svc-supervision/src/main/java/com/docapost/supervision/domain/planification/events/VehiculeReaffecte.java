package com.docapost.supervision.domain.planification.events;

import java.time.Instant;

/**
 * VehiculeReaffecte — Domain Event BC-07 Planification (US-034)
 *
 * Emis quand un superviseur réaffecte une tournée vers un véhicule
 * de plus grande capacité après un échec de compatibilité (CompatibiliteVehiculeEchouee).
 *
 * Invariants :
 * - La réaffectation est toujours suivie d'une vérification de compatibilité.
 * - Si la vérification réussit, CompatibiliteVehiculeVerifiee est également émis.
 *
 * Source : US-034
 */
public record VehiculeReaffecte(
        String tourneePlanifieeId,
        String ancienVehiculeId,
        String nouveauVehiculeId,
        int poidsEstimeKg,
        int nouvelleCapaciteKg,
        int margeKg,
        String superviseurId,
        Instant reaffecteeLe
) {
    public VehiculeReaffecte {
        if (tourneePlanifieeId == null || tourneePlanifieeId.isBlank())
            throw new IllegalArgumentException("tourneePlanifieeId est obligatoire");
        if (nouveauVehiculeId == null || nouveauVehiculeId.isBlank())
            throw new IllegalArgumentException("nouveauVehiculeId est obligatoire");
        if (superviseurId == null || superviseurId.isBlank())
            throw new IllegalArgumentException("superviseurId est obligatoire");
        if (reaffecteeLe == null)
            throw new IllegalArgumentException("reaffecteeLe est obligatoire");
    }
}
