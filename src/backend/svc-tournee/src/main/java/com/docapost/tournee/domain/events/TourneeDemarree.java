package com.docapost.tournee.domain.events;

import com.docapost.tournee.domain.model.LivreurId;
import com.docapost.tournee.domain.model.TourneeId;

import java.time.Instant;

/**
 * Domain Event — TourneeDemarree
 * Emis par Tournee.demarrer() lors du premier acces a la liste des colis.
 * Idempotent : n'est emis qu'une seule fois par journee.
 *
 * Consommateurs : BC Supervision, BC Integration SI
 *
 * Source : Ubiquitous Language DocuPost — invariant US-001 Scenario 4.
 */
public record TourneeDemarree(
        TourneeId tourneeId,
        LivreurId livreurId,
        Instant horodatage
) implements DomainEvent {

    public static TourneeDemarree of(TourneeId tourneeId, LivreurId livreurId) {
        return new TourneeDemarree(tourneeId, livreurId, Instant.now());
    }
}
