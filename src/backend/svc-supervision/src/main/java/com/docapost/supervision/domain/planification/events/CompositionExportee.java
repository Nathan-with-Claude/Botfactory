package com.docapost.supervision.domain.planification.events;

import java.time.Instant;

/**
 * CompositionExportee — Domain Event BC-07
 *
 * Émis quand le responsable logistique exporte en CSV la composition d'une tournée (US-028).
 * Permet la traçabilité des exports dans l'historique de la TourneePlanifiee.
 *
 * Invariant : cet événement n'entraîne aucun changement d'état sur la TourneePlanifiee
 * (opération de lecture pure — traçabilité uniquement).
 *
 * Source : US-028
 */
public record CompositionExportee(
        String tourneePlanifieeId,
        String codeTms,
        String superviseurId,
        Instant exporteeLe
) {}
