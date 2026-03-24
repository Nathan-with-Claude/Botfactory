package com.docapost.supervision.interfaces.planification.dto;

import com.docapost.supervision.domain.planification.model.TourneePlanifiee;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * TourneePlanifieeDTO — DTO de sortie BC-07 (W-04 — liste du plan du jour)
 *
 * Source : US-021, US-023, US-024
 */
public record TourneePlanifieeDTO(
        String id,
        String codeTms,
        LocalDate date,
        int nbColis,
        List<ZoneTourneeDTO> zones,
        String statut,
        String livreurId,
        String livreurNom,
        String vehiculeId,
        Instant importeeLe,
        Instant affecteeLe,
        Instant lancee,
        boolean compositionVerifiee,
        boolean aDesAnomalies
) {
    public static TourneePlanifieeDTO from(TourneePlanifiee tournee) {
        return new TourneePlanifieeDTO(
                tournee.getId(),
                tournee.getCodeTms(),
                tournee.getDate(),
                tournee.getNbColis(),
                tournee.getZones().stream()
                        .map(z -> new ZoneTourneeDTO(z.getNom(), z.getNbColis()))
                        .toList(),
                tournee.getStatut().name(),
                tournee.getLivreurId(),
                tournee.getLivreurNom(),
                tournee.getVehiculeId(),
                tournee.getImporteeLe(),
                tournee.getAffecteeLe(),
                tournee.getLancee(),
                tournee.isCompositionVerifiee(),
                tournee.aDesAnomalies()
        );
    }
}
