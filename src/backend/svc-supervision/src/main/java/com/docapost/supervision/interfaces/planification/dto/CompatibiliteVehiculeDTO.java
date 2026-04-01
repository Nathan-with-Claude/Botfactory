package com.docapost.supervision.interfaces.planification.dto;

import com.docapost.supervision.application.planification.CompatibiliteVehiculeResultatDTO;

/**
 * CompatibiliteVehiculeDTO — DTO de sortie REST BC-07 (US-030)
 *
 * Traduit le CompatibiliteVehiculeResultatDTO (Application Layer) pour l'Interface Layer.
 *
 * Source : US-030
 */
public record CompatibiliteVehiculeDTO(
        String resultat,
        Integer poidsEstimeKg,
        int capaciteKg,
        int margeOuDepassementKg,
        String vehiculeId,
        String message
) {

    public static CompatibiliteVehiculeDTO from(CompatibiliteVehiculeResultatDTO dto) {
        return new CompatibiliteVehiculeDTO(
                dto.resultat().name(),
                dto.poidsEstimeKg(),
                dto.capaciteKg(),
                dto.margeOuDepassementKg(),
                dto.vehiculeId(),
                dto.message()
        );
    }
}
