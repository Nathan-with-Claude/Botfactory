package com.docapost.tournee.domain.events;

import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.TourneeId;
import com.docapost.tournee.domain.preuves.model.PreuveLivraisonId;

import java.time.Instant;

/**
 * Domain Event — LivraisonConfirmee
 *
 * Emis par Tournee.confirmerLivraison() lorsqu'un colis passe au statut LIVRE.
 * Contient la PreuveLivraisonId pour traçabilité et opposabilité juridique.
 *
 * Source : US-008 SC1, US-009 SC1/SC2/SC4 — "L'événement LivraisonConfirmée est émis."
 */
public record LivraisonConfirmee(
        TourneeId tourneeId,
        ColisId colisId,
        PreuveLivraisonId preuveLivraisonId,
        Instant horodatage
) implements DomainEvent {

    public static LivraisonConfirmee of(
            TourneeId tourneeId,
            ColisId colisId,
            PreuveLivraisonId preuveLivraisonId
    ) {
        return new LivraisonConfirmee(tourneeId, colisId, preuveLivraisonId, Instant.now());
    }
}
