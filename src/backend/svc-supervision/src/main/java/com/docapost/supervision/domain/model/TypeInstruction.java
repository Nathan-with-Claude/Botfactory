package com.docapost.supervision.domain.model;

/**
 * Enum domaine — Type d'instruction (BC-03 Supervision — US-014)
 *
 * Types normalisés d'instructions qu'un superviseur peut envoyer à un livreur.
 * Invariant : une instruction REPROGRAMMER requiert obligatoirement un creneauCible.
 *
 * Source : US-014 — "Envoyer une instruction structurée à un livreur"
 */
public enum TypeInstruction {
    /** Traiter ce colis en priorité avant les suivants. */
    PRIORISER,
    /** Annuler la tentative de livraison pour ce colis. */
    ANNULER,
    /** Reprogrammer la livraison sur un nouveau créneau (creneauCible obligatoire). */
    REPROGRAMMER
}
