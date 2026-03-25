package com.docapost.supervision.domain.model;

/**
 * Enum — Statut d'une tournée dans la vue supervision (US-011).
 *
 * EN_COURS   : tournée active, dans les délais normaux
 * A_RISQUE   : tournée active mais avec un risque de retard détecté (US-013)
 * CLOTUREE   : tournée terminée (tous les colis traités)
 *
 * Source : BC-03 Supervision — ubiquitous language.
 */
public enum StatutTourneeVue {
    EN_COURS,
    A_RISQUE,
    CLOTUREE
}
