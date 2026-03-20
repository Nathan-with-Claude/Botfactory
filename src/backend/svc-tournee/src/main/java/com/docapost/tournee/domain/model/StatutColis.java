package com.docapost.tournee.domain.model;

/**
 * Value Object (enum) — Statut normalise d'un Colis.
 * Transitions autorisees : A_LIVRER → LIVRE | A_LIVRER → ECHEC → A_REPRESENTER
 *
 * Source : "Chaque colis doit avoir un statut normalise et horodate." (M. Garnier)
 */
public enum StatutColis {
    A_LIVRER,
    LIVRE,
    ECHEC,
    A_REPRESENTER
}
