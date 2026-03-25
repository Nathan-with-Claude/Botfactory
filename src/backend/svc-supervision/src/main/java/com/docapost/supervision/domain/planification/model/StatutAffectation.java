package com.docapost.supervision.domain.planification.model;

/**
 * StatutAffectation — Enum du statut d'affectation d'une tournée planifiée (BC-07)
 *
 * Transitions possibles :
 * - NON_AFFECTEE → AFFECTEE (US-023 : AffecterLivreurVehicule)
 * - AFFECTEE → LANCEE (US-024 : LancerTournee)
 *
 * Source : US-021, US-023, US-024
 */
public enum StatutAffectation {
    /** Tournée importée depuis le TMS, sans livreur ni véhicule affectés. */
    NON_AFFECTEE,

    /** Livreur et véhicule affectés — prête à être lancée. */
    AFFECTEE,

    /** Tournée lancée — visible dans l'application mobile du livreur. */
    LANCEE
}
