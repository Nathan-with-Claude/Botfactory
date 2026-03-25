package com.docapost.tournee.domain.model;

/**
 * Value Object (enum) — Statut du cycle de vie d'une Tournee.
 * Transitions autorisees : CHARGEE → DEMARREE → CLOTUREE
 */
public enum StatutTournee {
    CHARGEE,
    DEMARREE,
    CLOTUREE
}
