package com.docapost.tournee.interfaces.dto;

import com.docapost.tournee.domain.preuves.model.PreuveLivraison;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/**
 * DTO — Réponse de la capture d'une PreuveLivraison.
 * Retourné par POST /api/tournees/{tourneeId}/colis/{colisId}/livraison.
 *
 * Champs retournés :
 * - preuveLivraisonId : UUID de la preuve créée (référence immuable)
 * - colisId           : identifiant du colis livré
 * - typePreuve        : SIGNATURE | PHOTO | TIERS_IDENTIFIE | DEPOT_SECURISE
 * - horodatage        : timestamp ISO-8601 de la capture (automatique)
 * - modeDegradeGps    : true si coordonnées GPS indisponibles au moment de la capture
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PreuveLivraisonDTO(
        String preuveLivraisonId,
        String colisId,
        String typePreuve,
        Instant horodatage,
        boolean modeDegradeGps
) {
    public static PreuveLivraisonDTO from(PreuveLivraison preuve) {
        return new PreuveLivraisonDTO(
                preuve.getId().value(),
                preuve.getColisId().value(),
                preuve.getType().name(),
                preuve.getHorodatage(),
                preuve.isModeDegradeGps()
        );
    }
}
