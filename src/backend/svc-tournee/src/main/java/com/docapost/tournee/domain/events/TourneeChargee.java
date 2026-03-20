package com.docapost.tournee.domain.events;

import com.docapost.tournee.domain.model.LivreurId;
import com.docapost.tournee.domain.model.TourneeId;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Domain Event — TourneeChargee
 * Emis lors du chargement de la tournee (avant le demarrage).
 * Publie le nombre de colis charges.
 *
 * Consommateurs : BC Supervision
 *
 * Source : Ubiquitous Language DocuPost — invariant US-001 Scenario 1.
 */
public record TourneeChargee(
        TourneeId tourneeId,
        LivreurId livreurId,
        LocalDate date,
        int nombreColis,
        Instant horodatage
) implements DomainEvent {

    public static TourneeChargee of(
            TourneeId tourneeId,
            LivreurId livreurId,
            LocalDate date,
            int nombreColis
    ) {
        return new TourneeChargee(tourneeId, livreurId, date, nombreColis, Instant.now());
    }
}
