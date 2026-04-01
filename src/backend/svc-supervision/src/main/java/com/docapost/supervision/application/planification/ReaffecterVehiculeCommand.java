package com.docapost.supervision.application.planification;

/**
 * ReaffecterVehiculeCommand — Command BC-07 Planification (US-034)
 *
 * Demande la réaffectation d'une tournée vers un véhicule de plus grande capacité,
 * suite à un échec de compatibilité (CompatibiliteVehiculeEchouee).
 *
 * Source : US-034
 */
public record ReaffecterVehiculeCommand(
        String tourneePlanifieeId,
        String nouveauVehiculeId,
        String superviseurId
) {
    public ReaffecterVehiculeCommand {
        if (tourneePlanifieeId == null || tourneePlanifieeId.isBlank())
            throw new IllegalArgumentException("tourneePlanifieeId est obligatoire");
        if (nouveauVehiculeId == null || nouveauVehiculeId.isBlank())
            throw new IllegalArgumentException("nouveauVehiculeId est obligatoire");
        if (superviseurId == null || superviseurId.isBlank())
            throw new IllegalArgumentException("superviseurId est obligatoire");
    }
}
