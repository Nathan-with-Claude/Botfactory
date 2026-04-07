package com.docapost.supervision.domain.planification.events;

import java.time.Instant;

/**
 * DesaffectationEnregistree — Domain Event BC-07
 *
 * Émis quand le livreur est retiré d'une tournée planifiée (US-050).
 * La désaffectation remet la tournée en statut NON_AFFECTEE.
 *
 * Source : US-050
 */
public record DesaffectationEnregistree(
        String tourneePlanifieeId,
        String codeTms,
        String livreurIdRetire,
        String livreurNomRetire,
        String superviseurId,
        Instant desaffecteeLe
) {}
