package com.docapost.supervision.interfaces.dto;

import com.docapost.supervision.domain.model.VueTournee;

import java.time.Instant;

/**
 * DTO — VueTournee pour le tableau de bord superviseur (US-011, US-035).
 * Retourné dans TableauDeBordDTO et dans les mises à jour WebSocket.
 *
 * US-035 : codeTMS et zone ajoutés pour la recherche multi-critères côté client.
 */
public record VueTourneeDTO(
        String tourneeId,
        String livreurNom,
        int colisTraites,
        int colisTotal,
        int pourcentage,
        String statut,
        Instant derniereActivite,
        String codeTMS,
        String zone
) {
    public static VueTourneeDTO from(VueTournee vueTournee) {
        return new VueTourneeDTO(
                vueTournee.getTourneeId(),
                vueTournee.getLivreurNom(),
                vueTournee.getColisTraites(),
                vueTournee.getColisTotal(),
                vueTournee.getPourcentage(),
                vueTournee.getStatut().name(),
                vueTournee.getDerniereActivite(),
                vueTournee.getCodeTMS(),
                vueTournee.getZone()
        );
    }
}
