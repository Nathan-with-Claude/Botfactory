package com.docapost.supervision.interfaces.dto;

import com.docapost.supervision.domain.model.VueColis;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/**
 * DTO — VueColis pour l'écran détail tournée superviseur (US-012).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record VueColisDTO(
        String colisId,
        String adresse,
        String statut,
        String motifEchec,
        Instant horodatageTraitement
) {
    public static VueColisDTO from(VueColis vueColis) {
        return new VueColisDTO(
                vueColis.colisId(),
                vueColis.adresse(),
                vueColis.statut(),
                vueColis.motifEchec(),
                vueColis.horodatageTraitement()
        );
    }
}
