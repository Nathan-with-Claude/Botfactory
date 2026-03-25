package com.docapost.supervision.interfaces.planification.dto;

import com.docapost.supervision.domain.planification.model.TourneePlanifiee;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * TourneePlanifieeDetailDTO — DTO de sortie BC-07 (W-05 — détail composition + affectation)
 *
 * Expose les zones, contraintes horaires et anomalies pour l'onglet Composition.
 * Source : US-022
 */
public record TourneePlanifieeDetailDTO(
        String id,
        String codeTms,
        LocalDate date,
        int nbColis,
        List<ZoneTourneeDTO> zones,
        List<ContrainteHoraireDTO> contraintes,
        List<AnomalieDTO> anomalies,
        String statut,
        String livreurId,
        String livreurNom,
        String vehiculeId,
        Instant importeeLe,
        Instant affecteeLe,
        Instant lanceeLe,
        boolean compositionVerifiee
) {
    public static TourneePlanifieeDetailDTO from(TourneePlanifiee tournee) {
        return new TourneePlanifieeDetailDTO(
                tournee.getId(),
                tournee.getCodeTms(),
                tournee.getDate(),
                tournee.getNbColis(),
                tournee.getZones().stream()
                        .map(z -> new ZoneTourneeDTO(z.getNom(), z.getNbColis()))
                        .toList(),
                tournee.getContraintes().stream()
                        .map(c -> new ContrainteHoraireDTO(c.getLibelle(), c.getNbColisAffectes()))
                        .toList(),
                tournee.getAnomalies().stream()
                        .map(a -> new AnomalieDTO(a.getCode(), a.getDescription()))
                        .toList(),
                tournee.getStatut().name(),
                tournee.getLivreurId(),
                tournee.getLivreurNom(),
                tournee.getVehiculeId(),
                tournee.getImporteeLe(),
                tournee.getAffecteeLe(),
                tournee.getLancee(),  // domaine "lancee" → DTO "lanceeLe"
                tournee.isCompositionVerifiee()
        );
    }
}
