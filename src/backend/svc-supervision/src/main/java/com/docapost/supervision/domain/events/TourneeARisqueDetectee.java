package com.docapost.supervision.domain.events;

import java.time.Instant;

/**
 * Événement de domaine — TourneeARisqueDetectee (BC-03 Supervision — US-013)
 *
 * Émis par RisqueDetector lorsque le retard estimé d'une tournée EN_COURS
 * dépasse le seuil configuré.
 *
 * Invariant : seules les tournées EN_COURS peuvent émettre cet événement.
 *
 * Source : US-013 — "Alerte tournée à risque"
 */
public record TourneeARisqueDetectee(
        String tourneeId,
        String livreurNom,
        int inactiviteMinutes,
        Instant horodatage
) {
    public TourneeARisqueDetectee(String tourneeId, String livreurNom, int inactiviteMinutes) {
        this(tourneeId, livreurNom, inactiviteMinutes, Instant.now());
    }
}
