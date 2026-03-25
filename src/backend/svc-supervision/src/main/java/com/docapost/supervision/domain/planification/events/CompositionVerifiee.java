package com.docapost.supervision.domain.planification.events;

import java.time.Instant;

/**
 * CompositionVerifiee — Domain Event BC-07
 *
 * Émis quand Laurent Renaud valide explicitement la composition d'une tournée (US-022).
 * Contient l'horodatage et l'identifiant du responsable logistique.
 *
 * Source : US-022
 */
public record CompositionVerifiee(
        String tourneePlanifieeId,
        String codeTms,
        String superviseurId,
        Instant verifieeLe
) {}
