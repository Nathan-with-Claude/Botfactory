package com.docapost.supervision.interfaces.dto;

import com.docapost.supervision.domain.model.VueTournee;

import java.time.Instant;

/**
 * DTO — VueTournee pour le tableau de bord superviseur (US-011).
 * Retourné dans TableauDeBordDTO et dans les mises à jour WebSocket.
 */
public record VueTourneeDTO(
        String tourneeId,
        String livreurNom,
        int colisTraites,
        int colisTotal,
        int pourcentage,
        String statut,
        Instant derniereActivite
) {
    public static VueTourneeDTO from(VueTournee vueTournee) {
        return new VueTourneeDTO(
                vueTournee.getTourneeId(),
                vueTournee.getLivreurNom(),
                vueTournee.getColisTraites(),
                vueTournee.getColisTotal(),
                vueTournee.getPourcentage(),
                vueTournee.getStatut().name(),
                vueTournee.getDerniereActivite()
        );
    }
}
