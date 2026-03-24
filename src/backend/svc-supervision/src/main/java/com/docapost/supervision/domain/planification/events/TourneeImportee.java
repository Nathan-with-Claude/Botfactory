package com.docapost.supervision.domain.planification.events;

import java.time.Instant;

/**
 * TourneeImportee — Domain Event BC-07
 *
 * Émis quand une tournée est importée depuis le TMS dans le plan du jour.
 * Dans le MVP, cet événement est généré par le DevDataSeeder.
 *
 * Source : US-021
 */
public record TourneeImportee(
        String tourneePlanifieeId,
        String codeTms,
        int nbColis,
        Instant importeeLe
) {}
