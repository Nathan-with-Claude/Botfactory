package com.docapost.tournee.domain.model;

/**
 * Value Object — Disposition d'un colis en échec de livraison.
 * Décision prise sur le devenir du colis lorsque la livraison échoue.
 *
 * Obligatoire si le statut du Colis est "échec" (invariant Tournée #6).
 * Source Ubiquitous Language : Disposition.
 * BC-01 Orchestration de Tournée.
 */
public enum Disposition {
    /** Nouvelle tentative de livraison lors d'une prochaine tournée. */
    A_REPRESENTER,
    /** Dépôt du colis chez un tiers identifié (voisin, gardien). */
    DEPOT_CHEZ_TIERS,
    /** Retour du colis au dépôt de départ. */
    RETOUR_DEPOT
}
