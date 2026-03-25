package com.docapost.supervision.interfaces.planification.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * PlanDuJourDTO — DTO de sortie pour le plan du jour complet (W-04 — bandeau résumé + liste)
 *
 * Source : US-021
 */
public record PlanDuJourDTO(
        LocalDate date,
        int totalTournees,
        int nonAffectees,
        int affectees,
        int lancees,
        List<TourneePlanifieeDTO> tournees
) {
    public static PlanDuJourDTO of(LocalDate date, List<TourneePlanifieeDTO> tournees) {
        long nonAff = tournees.stream().filter(t -> "NON_AFFECTEE".equals(t.statut())).count();
        long aff = tournees.stream().filter(t -> "AFFECTEE".equals(t.statut())).count();
        long lanc = tournees.stream().filter(t -> "LANCEE".equals(t.statut())).count();
        return new PlanDuJourDTO(date, tournees.size(), (int) nonAff, (int) aff, (int) lanc, tournees);
    }
}
