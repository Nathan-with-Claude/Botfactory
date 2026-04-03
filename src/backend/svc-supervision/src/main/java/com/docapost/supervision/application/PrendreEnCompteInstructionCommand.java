package com.docapost.supervision.application;

/**
 * Command — Prendre en compte une instruction par le livreur (BC-03 Supervision — US-015/016).
 *
 * Déclenché quand le livreur appuie sur "VOIR" dans le bandeau M-06 (US-016).
 * Transition : ENVOYEE → PRISE_EN_COMPTE.
 *
 * Source : US-015 — "Suivre l'état d'exécution d'une instruction envoyée à un livreur"
 */
public record PrendreEnCompteInstructionCommand(
        String instructionId,
        String livreurId
) {}
