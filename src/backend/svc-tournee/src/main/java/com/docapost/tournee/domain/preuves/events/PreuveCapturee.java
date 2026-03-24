package com.docapost.tournee.domain.preuves.events;

import com.docapost.tournee.domain.events.DomainEvent;
import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.TourneeId;
import com.docapost.tournee.domain.preuves.model.Coordonnees;
import com.docapost.tournee.domain.preuves.model.PreuveLivraisonId;
import com.docapost.tournee.domain.preuves.model.TypePreuve;

import java.time.Instant;

/**
 * Domain Event — PreuveCapturee
 *
 * Emis par PreuveLivraison lors de sa création.
 * Déclenche LivraisonConfirmee dans BC-01 (Tournee.confirmerLivraison()).
 *
 * Source : US-008 SC1, US-009 SC1/SC2/SC4.
 */
public record PreuveCapturee(
        PreuveLivraisonId preuveLivraisonId,
        ColisId colisId,
        TourneeId tourneeId,
        TypePreuve type,
        Coordonnees coordonnees,
        boolean modeDegradeGps,
        Instant horodatage
) implements DomainEvent {

    public static PreuveCapturee of(
            PreuveLivraisonId preuveLivraisonId,
            ColisId colisId,
            TourneeId tourneeId,
            TypePreuve type,
            Coordonnees coordonnees
    ) {
        boolean modeDegradeGps = coordonnees == null;
        return new PreuveCapturee(
                preuveLivraisonId, colisId, tourneeId, type,
                coordonnees, modeDegradeGps, Instant.now()
        );
    }
}
