package com.docapost.supervision.domain.planification.events;

import java.time.Instant;

/**
 * AffectationEnregistree — Domain Event BC-07
 *
 * Émis quand un livreur et un véhicule sont affectés à une tournée planifiée (US-023).
 *
 * Source : US-023
 */
public record AffectationEnregistree(
        String tourneePlanifieeId,
        String codeTms,
        String livreurId,
        String livreurNom,
        String vehiculeId,
        String superviseurId,
        Instant affecteeLe
) {}
