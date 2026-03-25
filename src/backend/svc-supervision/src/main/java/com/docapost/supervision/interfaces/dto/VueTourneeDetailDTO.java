package com.docapost.supervision.interfaces.dto;

import com.docapost.supervision.domain.model.VueTourneeDetail;

import java.util.List;

/**
 * DTO — VueTourneeDetail pour l'écran W-02 superviseur (US-012).
 * Contient VueTourneeDTO + liste colis + liste incidents.
 */
public record VueTourneeDetailDTO(
        VueTourneeDTO tournee,
        List<VueColisDTO> colis,
        List<IncidentVueDTO> incidents
) {
    public static VueTourneeDetailDTO from(VueTourneeDetail detail) {
        return new VueTourneeDetailDTO(
                VueTourneeDTO.from(detail.vueTournee()),
                detail.colis().stream().map(VueColisDTO::from).toList(),
                detail.incidents().stream().map(IncidentVueDTO::from).toList()
        );
    }
}
