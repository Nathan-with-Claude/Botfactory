package com.docapost.tournee.domain.model;

/**
 * Value Object — Motif normalisé d'un échec de livraison.
 * Source : "Chaque livreur a ses propres abréviations." (Pierre)
 *           → Motifs normalisés imposés pour exploitabilité analytique.
 *
 * Ubiquitous Language : Motif de non-livraison.
 * BC-01 Orchestration de Tournée — invariant US-005.
 */
public enum MotifNonLivraison {
    /** Destinataire absent au moment de la livraison. */
    ABSENT,
    /** Accès au lieu de livraison impossible (portail, interphone, etc.). */
    ACCES_IMPOSSIBLE,
    /** Destinataire présent mais refuse la livraison. */
    REFUS_CLIENT,
    /** Créneau de livraison dépassé (contrainte horaire non respectée). */
    HORAIRE_DEPASSE
}
