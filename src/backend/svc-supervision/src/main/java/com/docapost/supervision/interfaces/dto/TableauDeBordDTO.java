package com.docapost.supervision.interfaces.dto;

import com.docapost.supervision.domain.model.TableauDeBord;

import java.util.List;

/**
 * DTO — TableauDeBord pour l'écran W-01 superviseur (US-011).
 * Contient la liste des tournées + compteurs encapsulés dans un objet bandeau.
 *
 * Retourné par GET /api/supervision/tableau-de-bord
 * et broadcasté sur /topic/tableau-de-bord (WebSocket).
 *
 * Structure JSON :
 * {
 *   "bandeau": { "actives": 2, "aRisque": 1, "cloturees": 0 },
 *   "tournees": [...]
 * }
 */
public record TableauDeBordDTO(
        BandeauResume bandeau,
        List<VueTourneeDTO> tournees
) {
    /**
     * BandeauResume — compteurs du bandeau résumé du tableau de bord (US-011).
     */
    public record BandeauResume(int actives, int aRisque, int cloturees) {}

    public static TableauDeBordDTO from(TableauDeBord tableauDeBord) {
        List<VueTourneeDTO> tournees = tableauDeBord.tournees().stream()
                .map(VueTourneeDTO::from)
                .toList();
        BandeauResume bandeau = new BandeauResume(
                tableauDeBord.actives(),
                tableauDeBord.aRisque(),
                tableauDeBord.cloturees()
        );
        return new TableauDeBordDTO(bandeau, tournees);
    }
}
