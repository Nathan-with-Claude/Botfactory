package com.docapost.supervision.interfaces.dto;

import com.docapost.supervision.domain.model.TableauDeBord;

import java.util.List;

/**
 * DTO — TableauDeBord pour l'écran W-01 superviseur (US-011).
 * Contient la liste des tournées + compteurs du bandeau résumé.
 *
 * Retourné par GET /api/supervision/tableau-de-bord
 * et broadcasté sur /topic/tableau-de-bord (WebSocket).
 */
public record TableauDeBordDTO(
        List<VueTourneeDTO> tournees,
        int actives,
        int aRisque,
        int cloturees
) {
    public static TableauDeBordDTO from(TableauDeBord tableauDeBord) {
        List<VueTourneeDTO> tournees = tableauDeBord.tournees().stream()
                .map(VueTourneeDTO::from)
                .toList();
        return new TableauDeBordDTO(
                tournees,
                tableauDeBord.actives(),
                tableauDeBord.aRisque(),
                tableauDeBord.cloturees()
        );
    }
}
