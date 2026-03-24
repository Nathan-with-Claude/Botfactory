package com.docapost.supervision.interfaces.dto;

import com.docapost.supervision.domain.model.IncidentVue;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/**
 * DTO — IncidentVue pour l'écran détail tournée superviseur (US-012).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record IncidentVueDTO(
        String colisId,
        String adresse,
        String motif,
        Instant horodatage,
        String note
) {
    public static IncidentVueDTO from(IncidentVue incident) {
        return new IncidentVueDTO(
                incident.colisId(),
                incident.adresse(),
                incident.motif(),
                incident.horodatage(),
                incident.note()
        );
    }
}
