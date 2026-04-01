package com.docapost.supervision.interfaces.planification.dto;

// VehiculeCompatibleDTO is in the same package

/**
 * VehiculeCompatibleDTO — DTO de sortie REST BC-07 (US-034)
 *
 * Traduit le VehiculeCompatibleDTO (Application Layer) pour l'Interface Layer.
 * Exposé dans GET /api/planification/vehicules/compatibles.
 *
 * Source : US-034
 */
public record VehiculeCompatibleResponseDTO(
        String vehiculeId,
        String immatriculation,
        int capaciteKg,
        int margeKg,
        boolean disponible
) {

    public static VehiculeCompatibleResponseDTO from(VehiculeCompatibleDTO dto) {
        return new VehiculeCompatibleResponseDTO(
                dto.vehiculeId(),
                dto.immatriculation(),
                dto.capaciteKg(),
                dto.margeKg(),
                dto.disponible()
        );
    }
}
