package com.docapost.tournee.domain.events;

import com.docapost.tournee.domain.model.LivreurId;
import com.docapost.tournee.domain.model.RecapitulatifTournee;
import com.docapost.tournee.domain.model.TourneeId;

import java.time.Instant;
import java.util.Objects;

/**
 * Domain Event — TourneeCloturee
 *
 * Emis par l'Aggregate Tournee lorsqu'un livreur cloture sa tournee.
 * Declenche la synchronisation finale vers l'OMS et affiche le recapitulatif.
 *
 * Immuable. Horodate automatiquement a la creation.
 * Source : US-007 — "Confirmer officiellement la fin de ma tournee dans le SI." (Pierre)
 *
 * Attributs cles (domain-model.md) :
 *   tourneeId, livreurId, recap, horodatage
 */
public record TourneeCloturee(
        TourneeId tourneeId,
        LivreurId livreurId,
        RecapitulatifTournee recap,
        Instant horodatage
) implements DomainEvent {

    public TourneeCloturee {
        Objects.requireNonNull(tourneeId, "TourneeId est obligatoire");
        Objects.requireNonNull(livreurId, "LivreurId est obligatoire");
        Objects.requireNonNull(recap, "RecapitulatifTournee est obligatoire");
        Objects.requireNonNull(horodatage, "Horodatage est obligatoire");
    }

    /**
     * Factory method — cree un TourneeCloturee horodate maintenant.
     */
    public static TourneeCloturee of(
            TourneeId tourneeId,
            LivreurId livreurId,
            RecapitulatifTournee recap
    ) {
        return new TourneeCloturee(tourneeId, livreurId, recap, Instant.now());
    }
}
