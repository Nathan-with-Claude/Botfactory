package com.docapost.supervision.domain.model;

/**
 * Enum domaine — Statut d'une instruction (BC-03 Supervision — US-014)
 *
 * Cycle de vie : ENVOYEE → EXECUTEE | REFUSEE
 *
 * Source : US-014 — "Envoyer une instruction structurée à un livreur"
 */
public enum StatutInstruction {
    /** L'instruction a été envoyée, en attente d'exécution par le livreur. */
    ENVOYEE,
    /** Le livreur a exécuté l'instruction (US-015). */
    EXECUTEE,
    /** Le livreur a refusé l'instruction (US-015). */
    REFUSEE
}
